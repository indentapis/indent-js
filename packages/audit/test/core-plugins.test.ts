import { processEventWithPlugins } from '../src/plugins'
import { Plugins } from '../src'

describe('CorePlugins', () => {
  describe('processEventWithPlugins', () => {
    test('add timestamp', () => {
      const event = {}
      const processor = processEventWithPlugins(Object.values(Plugins))
      const processedEvent = processor(event)

      return expect(processedEvent.timestamp).not.toBeUndefined()
    })
  })
})
