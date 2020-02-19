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

    test('use analytics.js default', () => {
      const plugin = new BrowserActorPlugin({
        getGlobalScope: () => ({ localStorage: { ajs_user_id: '123' } })
      })

      const processedEvent = plugin.processEvent({})

      return expect(processedEvent.actor.id).toBe('123')
    })
  })
})
