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

// DSN = https://[writeKey]@write.indentapis.com/v1/base58([space]/[providerName]/[inputName])

export type WriteEventRequest = {
  providerName: string
  spaceName: string
  inputName: string
  event: Event
}

export type WriteBatchRequest = {
  providerName: string
  spaceName: string
  inputName: string
  events: Event[]
}
