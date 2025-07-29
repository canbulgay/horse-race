import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RaceStateManager } from '../RaceStateManager'
import type { IHorse } from '@horses/types'

// Mock Date.now for consistent timing tests
const mockDateNow = vi.fn()
vi.stubGlobal('Date', { ...Date, now: mockDateNow })

describe('RaceStateManager', () => {
  let raceStateManager: RaceStateManager
  const sampleHorses: IHorse[] = [
    { id: 1, name: 'Thunder', colorHex: '#FF0000', colorName: 'red', condition: 85 },
    { id: 2, name: 'Lightning', colorHex: '#0000FF', colorName: 'blue', condition: 72 },
    { id: 3, name: 'Storm', colorHex: '#00FF00', colorName: 'green', condition: 90 }
  ]
  const sampleSpeeds = [0.5, 0.7, 0.6]

  beforeEach(() => {
    raceStateManager = new RaceStateManager()
    vi.clearAllMocks()
    mockDateNow.mockReturnValue(1000)
  })

  describe('initializeRace', () => {
    it('should initialize race state correctly', () => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)

      expect(raceStateManager.isRacing.value).toBe(true)
      expect(raceStateManager.isPaused.value).toBe(false)
      expect(raceStateManager.raceResult.value).toBeNull()
    })

    it('should set all horse positions to 0', () => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)

      sampleHorses.forEach(horse => {
        expect(raceStateManager.horsePositions[horse.id]).toBe(0)
      })
    })

    it('should create race data for each horse', () => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)

      const raceData = raceStateManager.getCurrentRaceData()
      expect(raceData).toHaveLength(3)
      
      raceData.forEach((data, index) => {
        expect(data.horse).toEqual(sampleHorses[index])
        expect(data.speed).toBe(sampleSpeeds[index])
        expect(data.distanceCovered).toBe(0)
        expect(data.finished).toBe(false)
        expect(data.finishTime).toBe(0)
      })
    })

    it('should reset timing state', () => {
      mockDateNow.mockReturnValue(5000)
      
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
      
      expect(mockDateNow).toHaveBeenCalled()
    })
  })

  describe('updateRaceProgress', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should update horse distances based on elapsed time', () => {
      const elapsedTime = 2000 // 2 seconds
      
      const updatedData = raceStateManager.updateRaceProgress(elapsedTime)
      
      expect(updatedData[0].distanceCovered).toBe(0.5 * 2000) // 1000
      expect(updatedData[1].distanceCovered).toBe(0.7 * 2000) // 1400
      expect(updatedData[2].distanceCovered).toBe(0.6 * 2000) // 1200
    })

    it('should not update finished horses', () => {
      const elapsedTime = 1000
      
      // Finish the first horse
      raceStateManager.finishHorse(0, 500)
      
      const updatedData = raceStateManager.updateRaceProgress(elapsedTime)
      
      expect(updatedData[0].distanceCovered).toBe(0) // Finished horse shouldn't update
      expect(updatedData[1].distanceCovered).toBe(0.7 * 1000)
      expect(updatedData[2].distanceCovered).toBe(0.6 * 1000)
    })

    it('should return current race data', () => {
      const result = raceStateManager.updateRaceProgress(1000)
      
      expect(result).toHaveLength(3)
      expect(result).toBe(raceStateManager.getCurrentRaceData())
    })
  })

  describe('finishHorse', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should mark horse as finished with correct time', () => {
      const finishTime = 3500
      
      raceStateManager.finishHorse(0, finishTime)
      
      const raceData = raceStateManager.getCurrentRaceData()
      expect(raceData[0].finished).toBe(true)
      expect(raceData[0].finishTime).toBe(finishTime)
    })

    it('should handle invalid horse index gracefully', () => {
      expect(() => raceStateManager.finishHorse(10, 1000)).not.toThrow()
      expect(() => raceStateManager.finishHorse(-1, 1000)).not.toThrow()
    })

    it('should not affect other horses', () => {
      raceStateManager.finishHorse(1, 2000)
      
      const raceData = raceStateManager.getCurrentRaceData()
      expect(raceData[0].finished).toBe(false)
      expect(raceData[2].finished).toBe(false)
    })
  })

  describe('updateHorseVisualPosition', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should update horse position in reactive state', () => {
      raceStateManager.updateHorseVisualPosition(1, 150)
      
      expect(raceStateManager.horsePositions[1]).toBe(150)
    })

    it('should update visual position in race data', () => {
      raceStateManager.updateHorseVisualPosition(1, 200)
      
      const raceData = raceStateManager.getCurrentRaceData()
      const horseData = raceData.find(data => data.horse.id === 1)
      expect(horseData?.visualPosition).toBe(200)
    })

    it('should handle non-existent horse ID gracefully', () => {
      expect(() => raceStateManager.updateHorseVisualPosition(999, 100)).not.toThrow()
      expect(raceStateManager.horsePositions[999]).toBe(100)
    })
  })

  describe('areAllHorsesFinished', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should return false when no horses are finished', () => {
      expect(raceStateManager.areAllHorsesFinished()).toBe(false)
    })

    it('should return false when some horses are finished', () => {
      raceStateManager.finishHorse(0, 1000)
      raceStateManager.finishHorse(1, 1200)
      
      expect(raceStateManager.areAllHorsesFinished()).toBe(false)
    })

    it('should return true when all horses are finished', () => {
      raceStateManager.finishHorse(0, 1000)
      raceStateManager.finishHorse(1, 1200)
      raceStateManager.finishHorse(2, 1100)
      
      expect(raceStateManager.areAllHorsesFinished()).toBe(true)
    })
  })

  describe('getFinishedHorses', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should return empty array when no horses are finished', () => {
      const finished = raceStateManager.getFinishedHorses()
      expect(finished).toEqual([])
    })

    it('should return finished horses sorted by finish time', () => {
      raceStateManager.finishHorse(1, 1200) // Second place
      raceStateManager.finishHorse(0, 1000) // First place
      raceStateManager.finishHorse(2, 1300) // Third place
      
      const finished = raceStateManager.getFinishedHorses()
      
      expect(finished).toHaveLength(3)
      expect(finished[0].horse.name).toBe('Thunder') // Fastest
      expect(finished[1].horse.name).toBe('Lightning') // Second
      expect(finished[2].horse.name).toBe('Storm') // Slowest
    })

    it('should only return finished horses', () => {
      raceStateManager.finishHorse(0, 1000)
      
      const finished = raceStateManager.getFinishedHorses()
      expect(finished).toHaveLength(1)
      expect(finished[0].horse.name).toBe('Thunder')
    })
  })

  describe('finalizeRace', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
      mockDateNow.mockReturnValue(6000) // 5 seconds after start
    })

    it('should create correct race result', () => {
      raceStateManager.finishHorse(1, 1200)
      raceStateManager.finishHorse(0, 1000)
      raceStateManager.finishHorse(2, 1300)
      
      const result = raceStateManager.finalizeRace(1600)
      
      expect(result.winner).toEqual(sampleHorses[0]) // Thunder (fastest)
      expect(result.distance).toBe(1600)
      expect(result.raceTime).toBe(5000) // 6000 - 1000
      expect(result.positions).toHaveLength(3)
    })

    it('should set positions correctly', () => {
      raceStateManager.finishHorse(1, 1200)
      raceStateManager.finishHorse(0, 1000)
      raceStateManager.finishHorse(2, 1300)
      
      const result = raceStateManager.finalizeRace(1600)
      
      expect(result.positions[0].position).toBe(1)
      expect(result.positions[0].horse.name).toBe('Thunder')
      expect(result.positions[1].position).toBe(2)
      expect(result.positions[1].horse.name).toBe('Lightning')
      expect(result.positions[2].position).toBe(3)
      expect(result.positions[2].horse.name).toBe('Storm')
    })

    it('should set race state to not racing', () => {
      raceStateManager.finishHorse(0, 1000)
      
      raceStateManager.finalizeRace(1600)
      
      expect(raceStateManager.isRacing.value).toBe(false)
      expect(raceStateManager.isPaused.value).toBe(false)
    })

    it('should store result in raceResult', () => {
      raceStateManager.finishHorse(0, 1000)
      
      const result = raceStateManager.finalizeRace(1600)
      
      expect(raceStateManager.raceResult.value).toEqual(result)
    })

    it('should account for paused time in race duration', () => {
      // Initialize the race first
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
      
      // Simulate pause/resume
      raceStateManager.pauseRace()
      mockDateNow.mockReturnValue(3000)
      raceStateManager.resumeRace()
      mockDateNow.mockReturnValue(8000)
      
      raceStateManager.finishHorse(0, 1000)
      const result = raceStateManager.finalizeRace(1600)
      
      // Race time should exclude the 2-second pause (3000-1000 = 2000ms paused)
      expect(result.raceTime).toBe(5000) // 8000 - 1000 - 2000
    })
  })

  describe('pause and resume functionality', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should pause race when racing and not paused', () => {
      mockDateNow.mockReturnValue(2000)
      
      raceStateManager.pauseRace()
      
      expect(raceStateManager.isPaused.value).toBe(true)
    })

    it('should not pause when already paused', () => {
      raceStateManager.pauseRace()
      const firstPauseState = raceStateManager.isPaused.value
      
      raceStateManager.pauseRace()
      
      expect(raceStateManager.isPaused.value).toBe(firstPauseState)
    })

    it('should not pause when not racing', () => {
      raceStateManager.resetRace()
      
      raceStateManager.pauseRace()
      
      expect(raceStateManager.isPaused.value).toBe(false)
    })

    it('should resume race correctly', () => {
      mockDateNow.mockReturnValue(2000)
      raceStateManager.pauseRace()
      mockDateNow.mockReturnValue(4000)
      
      raceStateManager.resumeRace()
      
      expect(raceStateManager.isPaused.value).toBe(false)
    })

    it('should track total paused time', () => {
      // First pause/resume cycle
      mockDateNow.mockReturnValue(2000)
      raceStateManager.pauseRace()
      mockDateNow.mockReturnValue(3000)
      raceStateManager.resumeRace()
      
      // Second pause/resume cycle
      mockDateNow.mockReturnValue(5000)
      raceStateManager.pauseRace()
      mockDateNow.mockReturnValue(6500)
      raceStateManager.resumeRace()
      
      // Finalize to check total paused time
      mockDateNow.mockReturnValue(8000)
      raceStateManager.finishHorse(0, 1000)
      const result = raceStateManager.finalizeRace(1600)
      
      // Total paused time: (3000-2000) + (6500-5000) = 2500ms
      // Race time: 8000 - 1000 - 2500 = 4500ms
      expect(result.raceTime).toBe(4500)
    })
  })

  describe('resetRace', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
      raceStateManager.finishHorse(0, 1000)
      raceStateManager.updateHorseVisualPosition(1, 150)
    })

    it('should reset all race state', () => {
      raceStateManager.resetRace()
      
      expect(raceStateManager.isRacing.value).toBe(false)
      expect(raceStateManager.isPaused.value).toBe(false)
      expect(raceStateManager.raceResult.value).toBeNull()
    })

    it('should clear horse positions', () => {
      raceStateManager.resetRace()
      
      sampleHorses.forEach(horse => {
        expect(raceStateManager.horsePositions[horse.id]).toBe(0)
      })
    })

    it('should clear race data', () => {
      raceStateManager.resetRace()
      
      const raceData = raceStateManager.getCurrentRaceData()
      expect(raceData).toEqual([])
    })
  })

  describe('getCurrentElapsedTime', () => {
    beforeEach(() => {
      mockDateNow.mockReturnValue(1000)
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should return elapsed time without pauses', () => {
      mockDateNow.mockReturnValue(4000)
      
      const elapsed = raceStateManager.getCurrentElapsedTime()
      
      expect(elapsed).toBe(3000) // 4000 - 1000
    })

    it('should exclude paused time from elapsed time', () => {
      mockDateNow.mockReturnValue(2000)
      raceStateManager.pauseRace()
      mockDateNow.mockReturnValue(3500)
      raceStateManager.resumeRace()
      mockDateNow.mockReturnValue(5000)
      
      const elapsed = raceStateManager.getCurrentElapsedTime()
      
      // 5000 - 1000 - 1500 (paused time) = 2500
      expect(elapsed).toBe(2500)
    })
  })

  describe('updateHorsePositionsFromExternal', () => {
    beforeEach(() => {
      raceStateManager.initializeRace(sampleHorses, sampleSpeeds)
    })

    it('should update multiple horse positions at once', () => {
      const newPositions = { 1: 100, 2: 150, 3: 75 }
      
      raceStateManager.updateHorsePositionsFromExternal(newPositions)
      
      expect(raceStateManager.horsePositions[1]).toBe(100)
      expect(raceStateManager.horsePositions[2]).toBe(150)
      expect(raceStateManager.horsePositions[3]).toBe(75)
    })

    it('should merge with existing positions', () => {
      raceStateManager.updateHorseVisualPosition(1, 50)
      
      const newPositions = { 2: 150, 3: 75 }
      raceStateManager.updateHorsePositionsFromExternal(newPositions)
      
      expect(raceStateManager.horsePositions[1]).toBe(50) // Unchanged
      expect(raceStateManager.horsePositions[2]).toBe(150) // Updated
      expect(raceStateManager.horsePositions[3]).toBe(75) // Updated
    })
  })
})