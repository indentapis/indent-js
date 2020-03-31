import { APIGatewayProxyHandler } from 'aws-lambda'
import { verify } from '@indent/webhook'
import * as types from '@indent/types'
import * as AWS from 'aws-sdk'

AWS.config.update({ region: process.env.AWS_REGION })

const iam = new AWS.IAM({ apiVersion: '2010-05-08' })

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
  const { labels = {} } = actor
  const { arn } = labels

  let groupForResource = 's3-sensitive-access' // derive from resources
  let result = await iam
    .addUserToGroup({
      GroupName: groupForResource,
      UserName: arn
    })
    .promise()

  console.log({ event, actor, resources, result })
}

async function revokePermission(auditEvent: types.Event) {
  const { event, actor, resources } = auditEvent
  const { labels = {} } = actor
  const { arn } = labels

  console.log({ event, actor, resources })

  let groupForResource = 's3-sensitive-access' // derive from resources
  let result = await iam
    .addUserToGroup({
      GroupName: groupForResource,
      UserName: arn
    })
    .promise()

  console.log({ event, actor, resources, result })
}
