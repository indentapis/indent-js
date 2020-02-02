import { BrowserActorPlugin } from '../src/plugins'

describe('BrowserActorPlugin', () => {
  describe('processEvent()', () => {
    test('missing id, use anonymous default', () => {
      const plugin = new BrowserActorPlugin({
        getGlobalScope: () => ({ localStorage: {} })
      })

      const processedEvent = plugin.processEvent({})

      return expect(processedEvent.actor.id).toBe('irn:indent:id:anonymous')
    })
  })
})
