import { Event, Plugin, PluginClass, Processor } from '@indent/types'

export { TimestampPlugin } from './timestamp'

let EXISTING_PLUGINS: { [key: string]: Plugin } = {}

export function processEventWithPlugins(
  plugins: PluginClass<Plugin>[]
): Processor {
  return (event): Event => {
    let processedEvent = { ...event }

    plugins.forEach(plugin => {
      if (!EXISTING_PLUGINS[plugin.id]) {
        EXISTING_PLUGINS[plugin.id] = new plugin()
      }

      processedEvent = EXISTING_PLUGINS[plugin.id].processEvent(
        processedEvent
      ) as Event
    })

    return processedEvent
  }
}
