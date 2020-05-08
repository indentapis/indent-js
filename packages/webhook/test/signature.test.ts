import { sign, getSignaturePayload } from '../src'

describe('signature', () => {
  test('smoke test - static equals', async () => {
    let events = [
      {
        event: 'access/grant',
        timestamp: '2020-05-01T07:00:00Z'
      }
    ]
    let payload = getSignaturePayload({
      timestamp: events[0].timestamp,
      body: JSON.stringify({ events })
    })

    let sig = await sign({
      secret: 'secret_123',
      payload
    })

    return expect(sig).toBe(
      'c27f187960625ebccc33336030b071dac1d54b1e98d9e27fe5452ee00c935fb0'
    )
  })
})
