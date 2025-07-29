import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateRaceDuration,
  calculateHorseSpeed,
  calculateVisualPosition,
  calculateDistanceCovered,
} from '../race'
import { GAME_CONFIG } from '@core/contants'
import type { IHorse } from '@horses/types'

describe('race utilities', () => {
  const sampleHorse: IHorse = {
    id: 1,
    name: 'Thunder',
    colorHex: '#FF0000',
    colorName: 'red',
    condition: 75,
  }

  describe('calculateRaceDuration', () => {
    it('should return base duration for base distance', () => {
      const baseDistance = GAME_CONFIG.TRACK_DISTANCES[0] // 1200
      const expectedDuration = GAME_CONFIG.ANIMATION_DURATION * 1.2 // 5000 * 1.2 = 6000

      const result = calculateRaceDuration(baseDistance)

      expect(result).toBeCloseTo(expectedDuration)
    })

    it('should scale duration correctly for different distances', () => {
      const baseDistance = GAME_CONFIG.TRACK_DISTANCES[0] // 1200
      const doubleDistance = baseDistance * 2 // 2400

      const baseDuration = calculateRaceDuration(baseDistance)
      const doubleDuration = calculateRaceDuration(doubleDistance)

      // Duration should scale with square root of distance ratio
      const expectedScaleFactor = Math.sqrt(2) * 1.2
      expect(doubleDuration).toBeCloseTo(baseDuration * Math.sqrt(2))
    })

    it('should handle shorter distances', () => {
      const shortDistance = 600 // Half of base distance
      const baseDuration = calculateRaceDuration(GAME_CONFIG.TRACK_DISTANCES[0])

      const result = calculateRaceDuration(shortDistance)

      expect(result).toBeLessThan(baseDuration)
      expect(result).toBeCloseTo(baseDuration * Math.sqrt(0.5))
    })

    it('should handle longer distances', () => {
      const longDistance = 4800 // 4x base distance
      const baseDuration = calculateRaceDuration(GAME_CONFIG.TRACK_DISTANCES[0])

      const result = calculateRaceDuration(longDistance)

      expect(result).toBeGreaterThan(baseDuration)
      expect(result).toBeCloseTo(baseDuration * Math.sqrt(4))
    })

    it('should handle edge case of zero distance', () => {
      const result = calculateRaceDuration(0)

      expect(result).toBe(0)
    })

    it('should handle very small distances', () => {
      const tinyDistance = 1
      const result = calculateRaceDuration(tinyDistance)

      expect(result).toBeGreaterThan(0)
    })

    it('should handle very large distances', () => {
      const hugeDistance = 100000
      const result = calculateRaceDuration(hugeDistance)

      expect(result).toBeGreaterThan(0)
      expect(isFinite(result)).toBe(true)
    })
  })

  describe('calculateHorseSpeed', () => {
    const baseDistance = 1200
    const baseDuration = 6000

    beforeEach(() => {
      // Mock Math.random to return consistent values for testing
      vi.spyOn(Math, 'random').mockReturnValue(0.5) // Will give randomEffect of 1.0
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should calculate speed based on horse condition', () => {
      const perfectHorse: IHorse = { ...sampleHorse, condition: 100 }
      const poorHorse: IHorse = { ...sampleHorse, condition: 0 }

      const perfectSpeed = calculateHorseSpeed(perfectHorse, baseDistance, baseDuration)
      const poorSpeed = calculateHorseSpeed(poorHorse, baseDistance, baseDuration)

      expect(perfectSpeed).toBeGreaterThan(poorSpeed)
    })

    it('should include base speed effect from distance and duration', () => {
      const expectedBaseSpeed = baseDistance / baseDuration // 0.2

      const speed = calculateHorseSpeed(sampleHorse, baseDistance, baseDuration)

      // Speed should be influenced by the base speed
      expect(speed).toBeGreaterThan(0)
      // Should be influenced by the base speed calculation
    })

    it('should apply condition effect correctly', () => {
      const horse75Condition: IHorse = { ...sampleHorse, condition: 75 }
      const horse50Condition: IHorse = { ...sampleHorse, condition: 50 }

      const speed75 = calculateHorseSpeed(horse75Condition, baseDistance, baseDuration)
      const speed50 = calculateHorseSpeed(horse50Condition, baseDistance, baseDuration)

      expect(speed75).toBeGreaterThan(speed50)
    })

    it('should apply random effect within expected range', () => {
      vi.restoreAllMocks()
      const speeds: number[] = []

      // Generate multiple speeds to test randomness
      for (let i = 0; i < 100; i++) {
        speeds.push(calculateHorseSpeed(sampleHorse, baseDistance, baseDuration))
      }

      const minSpeed = Math.min(...speeds)
      const maxSpeed = Math.max(...speeds)

      // Speeds should vary due to random effect
      expect(maxSpeed).toBeGreaterThan(minSpeed)

      // All speeds should be positive
      speeds.forEach((speed) => {
        expect(speed).toBeGreaterThan(0)
      })
    })

    it('should handle edge case conditions', () => {
      const minConditionHorse: IHorse = { ...sampleHorse, condition: 0 }
      const maxConditionHorse: IHorse = { ...sampleHorse, condition: 100 }

      const minSpeed = calculateHorseSpeed(minConditionHorse, baseDistance, baseDuration)
      const maxSpeed = calculateHorseSpeed(maxConditionHorse, baseDistance, baseDuration)

      expect(minSpeed).toBeGreaterThan(0)
      expect(maxSpeed).toBeGreaterThan(minSpeed)
      expect(isFinite(minSpeed)).toBe(true)
      expect(isFinite(maxSpeed)).toBe(true)
    })

    it('should handle different race parameters', () => {
      const shortRace = calculateHorseSpeed(sampleHorse, 600, 3000)
      const longRace = calculateHorseSpeed(sampleHorse, 2400, 12000)

      expect(shortRace).toBeGreaterThan(0)
      expect(longRace).toBeGreaterThan(0)
    })

    it('should handle zero duration gracefully', () => {
      expect(() => calculateHorseSpeed(sampleHorse, baseDistance, 0)).not.toThrow()
      const result = calculateHorseSpeed(sampleHorse, baseDistance, 0)
      expect(result).toBe(Infinity) // Division by zero case
    })
  })

  describe('calculateVisualPosition', () => {
    const trackWidth = 800

    it('should return 0 for no distance covered', () => {
      const result = calculateVisualPosition(0, 1200, trackWidth)
      expect(result).toBe(0)
    })

    it('should return full track width when distance equals total distance', () => {
      const result = calculateVisualPosition(1200, 1200, trackWidth)
      expect(result).toBe(trackWidth)
    })

    it('should calculate proportional position correctly', () => {
      const result = calculateVisualPosition(600, 1200, trackWidth) // 50% progress
      expect(result).toBe(trackWidth * 0.5)
    })

    it('should handle quarter progress', () => {
      const result = calculateVisualPosition(300, 1200, trackWidth) // 25% progress
      expect(result).toBe(trackWidth * 0.25)
    })

    it('should handle three-quarter progress', () => {
      const result = calculateVisualPosition(900, 1200, trackWidth) // 75% progress
      expect(result).toBe(trackWidth * 0.75)
    })

    it('should cap at track width when distance exceeds total', () => {
      const result = calculateVisualPosition(1500, 1200, trackWidth) // 125% progress
      expect(result).toBe(trackWidth) // Should be capped at 100%
    })

    it('should handle very large overage gracefully', () => {
      const result = calculateVisualPosition(12000, 1200, trackWidth) // 1000% progress
      expect(result).toBe(trackWidth)
    })

    it('should handle decimal distances', () => {
      const result = calculateVisualPosition(150.5, 1200, trackWidth)
      expect(result).toBeCloseTo(trackWidth * (150.5 / 1200))
    })

    it('should handle zero total distance', () => {
      const result = calculateVisualPosition(100, 0, trackWidth)
      expect(result).toBe(trackWidth) // Should cap at track width
    })

    it('should handle negative actual distance', () => {
      const result = calculateVisualPosition(-100, 1200, trackWidth)
      expect(result).toBeCloseTo(-66.67)
    })

    it('should handle different track widths', () => {
      const smallTrack = calculateVisualPosition(600, 1200, 400)
      const largeTrack = calculateVisualPosition(600, 1200, 1600)

      expect(smallTrack).toBe(200) // 50% of 400
      expect(largeTrack).toBe(800) // 50% of 1600
    })

    it('should handle zero track width', () => {
      const result = calculateVisualPosition(600, 1200, 0)
      expect(result).toBe(0)
    })
  })

  describe('calculateDistanceCovered', () => {
    it('should calculate distance correctly with positive speed and time', () => {
      const speed = 0.5 // units per millisecond
      const time = 2000 // 2 seconds

      const result = calculateDistanceCovered(speed, time)

      expect(result).toBe(1000) // 0.5 * 2000
    })

    it('should handle zero speed', () => {
      const result = calculateDistanceCovered(0, 5000)
      expect(result).toBe(0)
    })

    it('should handle zero time', () => {
      const result = calculateDistanceCovered(0.5, 0)
      expect(result).toBe(0)
    })

    it('should handle decimal speeds', () => {
      const result = calculateDistanceCovered(0.333, 3000)
      expect(result).toBeCloseTo(999) // 0.333 * 3000
    })

    it('should handle decimal time', () => {
      const result = calculateDistanceCovered(0.5, 1500.5)
      expect(result).toBeCloseTo(750.25) // 0.5 * 1500.5
    })

    it('should handle very small speeds', () => {
      const result = calculateDistanceCovered(0.001, 10000)
      expect(result).toBe(10)
    })

    it('should handle very large speeds', () => {
      const result = calculateDistanceCovered(1000, 1)
      expect(result).toBe(1000)
    })

    it('should handle negative speed (edge case)', () => {
      const result = calculateDistanceCovered(-0.5, 2000)
      expect(result).toBe(-1000) // Mathematical result, though logically unusual
    })

    it('should handle negative time (edge case)', () => {
      const result = calculateDistanceCovered(0.5, -2000)
      expect(result).toBe(-1000) // Mathematical result, though logically unusual
    })

    it('should maintain precision with multiple calculations', () => {
      const speed = 0.12345
      const times = [1000, 2000, 3000, 4000, 5000]

      const results = times.map((time) => calculateDistanceCovered(speed, time))

      expect(results[0]).toBeCloseTo(123.45)
      expect(results[1]).toBeCloseTo(246.9)
      expect(results[2]).toBeCloseTo(370.35)
      expect(results[3]).toBeCloseTo(493.8)
      expect(results[4]).toBeCloseTo(617.25)
    })
  })

  describe('integration between utilities', () => {
    it('should work together in a typical race scenario', () => {
      const distance = 1600
      const horse: IHorse = {
        id: 1,
        name: 'Test',
        colorHex: '#000',
        colorName: 'black',
        condition: 80,
      }
      const trackWidth = 1000

      // Calculate race parameters
      const duration = calculateRaceDuration(distance)
      const speed = calculateHorseSpeed(horse, distance, duration)

      // Simulate mid-race
      const halfTime = duration / 2
      const distanceCovered = calculateDistanceCovered(speed, halfTime)
      const visualPosition = calculateVisualPosition(distanceCovered, distance, trackWidth)

      expect(duration).toBeGreaterThan(0)
      expect(speed).toBeGreaterThan(0)
      expect(distanceCovered).toBeGreaterThan(0)
      expect(visualPosition).toBeGreaterThan(0)
      expect(visualPosition).toBeLessThanOrEqual(trackWidth)
    })

    it('should handle race completion scenario', () => {
      const distance = 1200
      const horse: IHorse = {
        id: 1,
        name: 'Test',
        colorHex: '#000',
        colorName: 'black',
        condition: 90,
      }
      const trackWidth = 800

      const duration = calculateRaceDuration(distance)
      const speed = calculateHorseSpeed(horse, distance, duration)

      // Simulate race completion
      const finalTime = duration * 1.1 // A bit over estimated duration
      const distanceCovered = calculateDistanceCovered(speed, finalTime)
      const visualPosition = calculateVisualPosition(distanceCovered, distance, trackWidth)

      expect(distanceCovered).toBeGreaterThanOrEqual(distance) // Should have finished
      expect(visualPosition).toBe(trackWidth) // Should be at finish line
    })
  })
})
