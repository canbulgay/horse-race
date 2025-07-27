export type IHorse = {
  id: number
  name: string
  color: string
  condition: number
}

export interface IHorseFactory {
  create(count?: number, conditionRange?: { min: number; max: number }): IHorse[]
}

export interface IHorseRepository {
  getAll(): IHorse[]
  save(horses: IHorse[]): void
  clear(): void
}

export interface IHorseService {
  generate(): IHorse[]
}
export interface IHorseStore {
  list: IHorse[]
  generate(count?: number, conditionRange?: { min: number; max: number }): void
  load(): void
  clear(): void
}
