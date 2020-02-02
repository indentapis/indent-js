import { HttpTransport } from '../src/transports'

describe('HttpTransport', () => {
  describe('constructor()', () => {
    test('write()', () => {
      const port = new HttpTransport()

      return port.write({}).then(data => expect(data.error.code).toBe('noop'))
    })
  })
})
