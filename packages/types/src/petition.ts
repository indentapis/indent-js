import { Meta, Resource } from './audit'
import { Block } from './block'

export type Petition = {
  spaceName?: string
  name?: string
  petitioners?: Resource[]
  resources?: Resource[]
  defaultDuration?: Duration
  reason?: string
  block?: Block
  meta?: Meta & { createTime?: string; updateTime?: string }
  state?: PetitionState
}

export type CreatePetitionRequest = {
  spaceName: string
  petition: Petition
}

export type GetPetitionRequest = {
  spaceName: string
  petitionName: string
}

export type ListPetitionsRequest = {
  spaceName: string
  full?: boolean
  labelSelector?: string
  pageToken?: string
  pageSize?: number
}

export enum PetitionPhase {
  Open = 'open',
  Granted = 'granted',
  Revoked = 'revoked',
  Closed = 'closed',
}

export type Duration = {
  seconds: number
  nanos: number
}

export type PetitionState = {
  eventHistory: Event[]
  status: PetitionStatus
}

export type PetitionStatus = {
  phase: PetitionPhase
}