const { json, send } = require('micro')
const { verify } = require('@indent/webhook')

module.exports = async function(req, res) {
  const body = await json(req)

  await verify({
    secret: process.env.INDENT_WEBHOOK_SECRET,
    timestamp: req.headers['X-Indent-Timestamp'],
    signature: req.headers['X-Indent-Signature'],
    body
  })

  const { events } = body

  await Promise.all(
    events.map(auditEvent => {
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

  send(res, 200, 'ok')
}

async function grantPermission({ event, actor, resources }) {
  const { id } = actor

  console.log({ event, actor, resources })

  // - Lookup user ID from actor id (e.g. Slack user id)
  // - Grant them permission(s)
}

async function revokePermission({ event, actor, resources }) {
  const { id } = actor

  console.log({ event, actor, resources })

  // - Lookup user ID from actor id (e.g. Slack user id)
  // - Revoke their permission(s)
}
