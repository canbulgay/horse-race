import { describe, it, expect, beforeEach, vi } from 'vitest'
import { faker } from '@faker-js/faker'
import { HorseFactory } from '../HorseFactory'
import { GAME_CONFIG } from '@/core/contants'

vi.mock('@/core/utils', () => ({
  getColorName: vi.fn((hex: string) => `Color-${hex}`),
}))

vi.mock('@faker-js/faker', () => ({
  faker: {
    helpers: {
      uniqueArray: vi.fn(),
    },
    animal: {
      horse: vi.fn(),
    },
    color: {
      rgb: vi.fn(),
    },
  },
}))

describe('HorseFactory', () => {
  let horseFactory: HorseFactory
  const mockUniqueArray = vi.mocked(faker.helpers.uniqueArray)
  const mockHorseName = vi.mocked(faker.animal.horse)
  const mockColorRgb = vi.mocked(faker.color.rgb)

  beforeEach(() => {
    horseFactory = new HorseFactory()
    vi.clearAllMocks()

    // Default mock implementations
    mockUniqueArray.mockImplementation((fn, count) => {
      return Array.from({ length: count }, (_, i) => fn())
    })
  })

  describe('create', () => {
    it('should create default number of horses when no parameters provided', () => {
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create()

      expect(horses).toHaveLength(GAME_CONFIG.HORSES_COUNT)
      expect(mockUniqueArray).toHaveBeenCalledTimes(2) // Once for names, once for colors
    })

    it('should create specified number of horses', () => {
      const count = 5
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(count)

      expect(horses).toHaveLength(count)
    })

    it('should create horses with correct structure', () => {
      mockHorseName.mockReturnValue('Thunder Bolt Speed Runner')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(1)
      const horse = horses[0]

      expect(horse).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        colorName: expect.any(String),
        colorHex: expect.any(String),
        condition: expect.any(Number),
      })
    })

    it('should assign sequential IDs starting from 0', () => {
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(3)

      expect(horses[0].id).toBe(0)
      expect(horses[1].id).toBe(1)
      expect(horses[2].id).toBe(2)
    })

    it('should truncate horse names to 3 words maximum', () => {
      mockHorseName.mockReturnValue('Thunder Bolt Speed Runner Extra Long Name')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(1)

      expect(horses[0].name).toBe('Thunder Bolt Speed')
    })

    it('should handle single word horse names', () => {
      mockHorseName.mockReturnValue('Thunder')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(1)

      expect(horses[0].name).toBe('Thunder')
    })

    it('should use default condition range when not specified', () => {
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(10)

      horses.forEach((horse) => {
        expect(horse.condition).toBeGreaterThanOrEqual(GAME_CONFIG.MIN_CONDITION)
        expect(horse.condition).toBeLessThanOrEqual(GAME_CONFIG.MAX_CONDITION)
      })
    })

    it('should respect custom condition range', () => {
      const customRange = { min: 50, max: 75 }
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(10, customRange)

      horses.forEach((horse) => {
        expect(horse.condition).toBeGreaterThanOrEqual(50)
        expect(horse.condition).toBeLessThanOrEqual(75)
      })
    })

    it('should generate unique names and colors', () => {
      const names = ['Thunder', 'Lightning', 'Storm']
      const colors = ['#FF0000', '#00FF00', '#0000FF']

      mockUniqueArray.mockReturnValueOnce(names).mockReturnValueOnce(colors)

      horseFactory.create(3)

      expect(mockUniqueArray).toHaveBeenCalledWith(mockHorseName, 3)
      expect(mockUniqueArray).toHaveBeenCalledWith(expect.any(Function), 3)
    })

    it('should call getColorName with hex colors', async () => {
      const { getColorName } = await import('@/core/utils')
      mockHorseName.mockReturnValue('Thunder')
      mockColorRgb.mockReturnValue('#FF0000')

      horseFactory.create(1)

      expect(getColorName).toHaveBeenCalledWith('#FF0000')
    })

    it('should handle edge case of creating 0 horses', () => {
      const horses = horseFactory.create(0)

      expect(horses).toHaveLength(0)
      expect(horses).toEqual([])
    })

    it('should create horses with different conditions (randomness test)', () => {
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(20)
      const conditions = horses.map((h) => h.condition)
      const uniqueConditions = new Set(conditions)

      // With 20 horses and random conditions, we should have some variety
      // This is probabilistic, but very likely to pass
      expect(uniqueConditions.size).toBeGreaterThan(5)
    })

    it('should handle boundary condition values correctly', () => {
      const boundaryRange = { min: 1, max: 1 }
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      const horses = horseFactory.create(5, boundaryRange)

      horses.forEach((horse) => {
        expect(horse.condition).toBe(1)
      })
    })
  })

  describe('private getRandomInt method', () => {
    it('should generate numbers within the specified range', () => {
      mockHorseName.mockReturnValue('Thunder Bolt')
      mockColorRgb.mockReturnValue('#FF0000')

      // Test through the public create method
      const horses = horseFactory.create(100, { min: 10, max: 15 })

      const conditions = horses.map((h) => h.condition)
      const minCondition = Math.min(...conditions)
      const maxCondition = Math.max(...conditions)

      expect(minCondition).toBeGreaterThanOrEqual(10)
      expect(maxCondition).toBeLessThanOrEqual(15)
    })
  })

  describe('error handling', () => {
    it('should handle faker errors gracefully', () => {
      mockUniqueArray.mockImplementation(() => {
        throw new Error('Faker error')
      })

      expect(() => horseFactory.create(1)).toThrow('Faker error')
    })

    it('should handle empty names array from faker', () => {
      mockUniqueArray.mockReturnValueOnce([]).mockReturnValueOnce(['#FF0000'])

      const horses = horseFactory.create(0)
      expect(horses).toHaveLength(0)
    })
  })
})
