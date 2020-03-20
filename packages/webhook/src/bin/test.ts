import * as types from '@indent/types'
import { sign } from '../index'
import fetch from 'node-fetch'
import arg from 'arg'

// indent-webhook-test
const args = arg({
  '--url': String
})

let [url = ''] = args._

if (!url) {
  url = args['--url'] || ''
}

if (!url) {
  console.log(
    `
Usage: indent-webhook-test --url=[url] <url>

  --url <url>    URL to work with for testing
`.trim()
  )

  process.exit(1)
}

let testSecret = 'test_secret_0zbtXMScgECutqG'
let timestamp = new Date().toISOString()
let body = JSON.stringify({
  events: [
    {
      event: 'access/request/approved',
      actor: { id: 'dennis-developer', email: 'dennis@example.com' },
      resources: [
        {
          kind: 'tenant',
          id: 'example-inc'
        },
        {
          kind: 'access/request#approver',
          id: 'mary-manager'
        }
      ]
    }
  ] as types.Event[]
})

sign({
  secret: testSecret,
  payload: body
}).then(signature =>
  fetch(url, {
    method: 'post',
    headers: {
      'X-Indent-Timestamp': timestamp,
      'X-Indent-Signature': signature
    },
    body
  }).catch(err => {
    console.error(err)
  })
)

setTimeout(() => {
  timestamp = new Date().toISOString()
  body = JSON.stringify({
    events: [
      {
        event: 'access/grant/revoked',
        actor: { id: 'dennis-developer', email: 'dennis@example.com' },
        resources: [
          {
            kind: 'tenant',
            id: 'example-inc'
          }
        ]
      }
    ] as types.Event[]
  })

  sign({
    secret: testSecret,
    payload: body
  })
    .then(signature =>
      fetch(url, {
        method: 'post',
        headers: {
          'X-Indent-Timestamp': timestamp,
          'X-Indent-Signature': signature
        },
        body
      })
    )
    .catch(err => {
      console.error(err)
    })
}, 1000)
