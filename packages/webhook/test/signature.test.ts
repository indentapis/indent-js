import { sign, verify, getSignaturePayload } from '../src'

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

  test('smoke test - verify with static', async () => {
    let events = [
      {
        event: 'access/grant',
        timestamp: '2020-05-01T07:00:00Z'
      }
    ]

    let error

    try {
      await verify({
        secret: 'secret_123',
        signature:
          'c27f187960625ebccc33336030b071dac1d54b1e98d9e27fe5452ee00c935fb0',
        timestamp: events[0].timestamp,
        body: JSON.stringify({ events })
      })
    } catch (err) {
      error = err
    }

    expect(error).toBeFalsy()
  })

  test('smoke test - verify with static, via headers', async () => {
    let events = [
      {
        event: 'access/grant',
        timestamp: '2020-05-01T07:00:00Z'
      }
    ]

    let error

    try {
      await verify({
        secret: 'secret_123',
        body: JSON.stringify({ events }),
        headers: {
          'x-indent-signature':
            'c27f187960625ebccc33336030b071dac1d54b1e98d9e27fe5452ee00c935fb0',
          'X-Indent-Timestamp': events[0].timestamp
        }
      })
    } catch (err) {
      error = err
    }

    expect(error).toBeFalsy()
  })

  test('smoke test - verify should error', async () => {
    let events = [
      {
        event: 'access/grant',
        timestamp: '2020-05-01T07:00:00Z'
      }
    ]

    let error

    try {
      await verify({
        secret: 'secret_123',
        signature: '123',
        timestamp: events[0].timestamp,
        body: JSON.stringify({ events })
      })
    } catch (err) {
      error = err
    }

    expect(error).toBeTruthy()
  })
})
