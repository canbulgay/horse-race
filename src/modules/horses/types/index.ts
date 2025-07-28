export type IHorse = {
  id: number
  name: string
  colorHex: string
  colorName: string
  condition: number
}

export interface IHorseFactory {
  create(count?: number, conditionRange?: { min: number; max: number }): IHorse[]
}

export interface IHorseRepository {
  findAll(): IHorse[]
  create(horses: IHorse[]): void
  removeAll(): void
}

export interface IHorseService {
  generate(): IHorse[]
  save(horses: IHorse[]): void
  getAll(): IHorse[]
  clear(): void
}

export interface IHorseStore {
  list: IHorse[]
  generate(count?: number, conditionRange?: { min: number; max: number }): void
  load(): void
  clear(): void
}
