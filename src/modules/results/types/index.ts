import type { IRace } from '@/modules/racing'

export type IResult = IRace

export interface IResultRepository {
  findAll(): IResult[]
  create(result: IResult): void
  removeAll(): void
}

export interface IResultService {
  save(result: IResult): void
  saveAll(results: IResult[]): void
  getAll(): IResult[]
  clear(): void
  generate(): IResult[]
}
