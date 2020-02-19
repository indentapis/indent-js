import { Event } from './audit'

/**
 * Event processors are used to change the event before it will be send.
 */
export type Processor = (event: Event) => Event
