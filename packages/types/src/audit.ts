export type Resource = {
  id?: string // The identifier for the resource
  kind?: string // The kind of the resource
  email?: string // The email address for the resource
  altIds?: string[] // The alternate identifiers for the resource
  displayName?: string // The display name for the resource
  labels?: ResourceLabels // The labels for the Resource
}

export type ResourceLabels = {
  [key: string]: string
}

export type Event = {
  // Required
  event: string

  // Optional
  id?: string
  actor?: Resource
  reason?: string
  timestamp?: string
  sessionId?: string
  externalId?: string
  resources?: Resource[]
  meta?: EventMeta
}

export type EventMeta = {
  labels?: EventLabels
}

export type EventLabels = {
  [key: string]: string
}

export type WriteRequest = {
  inputName: string
  events: Event[]
}

export interface IAuditAPIOptions {
  dsn?: string
  debug?: boolean
  fetch?: (
    input: RequestInfo,
    init?: RequestInit | undefined
  ) => Promise<Response>
}

export interface IWriteOptions {
  flushImmediately?: boolean
}

export interface IAuditAPI {
  init: (options: IAuditAPIOptions) => void
  write: (event: Event, options?: IWriteOptions) => void
}
