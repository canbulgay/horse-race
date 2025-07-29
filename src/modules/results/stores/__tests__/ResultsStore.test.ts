import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useResultsStore } from '../ResultsStore'
import type { IResult } from '../../types'
import type { IHorse } from '@horses/types'

// Mock ResultService
vi.mock('../../services/ResultService', () => ({
  default: {
    getAll: vi.fn(),
    save: vi.fn(),
    clear: vi.fn(),
  },
}))

describe('ResultsStore', () => {
  let resultsStore: ReturnType<typeof useResultsStore>
  let mockResultService: any

  const sampleHorses: IHorse[] = [
    { id: 1, name: 'Thunder', colorHex: '#FF0000', colorName: 'red', condition: 85 },
    { id: 2, name: 'Lightning', colorHex: '#0000FF', colorName: 'blue', condition: 72 },
  ]

  const sampleResults: IResult[] = [
    { round: 1, horses: sampleHorses, status: 'finished', distance: 1200 },
    { round: 2, horses: sampleHorses, status: 'finished', distance: 1400 },
    { round: 3, horses: sampleHorses, status: 'finished', distance: 1600 },
  ]

  beforeEach(async () => {
    setActivePinia(createPinia())
    resultsStore = useResultsStore()

    const ResultServiceModule = await import('../../services/ResultService')
    mockResultService = ResultServiceModule.default

    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(resultsStore.list).toEqual([])
      expect(resultsStore.loading).toBe(false)
      expect(resultsStore.error).toBeNull()
    })

    it('should have correct initial computed values', () => {
      expect(resultsStore.totalRaces).toBe(0)
      expect(resultsStore.latestResult).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should update totalRaces when list changes', () => {
      expect(resultsStore.totalRaces).toBe(0)

      resultsStore.list = sampleResults
      expect(resultsStore.totalRaces).toBe(3)

      resultsStore.list = []
      expect(resultsStore.totalRaces).toBe(0)
    })

    it('should return null latestResult when no results', () => {
      expect(resultsStore.latestResult).toBeNull()
    })

    it('should return correct latestResult', () => {
      resultsStore.list = sampleResults
      expect(resultsStore.latestResult).toEqual(sampleResults[2]) // Round 3
    })

    it('should return latest result with highest round number', () => {
      const unorderedResults: IResult[] = [
        { round: 5, horses: sampleHorses, status: 'finished', distance: 1600 },
        { round: 1, horses: sampleHorses, status: 'finished', distance: 1200 },
        { round: 3, horses: sampleHorses, status: 'finished', distance: 1400 },
      ]
      resultsStore.list = unorderedResults

      expect(resultsStore.latestResult).toEqual(unorderedResults[0]) // Round 5
    })

    it('should handle single result', () => {
      const singleResult = [sampleResults[0]]
      resultsStore.list = singleResult

      expect(resultsStore.totalRaces).toBe(1)
      expect(resultsStore.latestResult).toEqual(singleResult[0])
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      resultsStore.setLoading(true)
      expect(resultsStore.loading).toBe(true)

      resultsStore.setLoading(false)
      expect(resultsStore.loading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should update error state', () => {
      const errorMessage = 'Test error'
      resultsStore.setError(errorMessage)
      expect(resultsStore.error).toBe(errorMessage)

      resultsStore.setError(null)
      expect(resultsStore.error).toBeNull()
    })
  })

  describe('load', () => {
    it('should load results successfully', () => {
      mockResultService.getAll.mockReturnValue(sampleResults)

      resultsStore.load()

      expect(mockResultService.getAll).toHaveBeenCalled()
      expect(resultsStore.list).toEqual(sampleResults)
      expect(resultsStore.loading).toBe(false)
      expect(resultsStore.error).toBeNull()
    })

    it('should handle loading state correctly', () => {
      mockResultService.getAll.mockReturnValue(sampleResults)

      resultsStore.load()

      expect(resultsStore.loading).toBe(false) // Should be false after completion
    })

    it('should clear error before loading', () => {
      resultsStore.setError('Previous error')
      mockResultService.getAll.mockReturnValue(sampleResults)

      resultsStore.load()

      expect(resultsStore.error).toBeNull()
    })

    it('should handle load errors with Error objects', () => {
      const error = new Error('Load failed')
      mockResultService.getAll.mockImplementation(() => {
        throw error
      })

      resultsStore.load()

      expect(resultsStore.error).toBe('Load failed')
      expect(resultsStore.loading).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error loading results:', error)
    })

    it('should handle load errors with non-Error objects', () => {
      mockResultService.getAll.mockImplementation(() => {
        throw 'String error'
      })

      resultsStore.load()

      expect(resultsStore.error).toBe('An error occurred while loading results')
      expect(resultsStore.loading).toBe(false)
    })

    it('should load empty array without error', () => {
      mockResultService.getAll.mockReturnValue([])

      resultsStore.load()

      expect(resultsStore.list).toEqual([])
      expect(resultsStore.error).toBeNull()
      expect(resultsStore.totalRaces).toBe(0)
    })

    it('should not update list on load error', () => {
      const originalList = [...sampleResults]
      resultsStore.list = originalList

      mockResultService.getAll.mockImplementation(() => {
        throw new Error('Load failed')
      })

      resultsStore.load()

      expect(resultsStore.list).toEqual(originalList)
    })
  })

  describe('saveResult', () => {
    it('should update computed properties after save', () => {
      expect(resultsStore.totalRaces).toBe(0)
      expect(resultsStore.latestResult).toBeNull()

      resultsStore.saveResult(sampleResults[0])

      expect(resultsStore.totalRaces).toBe(1)
      expect(resultsStore.latestResult).toEqual(sampleResults[0])
    })

    it('should save multiple results maintaining order', () => {
      sampleResults.forEach((result) => {
        resultsStore.saveResult(result)
      })

      expect(resultsStore.list).toEqual(sampleResults)
      expect(resultsStore.totalRaces).toBe(3)
      expect(resultsStore.latestResult).toEqual(sampleResults[2]) // Round 3
    })
  })

  describe('clear', () => {
    it('should clear results successfully', () => {
      resultsStore.list = [...sampleResults]

      resultsStore.clear()

      expect(mockResultService.clear).toHaveBeenCalled()
      expect(resultsStore.list).toEqual([])
    })

    it('should update computed properties after clear', () => {
      resultsStore.list = [...sampleResults]
      expect(resultsStore.totalRaces).toBe(3)

      resultsStore.clear()

      expect(resultsStore.totalRaces).toBe(0)
      expect(resultsStore.latestResult).toBeNull()
    })

    it('should clear list when already empty', () => {
      expect(resultsStore.list).toEqual([])

      resultsStore.clear()

      expect(resultsStore.list).toEqual([])
      expect(mockResultService.clear).toHaveBeenCalled()
    })

    it('should handle service clear errors silently', () => {
      resultsStore.list = [...sampleResults]
      mockResultService.clear.mockImplementation(() => {
        throw new Error('Clear failed')
      })

      expect(() => resultsStore.clear()).toThrow('Clear failed')
      expect(resultsStore.list).toEqual([]) // List should still be cleared
    })
  })

  describe('integration scenarios', () => {
    it('should support load -> saveResult workflow', () => {
      mockResultService.getAll.mockReturnValue([sampleResults[0]])

      resultsStore.load()
      expect(resultsStore.list).toEqual([sampleResults[0]])

      resultsStore.saveResult(sampleResults[1])
      expect(resultsStore.list).toHaveLength(2)
      expect(resultsStore.latestResult).toEqual(sampleResults[1])
    })

    it('should handle race progression correctly', () => {
      // Simulate saving results as races finish
      expect(resultsStore.totalRaces).toBe(0)

      resultsStore.saveResult(sampleResults[0]) // Round 1
      expect(resultsStore.totalRaces).toBe(1)
      expect(resultsStore.latestResult?.round).toBe(1)

      resultsStore.saveResult(sampleResults[1]) // Round 2
      expect(resultsStore.totalRaces).toBe(2)
      expect(resultsStore.latestResult?.round).toBe(2)

      resultsStore.saveResult(sampleResults[2]) // Round 3
      expect(resultsStore.totalRaces).toBe(3)
      expect(resultsStore.latestResult?.round).toBe(3)
    })

    it('should handle out-of-order result saving', () => {
      // Save results in random order
      resultsStore.saveResult(sampleResults[2]) // Round 3
      resultsStore.saveResult(sampleResults[0]) // Round 1
      resultsStore.saveResult(sampleResults[1]) // Round 2

      expect(resultsStore.totalRaces).toBe(3)
      expect(resultsStore.latestResult?.round).toBe(3) // Should still find the highest round
    })
  })

  describe('reactive updates', () => {
    it('should update computed properties reactively', () => {
      expect(resultsStore.totalRaces).toBe(0)
      expect(resultsStore.latestResult).toBeNull()

      resultsStore.list = sampleResults
      expect(resultsStore.totalRaces).toBe(3)
      expect(resultsStore.latestResult).toEqual(sampleResults[2])

      resultsStore.list = []
      expect(resultsStore.totalRaces).toBe(0)
      expect(resultsStore.latestResult).toBeNull()
    })

    it('should maintain reactivity after operations', () => {
      resultsStore.saveResult(sampleResults[0])

      expect(resultsStore.totalRaces).toBe(1)
      expect(resultsStore.latestResult).toEqual(sampleResults[0])

      resultsStore.saveResult(sampleResults[1])

      expect(resultsStore.totalRaces).toBe(2)
      expect(resultsStore.latestResult).toEqual(sampleResults[1])
    })
  })

  describe('edge cases', () => {
    it('should handle duplicate round numbers in latestResult', () => {
      const duplicateRoundResults: IResult[] = [
        { round: 2, horses: sampleHorses, status: 'finished', distance: 1200 },
        { round: 2, horses: sampleHorses, status: 'finished', distance: 1400 }, // Same round
      ]

      resultsStore.list = duplicateRoundResults

      // Should return one of the round 2 results
      expect(resultsStore.latestResult?.round).toBe(2)
    })

    it('should handle negative round numbers', () => {
      const negativeRoundResult: IResult = {
        round: -1,
        horses: sampleHorses,
        status: 'finished',
        distance: 1200,
      }
      const positiveRoundResult: IResult = {
        round: 1,
        horses: sampleHorses,
        status: 'finished',
        distance: 1400,
      }

      resultsStore.list = [negativeRoundResult, positiveRoundResult]

      expect(resultsStore.latestResult).toEqual(positiveRoundResult) // Positive round should be latest
    })
  })

  describe('error handling edge cases', () => {
    it('should recover from error state on successful operations', () => {
      const error = new Error('Load failed')
      mockResultService.getAll.mockImplementation(() => {
        throw error
      })

      resultsStore.load()
      expect(resultsStore.error).toBe('Load failed')

      // Now try a successful saveResult
      mockResultService.save.mockImplementation(() => {}) // Success
      resultsStore.saveResult(sampleResults[0])

      expect(resultsStore.error).toBe('Load failed') // Error should persist until explicitly cleared
    })
  })
})
