export type Actor = {
  id?: string // The IRN for the resource
  kind?: string // The IRN for the kind of resource
  email?: string // The email for the Actor
  altIds?: string[] // The IRNs for alternate identifiers (e.g. email)
  displayName?: string // The display name of the resource
  labels?: ActorLabels // The labels for the Actor
}

export type ActorLabels = {
  [key: string]: string
}

export type Resource = {
  id?: string // The IRN for the resource
  kind?: string // The IRN for the kind of resource
  altIds?: string[] // The IRNs for alternate identifiers (e.g. email)
  displayName?: string // The display name of the resource
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
  actor?: Actor
  reason?: string
  timestamp?: string
  sessionId?: string
  externalId?: string
  resources?: Resource[]
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
