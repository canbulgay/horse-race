import { getItem, setItem, removeItem } from '@core/utils'
import type { IHorse, IHorseRepository } from '../types'
import { STORAGE_KEY } from '../stores/HorseStore'

class HorseRepository implements IHorseRepository {
  /**
   * Get all horses from localStorage.
   * @returns {IHorse[]} Array of IHorse objects
   */
  getAll(): IHorse[] {
    return getItem<IHorse[]>(STORAGE_KEY, [])
  }

  /**
   * Save horses to localStorage.
   * @param horses - An array of Horse objects to save
   * @return {void}
   */
  save(horses: IHorse[]): void {
    setItem(STORAGE_KEY, horses)
  }

  /**
   * Remove all horses from localStorage.
   */
  clear(): void {
    removeItem(STORAGE_KEY)
  }
}

export default new HorseRepository()
