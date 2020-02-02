import { NoopTransport } from '../src/transports'

describe('NoopTransport', () => {
  describe('constructor()', () => {
    test('write()', () => {
      const port = new NoopTransport()

      return port.write({}).then(data => expect(data.error.code).toBe('noop'))
    })
  })
})
