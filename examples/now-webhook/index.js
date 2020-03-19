import { json, send } from 'micro'
import { verify } from '@indent/webhook'

export default async function(req, res) {
  const body = await json(req)

  await verify({
    secret: process.env.INDENT_SIGNING_SECRET,
    timestamp: req.headers['x-indent-timestamp'],
    signature: req.headers['x-indent-signature'],
    body
  })

  const { events } = body

  await Promise.all(
    events.map(({ event, actor, resources }) => {
      switch (event) {
        case 'access/request/approved':
          return grantPermission({
            actor,
            resources
          })
        case 'access/grant/revoked':
          return revokePermission({
            actor,
            resources
          })
        default:
          return Promise.resolve()
      }
    })
  )

  send(res, 200, 'ok')
}

async function grantPermission({ actor, resources }) {
  const { id } = actor

  // - Lookup user ID from actor id (e.g. Slack user id)
  // - Grant them permission(s)
}

async function revokePermission({ actor, resources }) {
  const { id } = actor

  // - Lookup user ID from actor id (e.g. Slack user id)
  // - Revoke their permission(s)
}
