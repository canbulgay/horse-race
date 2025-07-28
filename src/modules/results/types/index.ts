import type { IRace } from '@/modules/racing'

export type IResult = IRace

export interface IResultRepository {
  findAll(): IResult[]
  create(results: IResult): void
  removeAll(): void
}

export interface IResultService {
  save(results: IResult): void
  getAll(): IResult[]
  clear(): void
  generate(): IResult[]
}
