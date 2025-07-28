import HorseService from '@horses/services/HorseService'
import RaceRepository from '../repositories/RaceRepository'

import type { IRace, IRaceService } from '../types'
import { GAME_CONFIG } from '@/core/contants'

class RaceService implements IRaceService {
  private repository = new RaceRepository()
  private horseService = HorseService

  /**
   * Generate race rounds and return an array of IRace objects.
   * @param count number of rounds to generate, defaults to GAME_CONFIG.TOTAL_ROUNDS **(6)**
   *
   * @returns An array of IRace objects
   * @throws Error if the generation fails
   */
  generate(count: number = GAME_CONFIG.TOTAL_ROUNDS): IRace[] {
    return Array.from({ length: count }, (_, round) => {
      const horses = this.horseService.getRandomHorses()

      if (horses.length === 0) {
        throw new Error('No horses available to select from')
      }

      return {
        round: round + 1,
        horses,
        status: 'pending',
        distance: GAME_CONFIG.TRACK_DISTANCES[round],
      } as IRace
    })
  }

  /**
   * Save races to the repository.
   *
   * @param races - An array of IRace objects to save
   */
  save(races: IRace[]): void {
    this.repository.create(races)
  }

  /**
   * Retrieve all races from the repository.
   *
   * @returns An array of IRace objects
   */
  getAll(): IRace[] {
    return this.repository.findAll()
  }

  /**
   * Clear all races from the repository.
   */
  clear(): void {
    this.repository.removeAll()
  }
}

export default new RaceService()
