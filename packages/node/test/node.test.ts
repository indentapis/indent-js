import { audit } from '../src'

jest.useFakeTimers()

describe('AuditAPI', () => {
  describe('write()', () => {
    test('error, missing dsn', () => {
      return expect(() => audit.write({}, { flushImmediately: true })).toThrow()
    })
  })
})
