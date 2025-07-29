import { getItem, setItem, removeItem } from '@core/utils'

import type { IResult, IResultRepository } from '../types'
import { STORAGE_KEY } from '../stores/ResultsStore'

class ResultRepository implements IResultRepository {
  /**
   * Find all Results from localStorage.
   * @returns {IResult[]} Array of IResult objects
   */
  findAll(): IResult[] {
    return getItem<IResult[]>(STORAGE_KEY, [])
  }

  /**
   * Create a single result in localStorage by appending to existing results.
   * @param result - A single IResult object to create
   *
   * @return {void}
   */
  create(result: IResult): void {
    const existingResults = this.findAll()

    const existingIndex = existingResults.findIndex((r) => r.round === result.round)

    if (existingIndex === -1) {
      existingResults.push(result)
      setItem(STORAGE_KEY, existingResults)
    } else {
      existingResults[existingIndex] = result
      setItem(STORAGE_KEY, existingResults)
    }
  }

  /**
   * Remove all Results from localStorage.
   */
  removeAll(): void {
    removeItem(STORAGE_KEY)
  }
}

export default ResultRepository
