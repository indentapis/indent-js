import { getAccessHref } from '../src'

describe('@indent/link', () => {
  describe('getAccessHref', () => {
    test('basic', () => {
      const href = getAccessHref({
        search: 'Readonly Admin',
        reason: 'to view system logs',
      })

      return expect(href).not.toBeUndefined()
    })
  })
})
