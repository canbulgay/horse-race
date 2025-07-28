import { shuffle } from '@core/utils'
import { GAME_CONFIG } from '@/core/contants'

import { HorseFactory } from '../factories/HorseFactory'
import HorseRepository from '../repositories/HorseRepository'
import type { IHorse, IHorseService } from '../types'

class HorseService implements IHorseService {
  private factory = new HorseFactory()
  private repository = new HorseRepository()

  /**
   * Generate a batch of unique horses.
   *
   * @returns {IHorse[]} An array of Horse, each with unique name + color. Defaults to 20 horses.
   */
  generate(): IHorse[] {
    return this.factory.create()
  }

  /**
   * Save horses to the repository.
   *
   * @param horses {IHorse[]} - An array of IHorse objects to save
   */
  save(horses: IHorse[]): void {
    this.repository.create(horses)
  }

  /**
   * Retrieve all horses from the repository.
   *
   * @returns {IHorse[]} An array of IHorse objects
   */
  getAll(): IHorse[] {
    return this.repository.findAll()
  }

  /**
   * Clear all horses from the repository.
   *
   * @returns {void}
   */
  clear(): void {
    this.repository.removeAll()
  }

  /**
   * Get random horses from the repository.
   * @params {number} count - Number of horses to retrieve, defaults to 10.
   * @returns {IHorse[]} An array of IHorse objects
   *
   * @throws Error if no horses are available to select from
   */
  getRandomHorses(count: number = GAME_CONFIG.HORSES_PER_RACE): IHorse[] {
    const horses = this.repository.findAll()
    if (horses.length === 0) {
      throw new Error('No horses available to select from')
    }
    return shuffle(horses).slice(0, count)
  }
}

export default new HorseService()
