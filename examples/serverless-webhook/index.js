const { verify } = require('@indent/webhook')

exports.handle = async function handle(event, context, cb) {
  const body = JSON.parse(event.body)

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

  return {
    statusCode: 200,
    body: 'ok'
  }
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
