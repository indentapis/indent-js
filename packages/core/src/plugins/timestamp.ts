import { Event, Plugin } from '@indent/types'

export class TimestampPlugin implements Plugin {
  /**
   * @inheritDoc
   */
  public name: string = TimestampPlugin.id

  /**
   * @inheritDoc
   */
  public static id: string = 'Timestamp'

  processEvent(event: Event): Event {
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString()
    }

    return event
  }
}
