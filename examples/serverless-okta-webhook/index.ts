import { APIGatewayProxyHandler } from 'aws-lambda'
// import { verify } from '@indent/webhook'
import * as Indent from '@indent/types'
import axios from 'axios'

export const handle: APIGatewayProxyHandler = async function handle(event) {
  const body = JSON.parse(event.body)

  try {
    console.warn('@indent/webhook.verify(): skipped')
    // await verify({
    //   secret: process.env.INDENT_SIGNING_SECRET,
    //   timestamp: event.headers['X-Indent-Timestamp'],
    //   signature: event.headers['X-Indent-Signature'],
    //   body
    // })
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

  console.log(JSON.stringify(events, null, 2))

  await Promise.all(
    events.map((auditEvent: Indent.Event) => {
      let { actor, event, resources } = auditEvent

      console.log(
        `@indent/webhook: ${event} { actor: ${
          actor.id
        }, resources: ${JSON.stringify(resources.map(r => r.id))} }`
      )

      switch (event) {
        case 'access/grant':
          return grantPermission(auditEvent)
        case 'access/revoke':
          return revokePermission(auditEvent)
        default:
          return Promise.resolve()
      }
    })
  )

  return {
    statusCode: 200,
    body: 'ok'
  }
}

const OKTA_TENANT = process.env.OKTA_TENANT || 'indent.okta.com'
const OKTA_TOKEN = process.env.OKTA_TOKEN

async function addUserToGroup({ user, group }) {
  return await axios({
    method: 'put',
    url: `https://${OKTA_TENANT}/api/v1/groups/${group}/users/${user}`,
    headers: {
      Accept: 'application/json',
      Authorization: `SSWS ${OKTA_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
}

async function removeUserFromGroup({ user, group }) {
  return await axios({
    method: 'delete',
    url: `https://${OKTA_TENANT}/api/v1/groups/${group}/users/${user}`,
    headers: {
      Accept: 'application/json',
      Authorization: `SSWS ${OKTA_TOKEN}`,
      'Content-Type': 'application/json'
    }
  })
}

const okta = { addUserToGroup, removeUserFromGroup }

async function grantPermission(auditEvent: Indent.Event) {
  const { event, actor, resources } = auditEvent
  const user = getOktaIdFromResources(resources, 'user')
  const group = getOktaIdFromResources(resources, 'group')

  let result = await okta.addUserToGroup({ user, group })

  console.log({ event, actor, resources, result })
}

async function revokePermission(auditEvent: Indent.Event) {
  const { event, actor, resources } = auditEvent
  const user = getOktaIdFromResources(resources, 'user')
  const group = getOktaIdFromResources(resources, 'group')

  let result = await okta.removeUserFromGroup({ user, group })

  console.log({ event, actor, resources, result })
}

function getOktaIdFromResources(
  resources: Indent.Resource[],
  kind: string
): string {
  return resources
    .filter(r => r.kind && r.kind.toLowerCase().includes(kind.toLowerCase()))
    .map(r => {
      if (r.labels && r.labels.oktaId) {
        return r.labels.oktaId
      }

      return r.id
    })[0]
}