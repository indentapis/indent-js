import { approval } from '../src'

describe.skip('@indent/approvals', () => {
  describe('await approval', () => {
    test('basic', async () => {
      const ok = true
      
      try { 
        await approval({
          search: 'Readonly Admin',
          reason: 'to view system logs',
        })
      } catch (err) {
        ok = false
      }

      return expect(ok).toBe(true)
    })
  })
})
