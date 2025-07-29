import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHorseStore } from '../HorseStore'
import type { IHorse } from '../../types'

// Mock HorseService
vi.mock('../../services/HorseService', () => ({
  default: {
    generate: vi.fn(),
    save: vi.fn(),
    getAll: vi.fn(),
    clear: vi.fn(),
  },
}))

// Mock Date.now for consistent timestamps
const mockDateNow = vi.fn()
vi.stubGlobal('Date', { ...Date, now: mockDateNow })

describe('HorseStore', () => {
  let horseStore: ReturnType<typeof useHorseStore>
  let mockHorseService: any

  const sampleHorses: IHorse[] = [
    { id: 1, name: 'Thunder', colorHex: '#FF0000', colorName: 'red', condition: 85 },
    { id: 2, name: 'Lightning', colorHex: '#0000FF', colorName: 'blue', condition: 72 },
    { id: 3, name: 'Storm', colorHex: '#00FF00', colorName: 'green', condition: 90 },
  ]

  beforeEach(async () => {
    setActivePinia(createPinia())
    horseStore = useHorseStore()

    const HorseServiceModule = await import('../../services/HorseService')
    mockHorseService = HorseServiceModule.default

    vi.clearAllMocks()
    mockDateNow.mockReturnValue(12345)
    console.error = vi.fn()
    console.log = vi.fn()
  })

  describe('initial state', () => {
    it('should have correct initial state', () => {
      expect(horseStore.list).toEqual([])
      expect(horseStore.loading).toBe(false)
      expect(horseStore.error).toBeNull()
      expect(horseStore.generationTimestamp).toBeNull()
    })

    it('should have correct initial computed values', () => {
      expect(horseStore.horseCount).toBe(0)
      expect(horseStore.hasError).toBe(false)
      expect(horseStore.errorMessage).toBeNull()
    })
  })

  describe('computed properties', () => {
    it('should update horseCount when list changes', () => {
      horseStore.list = sampleHorses
      expect(horseStore.horseCount).toBe(3)

      horseStore.list = []
      expect(horseStore.horseCount).toBe(0)
    })

    it('should update hasError when error changes', () => {
      expect(horseStore.hasError).toBe(false)

      horseStore.error = 'Test error'
      expect(horseStore.hasError).toBe(true)

      horseStore.error = null
      expect(horseStore.hasError).toBe(false)
    })

    it('should return correct errorMessage', () => {
      expect(horseStore.errorMessage).toBeNull()

      const testError = 'Test error message'
      horseStore.error = testError
      expect(horseStore.errorMessage).toBe(testError)
    })
  })

  describe('setLoading', () => {
    it('should update loading state', () => {
      horseStore.setLoading(true)
      expect(horseStore.loading).toBe(true)

      horseStore.setLoading(false)
      expect(horseStore.loading).toBe(false)
    })
  })

  describe('setError', () => {
    it('should update error state', () => {
      const errorMessage = 'Test error'
      horseStore.setError(errorMessage)
      expect(horseStore.error).toBe(errorMessage)

      horseStore.setError(null)
      expect(horseStore.error).toBeNull()
    })
  })

  describe('generate', () => {
    it('should generate horses successfully', async () => {
      mockHorseService.generate.mockReturnValue(sampleHorses)

      await horseStore.generate()

      expect(mockHorseService.generate).toHaveBeenCalled()
      expect(mockHorseService.save).toHaveBeenCalledWith(sampleHorses)
      expect(horseStore.list).toEqual(sampleHorses)
      expect(horseStore.generationTimestamp).toBe(12345)
      expect(horseStore.error).toBeNull()
      expect(horseStore.loading).toBe(false)
    })

    it('should handle loading state correctly', async () => {
      mockHorseService.generate.mockReturnValue(sampleHorses)

      await horseStore.generate()
      expect(horseStore.loading).toBe(false)
    })

    it('should clear error before generating', async () => {
      horseStore.setError('Previous error')
      mockHorseService.generate.mockReturnValue(sampleHorses)

      await horseStore.generate()

      expect(horseStore.error).toBeNull()
    })

    it('should handle generation errors', async () => {
      const error = new Error('Generation failed')
      mockHorseService.generate.mockImplementation(() => {
        throw error
      })

      await horseStore.generate()

      expect(horseStore.error).toBe('Failed to generate horses')
      expect(horseStore.loading).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error generating horses:', error)
    })

    it('should handle save errors', async () => {
      mockHorseService.generate.mockReturnValue(sampleHorses)
      mockHorseService.save.mockImplementation(() => {
        throw new Error('Save failed')
      })

      await horseStore.generate()

      expect(horseStore.error).toBe('Failed to generate horses')
      expect(horseStore.loading).toBe(false)
    })

    it('should not update list on generation error', async () => {
      const originalList = [...sampleHorses]
      horseStore.list = originalList

      mockHorseService.generate.mockImplementation(() => {
        throw new Error('Generation failed')
      })

      await horseStore.generate()

      expect(horseStore.list).toEqual(originalList)
    })
  })

  describe('load', () => {
    it('should load horses successfully', async () => {
      mockHorseService.getAll.mockReturnValue(sampleHorses)

      await horseStore.load()

      expect(mockHorseService.getAll).toHaveBeenCalled()
      expect(horseStore.list).toEqual(sampleHorses)
      expect(horseStore.error).toBeNull()
      expect(horseStore.loading).toBe(false)
    })

    it('should handle loading state correctly', async () => {
      mockHorseService.getAll.mockReturnValue(sampleHorses)

      await horseStore.load()
      expect(horseStore.loading).toBe(false)
    })

    it('should clear error before loading', async () => {
      horseStore.setError('Previous error')
      mockHorseService.getAll.mockReturnValue(sampleHorses)

      await horseStore.load()

      expect(horseStore.error).toBeNull()
    })

    it('should handle load errors', async () => {
      const error = new Error('Load failed')
      mockHorseService.getAll.mockImplementation(() => {
        throw error
      })

      await horseStore.load()

      expect(horseStore.error).toBe('Failed to load horses')
      expect(horseStore.loading).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error loading horses:', error)
    })

    it('should load empty array without error', async () => {
      mockHorseService.getAll.mockReturnValue([])

      await horseStore.load()

      expect(horseStore.list).toEqual([])
      expect(horseStore.horseCount).toBe(0)
      expect(horseStore.error).toBeNull()
    })

    it('should not update list on load error', async () => {
      const originalList = [...sampleHorses]
      horseStore.list = originalList

      mockHorseService.getAll.mockImplementation(() => {
        throw new Error('Load failed')
      })

      await horseStore.load()

      expect(horseStore.list).toEqual(originalList)
    })
  })

  describe('clear', () => {
    it('should clear horses successfully', async () => {
      horseStore.list = [...sampleHorses]

      await horseStore.clear()

      expect(mockHorseService.clear).toHaveBeenCalled()
      expect(horseStore.list).toEqual([])
      expect(horseStore.error).toBeNull()
      expect(horseStore.loading).toBe(false)
    })

    it('should handle loading state correctly', async () => {
      await horseStore.clear()
      expect(horseStore.loading).toBe(false)
    })

    it('should clear error before clearing', async () => {
      horseStore.setError('Previous error')

      await horseStore.clear()

      expect(horseStore.error).toBeNull()
    })

    it('should handle clear errors', async () => {
      const error = new Error('Clear failed')
      mockHorseService.clear.mockImplementation(() => {
        throw error
      })
      horseStore.list = [...sampleHorses]

      await horseStore.clear()

      expect(horseStore.error).toBe('Failed to clear horses')
      expect(horseStore.loading).toBe(false)
      expect(console.error).toHaveBeenCalledWith('Error clearing horses:', error)
    })

    it('should clear list even on service error', async () => {
      horseStore.list = [...sampleHorses]
      mockHorseService.clear.mockImplementation(() => {
        throw new Error('Clear failed')
      })

      await horseStore.clear()

      expect(horseStore.list).toEqual([])
    })

    it('should clear list when already empty', async () => {
      expect(horseStore.list).toEqual([])

      await horseStore.clear()

      expect(horseStore.list).toEqual([])
      expect(mockHorseService.clear).toHaveBeenCalled()
    })
  })

  describe('store persistence', () => {
    it('should maintain STORAGE_KEY constant', async () => {
      const { STORAGE_KEY } = await import('../HorseStore')
      expect(STORAGE_KEY).toBe('horses')
    })
  })

  describe('error handling edge cases', () => {
    it('should handle non-Error exceptions in generate', async () => {
      mockHorseService.generate.mockImplementation(() => {
        throw 'String error'
      })

      await horseStore.generate()

      expect(horseStore.error).toBe('Failed to generate horses')
    })

    it('should handle non-Error exceptions in load', async () => {
      mockHorseService.getAll.mockImplementation(() => {
        throw 'String error'
      })

      await horseStore.load()

      expect(horseStore.error).toBe('Failed to load horses')
    })

    it('should handle non-Error exceptions in clear', async () => {
      mockHorseService.clear.mockImplementation(() => {
        throw 'String error'
      })

      await horseStore.clear()

      expect(horseStore.error).toBe('Failed to clear horses')
    })
  })

  describe('integration scenarios', () => {
    it('should support generate -> load workflow', async () => {
      mockHorseService.generate.mockReturnValue(sampleHorses)
      mockHorseService.getAll.mockReturnValue(sampleHorses)

      await horseStore.generate()
      expect(horseStore.list).toEqual(sampleHorses)

      // Simulate app restart by clearing local state
      horseStore.list = []

      await horseStore.load()
      expect(horseStore.list).toEqual(sampleHorses)
    })

    it('should support generate -> clear -> load workflow', async () => {
      mockHorseService.generate.mockReturnValue(sampleHorses)
      mockHorseService.getAll.mockReturnValue([])

      await horseStore.generate()
      expect(horseStore.list).toEqual(sampleHorses)

      await horseStore.clear()
      expect(horseStore.list).toEqual([])

      await horseStore.load()
      expect(horseStore.list).toEqual([])
    })

    it('should handle concurrent operations gracefully', async () => {
      mockHorseService.generate.mockResolvedValue(sampleHorses)
      mockHorseService.getAll.mockReturnValue(sampleHorses)

      // Start multiple operations concurrently
      await Promise.all([horseStore.generate(), horseStore.load()])

      // Should not crash and should end up in a consistent state
      expect(horseStore.loading).toBe(false)
    })
  })

  describe('reactive updates', () => {
    it('should update computed properties reactively', () => {
      expect(horseStore.horseCount).toBe(0)
      expect(horseStore.hasError).toBe(false)

      horseStore.list = sampleHorses
      expect(horseStore.horseCount).toBe(3)

      horseStore.error = 'Test error'
      expect(horseStore.hasError).toBe(true)
      expect(horseStore.errorMessage).toBe('Test error')
    })
  })
})
