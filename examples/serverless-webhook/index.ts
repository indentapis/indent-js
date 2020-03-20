import { APIGatewayProxyHandler } from 'aws-lambda'
import { verify } from '@indent/webhook'
import * as types from '@indent/types'

export const handle: APIGatewayProxyHandler = async function handle(event) {
  const body = JSON.parse(event.body)

  await verify({
    secret: process.env.INDENT_SIGNING_SECRET,
    timestamp: event.headers['x-indent-timestamp'],
    signature: event.headers['x-indent-signature'],
    body
  })

  const { events } = body

  await Promise.all(
    events.map((auditEvent: types.Event) => {
      let { event } = auditEvent

      switch (event) {
        case 'access/request/approved':
          return grantPermission(auditEvent)
        case 'access/grant/revoked':
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

async function grantPermission(auditEvent: types.Event) {
  const { event, actor, resources } = auditEvent

  console.log({ event, actor, resources })

  // - Lookup user ID from actor id (e.g. Slack user id)
  // - Grant them permission(s)
}

async function revokePermission(auditEvent: types.Event) {
  const { event, actor, resources } = auditEvent

  console.log({ event, actor, resources })

  // - Lookup user ID from actor id (e.g. Slack user id)
  // - Revoke their permission(s)
}
