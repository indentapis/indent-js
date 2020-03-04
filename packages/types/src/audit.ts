export type Actor = {
  id?: string // The IRN for the resource
  kind?: string // The IRN for the kind of resource
  email?: string // The email for the Actor
  altIds?: string[] // The IRNs for alternate identifiers (e.g. email)
  displayName?: string // The display name of the resource
}

export type Resource = {
  id?: string // The IRN for the resource
  kind?: string // The IRN for the kind of resource
  altIds?: string[] // The IRNs for alternate identifiers (e.g. email)
  displayName?: string // The display name of the resource
}

export type Event = {
  // Required
  event: string

  // Optional
  id?: string
  actor?: Actor
  timestamp?: string
  sessionId?: string
  externalId?: string
  resources?: Resource[]
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
