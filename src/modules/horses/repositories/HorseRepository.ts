import { getItem, setItem, removeItem } from '@core/utils'

import type { IHorse, IHorseRepository } from '../types'
import { STORAGE_KEY } from '../stores/HorseStore'

class HorseRepository implements IHorseRepository {
  /**
   * Find all horses from localStorage.
   * @returns {IHorse[]} Array of IHorse objects
   */
  findAll(): IHorse[] {
    return getItem<IHorse[]>(STORAGE_KEY, [])
  }

  /**
   * Create horses in localStorage.
   * @param horses - An array of Horse objects to create
   * @return {void}
   */
  create(horses: IHorse[]): void {
    setItem(STORAGE_KEY, horses)
  }

  /**
   * Remove all horses from localStorage.
   */
  removeAll(): void {
    removeItem(STORAGE_KEY)
  }
}

export default HorseRepository
