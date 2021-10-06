import { Resource } from './audit'

export type Status = {
  code?: number
  message?: string
  details?: any
}

export type PullUpdateResponse = {
  resources?: Resource[]
  status?: Status
}

export type ApplyUpdateResponse = {
  status?: Status
}
