const { json, send } = require('micro')
const { verify } = require('@indent/webhook')

module.exports = async function(req, res) {
  const body = await json(req)

  await verify({
    secret: process.env.INDENT_WEBHOOK_SECRET,
    headers: req.headers,
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
  // - Grab labels from actor (e.g. AWS ARN)
  // - Grant them permission(s)
}

async function revokePermission({ event, actor, resources }) {
  // - Grab labels from actor (e.g. AWS ARN)
  // - Revoke their permission(s)
}
