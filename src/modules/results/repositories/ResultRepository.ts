import { getItem, setItem, removeItem } from '@core/utils'

import type { IResult, IResultRepository } from '../types'
import { STORAGE_KEY } from '../stores/ResultStore'

class ResultRepository implements IResultRepository {
  /**
   * Find all Results from localStorage.
   * @returns {IResult[]} Array of IResult objects
   */
  findAll(): IResult[] {
    return getItem<IResult[]>(STORAGE_KEY, [])
  }

  /**
   * Create Results in localStorage.
   * @param Results - An array of IResult objects to create
   *
   * @return {void}
   */
  create(Results: IResult[]): void {
    setItem(STORAGE_KEY, Results)
  }

  /**
   * Remove all Results from localStorage.
   */
  removeAll(): void {
    removeItem(STORAGE_KEY)
  }
}

export default ResultRepository
