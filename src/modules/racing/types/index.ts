import type { IHorse } from '@horses/types'

export type IRace = {
  horses: IHorse[]
  round: number
  status?: 'pending' | 'finished' | 'active'
  distance?: number
}

export interface IRaceRepository {
  findAll(): IRace[]
  create(races: IRace[]): void
  removeAll(): void
}

export interface IRaceService {
  generate(): IRace[]
  save(races: IRace[]): void
  getAll(): IRace[]
  clear(): void
}

export interface IRaceStore {
  list: IRace[]
  loading: boolean
  error: string | null
}
