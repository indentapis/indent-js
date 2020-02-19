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
  timestamp: string

  // Optional
  id?: string
  actor?: Actor
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
  debug?: false
}

export interface IAuditAPI {
  init: (options: IAuditAPIOptions) => void
  write: (event: Event) => void
}
