import { Processor } from './processor'

/** Plugin Class Interface */
export interface PluginClass<T> {
  new (...args: any[]): T
  /**
   * The name of the plugin.
   */
  id: string
}

/** Plugin interface */
export interface Plugin {
  /**
   * Returns {@link PluginClass.id}
   */
  name: string

  /**
   * Process a single event.
   */
  processEvent: Processor
}
