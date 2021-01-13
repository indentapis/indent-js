import { APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'
import { verify } from '@indent/webhook'
import * as types from '@indent/types'
import axios from 'axios'

const INDENT_WEBHOOK_SECRET = process.env.INDENT_WEBHOOK_SECRET || ''
const INDENT_SPACE_NAME = process.env.INDENT_SPACE_NAME || ''
const ATSPOKE_API_KEY = process.env.ATSPOKE_API_KEY || ''
const ATSPOKE_API_HOST =
  process.env.ATSPOKE_API_HOST || 'https://api.askspoke.com'

export const handle: APIGatewayProxyHandler = async function handle(event) {
  const body = JSON.parse(event.body)

  try {
    await verify({
      secret: INDENT_WEBHOOK_SECRET,
      headers: event.headers,
      body: event.body
    })
  } catch (err) {
    console.error('@indent/webhook.verify(): failed')
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: { message: err.message } })
    }
  }

  const { events } = body

  console.log(`@indent/webhook: received ${events.length} events`)

  const responses = (
    await Promise.all(
      events.map(
        (auditEvent: types.Event): Promise<APIGatewayProxyResult> => {
          let { actor, event, resources } = auditEvent

          console.log(
            `@indent/webhook: ${event} { actor: ${
              actor.id
            }, resources: ${JSON.stringify(resources.map(r => r.id))} }`
          )

          switch (event) {
            case 'access/grant':
              return grantPermission(auditEvent, events)
            case 'access/revoke':
              return revokePermission(auditEvent, events)
            default:
              return Promise.resolve({
                statusCode: 200,
                body: 'Unknown event'
              })
          }
        }
      )
    )
  ).filter(
    (r: APIGatewayProxyResult) => r.statusCode !== 200
  ) as APIGatewayProxyResult[]

  if (responses.length > 0) {
    return responses[0]
  }

  return {
    statusCode: 200,
    body: '{}'
  }
}

type AtspokeRequest = {
  subject: string
  requester: string

  body?: string
  team?: string
  owner?: string
  privacyLevel?: 'private' | 'public'
  requestTypeInfo?: AtspokeRequestTypeInfo
  requestType?: string
}

type AtspokeRequestTypeInfo = {
  answeredFields: {
    fieldId: string
    value: string
  }[]
}

type AtspokeUser = {
  org: string
  user: string
  role: string
  status: string
  displayName?: string
}

async function sendAtspokeRequest(request: AtspokeRequest) {
  return await axios
    .post(`${ATSPOKE_API_HOST}/api/v1/requests`, request, {
      headers: { 'Api-Key': ATSPOKE_API_KEY }
    })
    .then(r => r.data)
}

async function getAtspokeWhoami(): Promise<AtspokeUser> {
  return await axios
    .get(`${ATSPOKE_API_HOST}/api/v1/whoami`, {
      headers: { 'Api-Key': ATSPOKE_API_KEY }
    })
    .then(r => r.data)
}

async function grantPermission(
  auditEvent: types.Event,
  allEvents: types.Event[]
): Promise<APIGatewayProxyResult> {
  let result = await sendAtspokeRequest(
    await prepareRequest(auditEvent, allEvents)
  )

  console.log({ result })
  return {
    statusCode: 200,
    body: '{}'
  }
}

async function revokePermission(
  auditEvent: types.Event,
  allEvents: types.Event[]
): Promise<APIGatewayProxyResult> {
  let result = await sendAtspokeRequest(
    await prepareRequest(auditEvent, allEvents)
  )

  console.log({ result })
  return {
    statusCode: 200,
    body: '{}'
  }
}

async function prepareRequest(
  auditEvent: types.Event,
  allEvents: types.Event[]
): Promise<AtspokeRequest> {
  let targetActor = getTargetActor(auditEvent)
  let targetResource = getTargetResource(auditEvent)
  let targetActorLabel = getDisplayName(targetActor)
  let targetResourceLabel = getDisplayName(targetResource)
  let actionLabel = auditEvent.event === 'access/grant' ? 'Granted' : 'Revoked'
  let subject = `${targetActorLabel} / ${targetResource.kind} ${targetResourceLabel} · Access ${actionLabel}`
  let body = getBody(auditEvent, allEvents)
  let atspokeUser = await getAtspokeWhoami()

  if (!atspokeUser) {
    throw new Error('getAtspokeWhoami: empty')
  }

  let { user: requester } = atspokeUser

  console.log({ atspokeUser })

  return {
    requester,
    subject,
    body
  } as AtspokeRequest
}

function getDisplayName(r: types.Resource): string {
  return (
    r.displayName ||
    (r.labels ? r.labels['indent.com/profile/name/preferred'] : '') ||
    r.id
  )
}

function getTargetActor(auditEvent: types.Event): types.Resource {
  return auditEvent?.resources?.filter(r => r.kind?.includes('user'))[0] || {}
}

function getTargetResource(auditEvent: types.Event): types.Resource {
  return auditEvent?.resources?.filter(r => !r.kind?.includes('user'))[0] || {}
}

function getBody(auditEvent: types.Event, allEvents: types.Event[]) {
  let targetActor = getTargetActor(auditEvent)
  let targetResource = getTargetResource(auditEvent)
  let timestampLabel = new Date(auditEvent.timestamp).toString()

  let metaLabels = auditEvent?.meta?.labels || {}
  let actionLabel = auditEvent.event === 'access/grant' ? 'granted' : 'revoked'
  let indentURL = `https://indent.com/spaces/${INDENT_SPACE_NAME}/workflows/${metaLabels['indent.com/workflow/origin/id']}/runs/${metaLabels['indent.com/workflow/origin/run/id']}`

  return `
<img style="margin:0;border:0;padding:0;display:block;outline:none;"
src="https://indent.com/static/indent_text_black.png" width="120" height="34" />

${allEvents
  .filter(e => e.event != auditEvent.event)
  .map(
    e => `
<p>
  <b>${e?.actor?.displayName}</b> (<a href="mailto:${
      e?.actor?.email
    }" target="_blank">${
      e?.actor?.email
    }</a>) approved access to <b>${getDisplayName(
      targetActor
    )}</b> (<a href="mailto:${targetActor?.email}" target="_blank">${
      targetActor?.email
    }</a>) for <b>${targetResource?.kind} ${getDisplayName(targetResource)}</b>.
</p>`
  )
  .join('\n')}

<p>
  <b>${auditEvent?.actor?.displayName}</b> (<a href="mailto:${
    auditEvent?.actor?.email
  }" target="_blank">${
    auditEvent?.actor?.email
  }</a>) ${actionLabel} access to <b>${getDisplayName(
    targetActor
  )}</b> (<a href="mailto:${targetActor?.email}" target="_blank">${
    targetActor?.email
  }</a>) for <b>${targetResource?.kind} ${getDisplayName(targetResource)}</b>.
</p>
<p style="font-size:11px">
<a href="${indentURL}" target="_blank">View Workflow in Indent &rarr;</a>
</p>
<p style="font-size:11px">${timestampLabel}</p>
`
}
