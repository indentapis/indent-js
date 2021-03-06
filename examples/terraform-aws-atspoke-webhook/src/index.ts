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
          let { event } = auditEvent

          console.log(`@indent/webhook: ${event}`)
          console.log(JSON.stringify(auditEvent))

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
    throw new Error('getAtspokeWhoami: not found')
  }

  let { user: requester } = atspokeUser

  return {
    requester,
    subject,
    body

    /** 
    requestType: '<request-type-for-access-changes>',
    requestTypeInfo: {
      answeredFields: [
        // {
        //   // reason
        //   fieldId: '<field-for-reason>',
        //   value: auditEvent.reason
        // },
        // duration
        auditEvent.event === 'access/grant' && {
          fieldId: '<field-for-duration>',
          value: dur(auditEvent)
        },
        // approver_1_email
        auditEvent.event === 'access/grant' && {
          fieldId: '<field-for-approver>',
          value: allEvents.filter(e => e.event === 'access/approve')?.[0]?.actor
            ?.email
        }
      ].filter(Boolean)
    }
    */
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

  let metaLabels = auditEvent?.meta?.labels || {}
  let actionLabel = auditEvent.event === 'access/grant' ? 'granted' : 'revoked'
  let indentURL = `https://indent.com/spaces/${INDENT_SPACE_NAME}/workflows/${metaLabels['indent.com/workflow/origin/id']}/runs/${metaLabels['indent.com/workflow/origin/run/id']}`

  return `
${allEvents
  .filter(e => e.event === 'access/request')
  .map(e => `<b>Request Reason</b> ${e.reason}`)}

${allEvents
  .filter(e => e.event != auditEvent.event && e.event === 'access/approve')
  .map(
    e =>
      `${e?.actor?.displayName}(${
        e?.actor?.email
      }) approved access to ${getDisplayName(targetActor)} (${
        targetActor?.email
      }) for ${targetResource?.kind} ${getDisplayName(
        targetResource
      )}${durationText(e)}.`
  )
  .join('\n')}

${auditEvent?.actor?.displayName} (${
    auditEvent?.actor?.email
  }) ${actionLabel} access to ${getDisplayName(targetActor)} (${
    targetActor?.email
  }) for ${targetResource?.kind} ${getDisplayName(targetResource)}.

View Workflow in Indent →
${indentURL}`
}

function durationText(event: types.Event) {
  return `${
    !event.meta?.labels?.['indent.com/time/duration'] ||
    event.meta?.labels?.['indent.com/time/duration'] === '-1ns'
      ? ' '
      : ' for '
  }${dur(event)}`
}

function dur(event: types.Event) {
  return !event.meta?.labels?.['indent.com/time/duration'] ||
    event.meta?.labels?.['indent.com/time/duration'] === '-1ns'
    ? 'until revoked'
    : event.meta?.labels?.['indent.com/time/duration']
}
