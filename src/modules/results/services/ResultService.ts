import RaceService from '@racing/services/RaceService'
import ResultRepository from '../repositories/ResultRepository'

import type { IResult, IResultService } from '../types'

class ResultService implements IResultService {
  private repository = new ResultRepository()
  private raceService = RaceService

  /**
   * Generate Result rounds and return an array of IResult objects.
   *
   * @returns An array of IResult objects
   * @throws Error if the generation fails
   */
  generate(): IResult[] {
    const rounds = this.raceService.getAll()
    if (rounds.length === 0) {
      throw new Error('No rounds available to generate results')
    }

    return rounds
  }

  /**
   * Save Results to the repository.
   *
   * @param Results - An array of IResult objects to save
   */
  save(results: IResult[]): void {
    this.repository.create(results)
  }

  /**
   * Retrieve all Results from the repository.
   *
   * @returns An array of IResult objects
   */
  getAll(): IResult[] {
    return this.repository.findAll()
  }

  /**
   * Clear all Results from the repository.
   */
  clear(): void {
    this.repository.removeAll()
  }
}

export default new ResultService()
