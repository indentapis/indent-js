import { Resource } from './audit'

export type CreateResourceRequest = {
  spaceName: string
  resource: Resource
}

export type UpdateResourceRequest = {
  spaceName: string
  resourceName: string
  resource: Resource
}

export type BulkUpdateResourcesRequest = {
  spaceName: string
  resources: Resource[]
  opts?: { fields: [] }
}

export type PullUpdateResourcesRequest = {
  spaceName: string
  kinds: string[]
  flags?: PullUpdateResourcesFlags
}

export type PullUpdateResourcesFlags = Record<string, string>

export type DeleteResourceRequest = {
  spaceName: string
  resourceName: string
}

export type BulkDeleteResourcesRequest = {
  spaceName: string
  resourceNames: string[]
}

export type GetResourceRequest = {
  spaceName: string
  resourceName: string
}

export type ListResourcesRequest = {
  spaceName: string
  labelSelector?: string
  latest?: boolean
  view?: string
  pageSize?: number
  pageToken?: string
}

export type ListResourcesResponse = {
  nextPageToken: string
  resources: Resource[]
}