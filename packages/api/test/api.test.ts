import { IndentAPI } from '../src'

describe('@indent/api', () => {
  describe('IndentAPI', () => {
    test('init', () => {
      const client = new IndentAPI()

      return expect(client).not.toBeUndefined()
    })

    test('petition', async () => {
      const indent = new IndentAPI()
      let err

      try {
        await indent.petition.create()
      } catch (_err) {
        err = _err
      }

      return expect(err).toBeTruthy()
    })
  })
})
