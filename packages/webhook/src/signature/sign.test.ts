import { sign } from './sign'

let exampleRequest = {
  method: 'POST',
  host: 'example123.execute-api.us-west-2.amazonaws.com',
  path: '/webhook/dev',
  headers: {
    Host: 'example123.execute-api.us-west-2.amazonaws.com',
    'X-Indent-Timestamp': '2020-05-02T06:10:30Z'
  },
  body: { events: [{ hello: true }] }
}

describe('sign', () => {
  test('basic', () =>
    expect(
      sign('secret_123', {
        method: 'POST',
        host: 'example123.execute-api.us-west-2.amazonaws.com',
        path: '/webhook/dev',
        headers: {
          Host: 'example123.execute-api.us-west-2.amazonaws.com',
          'X-Indent-Timestamp': '2020-05-02T06:10:30Z'
        },
        body: { events: [{ hello: true }] }
      })
    ).toEqual(
      '1vb560f0888921e7f6d53fbbaae91dc6f2b6b5839c1e35f3e01407016fd94cc6a4'
    ))

  test('different secrets should fail', () =>
    expect(sign('secret1', exampleRequest)).not.toEqual(
      sign('secret2', exampleRequest)
    ))
})

describe('time', () => {
  test('invalid timestamp', () =>
    expect(sign('secret1', exampleRequest)).toEqual(
      '1v3baa286ece7ade41e94b2bbb13cfe4f567f00794e34c8eda509fd97d0512aef8'
    ))

  test('different times should fail', () =>
    expect(sign('secret1', exampleRequest)).not.toEqual(
      sign('secret1', { ...exampleRequest, timestamp: '2020-05-02T06:10:31Z' })
    ))
})
