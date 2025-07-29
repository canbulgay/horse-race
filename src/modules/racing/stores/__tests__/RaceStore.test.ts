import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRaceStore } from '../RaceStore'
import type { IRace } from '../../types'
import type { IHorse } from '@horses/types'
import { log } from 'console'

// Mock RaceService
vi.mock('../../services/RaceService', () => ({
  default: {
    generate: vi.fn(),
    save: vi.fn(),
    getAll: vi.fn(),
    clear: vi.fn(),
  },
}))

describe('RaceStore', () => {
  let raceStore: ReturnType<typeof useRaceStore>
  let mockRaceService: any

  const sampleHorses: IHorse[] = [
    { id: 1, name: 'Thunder', colorHex: '#FF0000', colorName: 'red', condition: 85 },
    { id: 2, name: 'Lightning', colorHex: '#0000FF', colorName: 'blue', condition: 72 },
  ]

  const sampleRaces: IRace[] = [
    { round: 1, horses: sampleHorses, status: 'pending', distance: 1200 },
    { round: 2, horses: sampleHorses, status: 'pending', distance: 1400 },
    { round: 3, horses: sampleHorses, status: 'finished', distance: 1600 },
  ]

  beforeEach(async () => {
    setActivePinia(createPinia())
    raceStore = useRaceStore()

    const RaceServiceModule = await import('../../services/RaceService')
    mockRaceService = RaceServiceModule.default

    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(raceStore.list).toEqual([])
      expect(raceStore.loading).toBe(false)
      expect(raceStore.error).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should return correct nextRace', () => {
      expect(raceStore.nextRace).toBeNull()

      raceStore.list = sampleRaces
      expect(raceStore.nextRace).toEqual(sampleRaces[0]) // First pending race
    })

    it('should return correct nextRound', () => {
      expect(raceStore.nextRound).toBe(1)

      raceStore.list = sampleRaces
      expect(raceStore.nextRound).toBe(1) // First pending race round
    })

    it('should handle all races finished', () => {
      const finishedRaces = sampleRaces.map((race) => ({ ...race, status: 'finished' as const }))
      raceStore.list = finishedRaces

      expect(raceStore.nextRace).toBeNull()
      expect(raceStore.nextRound).toBe(1) // Default when no pending races
    })

    it('should find correct next pending race', () => {
      const mixedRaces: IRace[] = [
        { round: 1, horses: sampleHorses, status: 'finished', distance: 1200 },
        { round: 2, horses: sampleHorses, status: 'finished', distance: 1400 },
        { round: 3, horses: sampleHorses, status: 'pending', distance: 1600 },
        { round: 4, horses: sampleHorses, status: 'pending', distance: 1800 },
      ]
      raceStore.list = mixedRaces

      expect(raceStore.nextRace).toEqual(mixedRaces[2]) // Round 3
      expect(raceStore.nextRound).toBe(3)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      raceStore.setLoading(true)
      expect(raceStore.loading).toBe(true)

      raceStore.setLoading(false)
      expect(raceStore.loading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should update error state', () => {
      const errorMessage = 'Test error'
      raceStore.setError(errorMessage)
      expect(raceStore.error).toBe(errorMessage)

      raceStore.setError(null)
      expect(raceStore.error).toBeNull()
    })
  })

  describe('generate', () => {
    it('should generate races successfully', () => {
      mockRaceService.generate.mockReturnValue(sampleRaces)

      raceStore.generate()

      expect(mockRaceService.generate).toHaveBeenCalled()
      expect(mockRaceService.save).toHaveBeenCalledWith(sampleRaces)
      expect(raceStore.list).toEqual(sampleRaces)
      expect(raceStore.loading).toBe(false)
      expect(raceStore.error).toBeNull()
    })

    it('should handle loading state correctly', () => {
      mockRaceService.generate.mockReturnValue(sampleRaces)

      raceStore.generate()

      expect(raceStore.loading).toBe(false) // Should be false after completion
    })

    it('should handle generation errors with Error objects', () => {
      const error = new Error('Generation failed')
      mockRaceService.generate.mockImplementation(() => {
        throw error
      })

      raceStore.generate()

      expect(raceStore.error).toBe('Generation failed')
      expect(raceStore.loading).toBe(false)
    })

    it('should handle generation errors with non-Error objects', () => {
      mockRaceService.generate.mockImplementation(() => {
        throw 'String error'
      })

      raceStore.generate()

      expect(raceStore.error).toBe('An error occurred while generating races')
      expect(raceStore.loading).toBe(false)
    })
  })

  describe('load', () => {
    it('should load races successfully', () => {
      mockRaceService.getAll.mockReturnValue(sampleRaces)

      raceStore.load()

      expect(mockRaceService.getAll).toHaveBeenCalled()
      expect(raceStore.list).toEqual(sampleRaces)
      expect(raceStore.loading).toBe(false)
      expect(raceStore.error).toBeNull()
    })

    it('should handle loading state correctly', () => {
      mockRaceService.getAll.mockReturnValue(sampleRaces)

      raceStore.load()

      expect(raceStore.loading).toBe(false) // Should be false after completion
    })

    it('should clear error before loading', () => {
      raceStore.setError('Previous error')
      mockRaceService.getAll.mockReturnValue(sampleRaces)

      raceStore.load()

      expect(raceStore.error).toBeNull()
    })

    it('should handle load errors with Error objects', () => {
      const error = new Error('Load failed')
      mockRaceService.getAll.mockImplementation(() => {
        throw error
      })

      raceStore.load()

      expect(raceStore.error).toBe('Load failed')
      expect(raceStore.loading).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error loading races:', error)
    })

    it('should handle load errors with non-Error objects', () => {
      mockRaceService.getAll.mockImplementation(() => {
        throw 'String error'
      })

      raceStore.load()

      expect(raceStore.error).toBe('An error occurred while loading races')
      expect(raceStore.loading).toBe(false)
    })

    it('should load empty array without error', () => {
      mockRaceService.getAll.mockReturnValue([])

      raceStore.load()

      expect(raceStore.list).toEqual([])
      expect(raceStore.error).toBeNull()
    })

    it('should not update list on load error', () => {
      const originalList = [...sampleRaces]
      raceStore.list = originalList

      mockRaceService.getAll.mockImplementation(() => {
        throw new Error('Load failed')
      })

      raceStore.load()

      expect(raceStore.list).toEqual(originalList)
    })
  })

  describe('clear', () => {
    it('should clear races successfully', () => {
      raceStore.list = [...sampleRaces]

      raceStore.clear()

      expect(mockRaceService.clear).toHaveBeenCalled()
      expect(raceStore.list).toEqual([])
    })

    it('should clear list when already empty', () => {
      expect(raceStore.list).toEqual([])

      raceStore.clear()

      expect(raceStore.list).toEqual([])
      expect(mockRaceService.clear).toHaveBeenCalled()
    })
  })

  describe('updateRaceStatus', () => {
    beforeEach(() => {
      raceStore.list = [...sampleRaces]
    })

    it('should update race status successfully', () => {
      raceStore.updateRaceStatus(1, 'finished')

      expect(raceStore.list[0].status).toBe('finished')
      expect(mockRaceService.save).toHaveBeenCalledWith(raceStore.list)
    })

    it('should update from finished to pending', () => {
      raceStore.updateRaceStatus(3, 'pending')

      expect(raceStore.list[2].status).toBe('pending')
      expect(mockRaceService.save).toHaveBeenCalledWith(raceStore.list)
    })

    it('should handle non-existent round gracefully', () => {
      const originalList = [...raceStore.list]

      raceStore.updateRaceStatus(999, 'finished')

      expect(raceStore.list).toEqual(originalList)
      expect(mockRaceService.save).not.toHaveBeenCalled()
    })

    it('should handle negative round numbers', () => {
      const originalList = [...raceStore.list]

      raceStore.updateRaceStatus(-1, 'finished')

      expect(raceStore.list).toEqual(originalList)
      expect(mockRaceService.save).not.toHaveBeenCalled()
    })

    it('should handle zero round number', () => {
      const originalList = [...raceStore.list]

      raceStore.updateRaceStatus(0, 'finished')

      expect(raceStore.list).toEqual(originalList)
      expect(mockRaceService.save).not.toHaveBeenCalled()
    })

    it('should handle save errors after status update', () => {
      mockRaceService.save.mockImplementation(() => {
        throw new Error('Save failed')
      })

      expect(() => raceStore.updateRaceStatus(1, 'finished')).toThrow('Save failed')
      expect(raceStore.list[0].status).toBe('finished') // Status should still be updated
    })
  })
  describe('integration scenarios', () => {
    it('should support generate -> clear -> load workflow', () => {
      mockRaceService.generate.mockReturnValue(sampleRaces)
      mockRaceService.getAll.mockReturnValue([])

      raceStore.generate()
      expect(raceStore.list).toEqual(sampleRaces)

      raceStore.clear()
      expect(raceStore.list).toEqual([])

      raceStore.load()
      expect(raceStore.list).toEqual([])
    })
  })
  describe('edge cases', () => {
    it('should handle races with no horses', () => {
      const racesWithoutHorses: IRace[] = [
        { round: 1, horses: [], status: 'pending', distance: 1200 },
      ]
      mockRaceService.generate.mockReturnValue(racesWithoutHorses)

      raceStore.generate()

      expect(raceStore.list).toEqual(racesWithoutHorses)
      expect(raceStore.nextRace?.horses).toEqual([])
    })

    it('should handle races with undefined distance', () => {
      const racesWithUndefinedDistance: IRace[] = [
        { round: 1, horses: sampleHorses, status: 'pending' }, // No distance property
      ]
      raceStore.list = racesWithUndefinedDistance

      expect(raceStore.nextRace?.distance).toBeUndefined()
    })
  })
})
