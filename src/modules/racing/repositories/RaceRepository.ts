import { getItem, setItem, removeItem } from '@core/utils'

import type { IRace, IRaceRepository } from '../types'
import { STORAGE_KEY } from '../stores/RaceStore'

class RaceRepository implements IRaceRepository {
  /**
   * Find all races from localStorage.
   * @returns {IRace[]} Array of IRace objects
   */
  findAll(): IRace[] {
    return getItem<IRace[]>(STORAGE_KEY, [])
  }

  /**
   * Create races in localStorage.
   * @param races - An array of IRace objects to create
   * @return {void}
   */
  create(races: IRace[]): void {
    setItem(STORAGE_KEY, races)
  }

  /**
   * Remove all races from localStorage.
   */
  removeAll(): void {
    removeItem(STORAGE_KEY)
  }
}

export default RaceRepository
