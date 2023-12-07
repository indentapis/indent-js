import { Event, Resource, Petition } from '@indent/types'
import type { IndentAPI } from './index'

export class ResourceAPI {
  protected _client: IndentAPI

  constructor(client: IndentAPI) {
    this._client = client
  }

  async list(): Promise<{ resources: Resource[] }> {
    return this._client.get(`/spaces/${this._client.spaceName}/resources`)
  }

  async get(req: { resourceName: string }): Promise<{ resource: Resource }> {
    return this._client.get(
      `/spaces/${this._client.spaceName}/resources/${req.resourceName}`,
    )
  }

  async bulkUpdate(req: {
    resources: Resource[]
  }): Promise<{ resources: Resource[] }> {
    return this._client.post(
      `/spaces/${this._client.spaceName}/resources:bulkUpdate`,
      { body: req },
    )
  }
}

export type BaseIndentAPIRequest = {
  spaceName?: string
}

export type CreatePetitionRequest = BaseIndentAPIRequest & {
  petition: Petition
}

export type GetPetitionRequest = BaseIndentAPIRequest & {
  petitionName: string
}

export type ListPetitionsRequest = BaseIndentAPIRequest & {
  spaceName: string
  full?: boolean
  labelSelector?: string
  pageToken?: string
  pageSize?: number
}

export type CreatePetitionClaimRequest = BaseIndentAPIRequest & {
  petitionName: string
  claim: Event
}

export class PetitionAPI {
  protected _client: IndentAPI

  constructor(client: IndentAPI) {
    this._client = client
  }

  async list() {
    return await this._client.get(`/spaces/${this._client.spaceName}/petitions`)
  }

  async create(req: Petition): Promise<Petition> {
    const spaceName = req.spaceName || this._client.spaceName
    const email = JSON.parse(atob(this._client.apiToken.split('.')[1])).sub

    const petition = {
      ...req,
      meta: {
        ...(req.meta || {}),
        labels: { 'indent.com/app/config/id': `space:${spaceName}` },
      },
    }

    if (!petition.petitioners) {
      petition.petitioners = [{ kind: 'user', email }]
    }
    if (!petition.resources) {
      petition.resources = [
        {
          kind: 'action',
          displayName: 'Approval',
          id: `approval+${Math.random()}`,
          labels: { 'indent.com/block': String(Math.random()) },
        },
      ]
    }

    return await this._client.post(`/spaces/${spaceName}/petitions`, {
      body: { petition },
    })
  }

  async get(req: GetPetitionRequest): Promise<Petition> {
    const { petitionName, spaceName = this._client.spaceName } = req

    return await this._client.get(
      `/spaces/${spaceName}/petitions/${petitionName}`,
    )
  }

  // Helper methods

  async review(req: CreatePetitionClaimRequest): Promise<Event> {
    const { petitionName, claim, spaceName = this._client.spaceName } = req

    return await this._client.post(
      `/spaces/${spaceName}/petitions/${petitionName}/claims`,
      { body: { claim } },
    )
  }

  async waitFor(req: GetPetitionRequest): Promise<Petition> {
    const { petitionName, spaceName = this._client.spaceName } = req

    let updated: Petition
    let tries = 3

    while (tries > 0) {
      updated = await this.get({ petitionName, spaceName })

      if (
        updated.state?.status?.phase === 'granted' ||
        updated.state?.status?.phase === 'closed'
      ) {
        break
      }

      tries -= 1
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    return updated
  }
}
