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
   * Save a single result to the repository.
   *
   * @param result - A single IResult object to save
   */
  save(result: IResult): void {
    this.repository.create(result)
  }

  /**
   * Save multiple results to the repository.
   *
   * @param results - An array of IResult objects to save
   */
  saveAll(results: IResult[]): void {
    results.forEach(result => this.repository.create(result))
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
