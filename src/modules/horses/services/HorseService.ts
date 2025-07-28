import { HorseFactory } from '../factories/HorseFactory'
import HorseRepository from '../repositories/HorseRepository'
import type { IHorse, IHorseService } from '../types'

class HorseService implements IHorseService {
  private factory = new HorseFactory()
  private repository = new HorseRepository()

  /**
   * Generate a batch of unique horses.
   *
   * @returns An array of Horse, each with unique name + color. Defaults to 20 horses.
   */
  generate(): IHorse[] {
    return this.factory.create()
  }

  /**
   * Save horses to the repository.
   *
   * @param horses - An array of IHorse objects to save
   */
  save(horses: IHorse[]): void {
    this.repository.create(horses)
  }

  /**
   * Retrieve all horses from the repository.
   *
   * @returns An array of IHorse objects
   */
  getAll(): IHorse[] {
    return this.repository.findAll()
  }

  /**
   * Clear all horses from the repository.
   */
  clear(): void {
    this.repository.removeAll()
  }
}

export default new HorseService()
