import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useRaceGame, resetGlobalState } from '../useRaceGame'
import { RaceStateManager } from '../../services/RaceStateManager'
import { AnimationService } from '../../services/AnimationService'
import {
  calculateRaceDuration,
  calculateHorseSpeed,
  calculateVisualPosition,
} from '../../utils/race'
import type { IRace } from '../../types'
import type { IHorse } from '@horses/types'
import { ref } from 'vue'

// Mock dependencies
vi.mock('../../services/RaceStateManager')
vi.mock('../../services/AnimationService')
vi.mock('../../utils/race')

// Mock console methods
const mockConsoleLog = vi.fn()
const mockConsoleWarn = vi.fn()
Object.defineProperty(global.console, 'log', { value: mockConsoleLog })
Object.defineProperty(global.console, 'warn', { value: mockConsoleWarn })

describe('useRaceGame', () => {
  let mockStateManager: any
  let mockAnimationService: any
  let mockCalculateRaceDuration: any
  let mockCalculateHorseSpeed: any
  let mockCalculateVisualPosition: any

  const sampleHorses: IHorse[] = [
    { id: 1, name: 'Thunder', colorHex: '#FF0000', colorName: 'red', condition: 85 },
    { id: 2, name: 'Lightning', colorHex: '#0000FF', colorName: 'blue', condition: 72 },
    { id: 3, name: 'Storm', colorHex: '#00FF00', colorName: 'green', condition: 90 },
  ]

  const sampleRace: IRace = {
    round: 1,
    horses: sampleHorses,
    status: 'pending',
    distance: 1200,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    resetGlobalState()

    // Setup RaceStateManager mock
    mockStateManager = {
      isRacing: ref(false),
      isPaused: ref(false),
      raceResult: ref(null),
      horsePositions: ref({}),
      initializeRace: vi.fn(),
      getCurrentElapsedTime: vi.fn(),
      updateRaceProgress: vi.fn(),
      updateHorseVisualPosition: vi.fn(),
      finishHorse: vi.fn(),
      areAllHorsesFinished: vi.fn(),
      finalizeRace: vi.fn(),
      pauseRace: vi.fn(),
      resumeRace: vi.fn(),
      resetRace: vi.fn(),
      updateHorsePositionsFromExternal: vi.fn(),
    }

    // Setup AnimationService mock that doesn't execute callback immediately
    mockAnimationService = {
      getTrackWidth: vi.fn().mockReturnValue(800),
      startAnimation: vi.fn().mockReturnValue(123),
      cancelAnimation: vi.fn(),
      captureCurrentPositions: vi.fn().mockReturnValue({ 1: 100, 2: 150, 3: 75 }),
      updateHorsePosition: vi.fn(),
    }

    // Setup utility function mocks
    mockCalculateRaceDuration = vi.mocked(calculateRaceDuration).mockReturnValue(6000)
    mockCalculateHorseSpeed = vi.mocked(calculateHorseSpeed).mockReturnValue(0.5)
    mockCalculateVisualPosition = vi.mocked(calculateVisualPosition).mockReturnValue(200)

    // Setup constructor mocks
    vi.mocked(RaceStateManager).mockImplementation(() => mockStateManager as any)
    vi.mocked(AnimationService).mockImplementation(() => mockAnimationService as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('initialization', () => {
    it('should create RaceStateManager instance', () => {
      useRaceGame()

      expect(RaceStateManager).toHaveBeenCalledTimes(1)
    })

    it('should use provided animation controller', () => {
      const customAnimationService = new AnimationService()

      useRaceGame(customAnimationService)

      expect(RaceStateManager).toHaveBeenCalledTimes(1)
      // The custom animation service should be used instead of creating a new one
    })

    it('should expose reactive state from RaceStateManager', () => {
      const raceGame = useRaceGame()

      expect(raceGame.isRacing).toBe(mockStateManager.isRacing)
      expect(raceGame.isPaused).toBe(mockStateManager.isPaused)
      expect(raceGame.raceResult).toBe(mockStateManager.raceResult)
      expect(raceGame.horsePositions).toBe(mockStateManager.horsePositions)
    })

    it('should expose all public methods', () => {
      const raceGame = useRaceGame()

      expect(typeof raceGame.startRace).toBe('function')
      expect(typeof raceGame.resetRace).toBe('function')
      expect(typeof raceGame.pauseRace).toBe('function')
      expect(typeof raceGame.resumeRace).toBe('function')
      expect(typeof raceGame.toggleRace).toBe('function')
    })
  })

  describe('startRace', () => {
    it('should initialize race correctly', () => {
      const raceGame = useRaceGame(mockAnimationService)

      // Call startRace but don't await - we just want to test initialization
      raceGame.startRace(sampleRace)

      expect(mockCalculateRaceDuration).toHaveBeenCalledWith(1200)
      expect(mockCalculateHorseSpeed).toHaveBeenCalledTimes(3)
      expect(mockStateManager.initializeRace).toHaveBeenCalledWith(sampleHorses, [0.5, 0.5, 0.5])
      expect(mockAnimationService.getTrackWidth).toHaveBeenCalled()
      expect(mockAnimationService.startAnimation).toHaveBeenCalledWith(expect.any(Function))
    })

    it('should use default distance when race distance is not provided', () => {
      const raceGame = useRaceGame(mockAnimationService)
      const raceWithoutDistance = { ...sampleRace, distance: undefined }

      raceGame.startRace(raceWithoutDistance)

      expect(mockCalculateRaceDuration).toHaveBeenCalledWith(1200)
    })

    it('should not start race if already racing', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true

      raceGame.startRace(sampleRace)

      expect(mockConsoleWarn).toHaveBeenCalledWith('Race already in progress')
      expect(mockStateManager.initializeRace).not.toHaveBeenCalled()
    })

    it('should handle race with zero horses', () => {
      const raceGame = useRaceGame(mockAnimationService)
      const emptyRace = { ...sampleRace, horses: [] }

      raceGame.startRace(emptyRace)

      expect(mockCalculateHorseSpeed).not.toHaveBeenCalled()
      expect(mockStateManager.initializeRace).toHaveBeenCalledWith([], [])
    })

    it('should call console log when starting race', () => {
      const raceGame = useRaceGame(mockAnimationService)

      raceGame.startRace(sampleRace)

      expect(mockConsoleLog).toHaveBeenCalledWith('Starting 1200m race (estimated 6.0s)')
    })
  })

  describe('pauseRace', () => {
    it('should pause race when racing and not paused', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = false

      raceGame.pauseRace()

      expect(mockAnimationService.captureCurrentPositions).toHaveBeenCalled()
      expect(mockStateManager.updateHorsePositionsFromExternal).toHaveBeenCalledWith({
        1: 100,
        2: 150,
        3: 75,
      })
      expect(mockStateManager.pauseRace).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Race paused')
    })

    it('should not pause when not racing', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = false
      mockStateManager.isPaused.value = false

      raceGame.pauseRace()

      expect(mockAnimationService.captureCurrentPositions).not.toHaveBeenCalled()
      expect(mockStateManager.pauseRace).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Race paused')
    })

    it('should not pause when already paused', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = true

      raceGame.pauseRace()

      expect(mockAnimationService.captureCurrentPositions).not.toHaveBeenCalled()
      expect(mockStateManager.pauseRace).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Race paused')
    })
  })

  describe('resumeRace', () => {
    it('should resume race when racing and paused', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = true

      raceGame.resumeRace()

      expect(mockStateManager.resumeRace).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Race resumed')
    })

    it('should not resume when not racing', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = false
      mockStateManager.isPaused.value = true

      raceGame.resumeRace()

      expect(mockStateManager.resumeRace).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Race resumed')
    })

    it('should not resume when not paused', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = false

      raceGame.resumeRace()

      expect(mockStateManager.resumeRace).not.toHaveBeenCalled()
      expect(mockConsoleLog).not.toHaveBeenCalledWith('Race resumed')
    })
  })

  describe('toggleRace', () => {
    it('should start race when not racing', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = false

      const result = raceGame.toggleRace(sampleRace)

      expect(result).toBeInstanceOf(Promise)
      expect(mockStateManager.initializeRace).toHaveBeenCalled()
    })

    it('should resume race when racing and paused', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = true

      const result = raceGame.toggleRace(sampleRace)

      expect(result).toBeUndefined()
      expect(mockStateManager.resumeRace).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Race resumed')
    })

    it('should pause race when racing and not paused', () => {
      const raceGame = useRaceGame(mockAnimationService)
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = false

      const result = raceGame.toggleRace(sampleRace)

      expect(result).toBeUndefined()
      expect(mockStateManager.pauseRace).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Race paused')
    })
  })

  describe('resetRace', () => {
    it('should reset race and cancel animation when animation is running', () => {
      const raceGame = useRaceGame(mockAnimationService)

      // Simulate animation running by starting a race
      mockStateManager.areAllHorsesFinished.mockReturnValue(false)
      raceGame.startRace(sampleRace)

      raceGame.resetRace()

      expect(mockAnimationService.cancelAnimation).toHaveBeenCalledWith(123)
      expect(mockStateManager.resetRace).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Race reset')
    })

    it('should reset race without canceling animation when no animation running', () => {
      const raceGame = useRaceGame(mockAnimationService)

      raceGame.resetRace()

      expect(mockAnimationService.cancelAnimation).not.toHaveBeenCalled()
      expect(mockStateManager.resetRace).toHaveBeenCalled()
      expect(mockConsoleLog).toHaveBeenCalledWith('Race reset')
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle race with very long distance', () => {
      const raceGame = useRaceGame(mockAnimationService)
      const longRace = { ...sampleRace, distance: 5000 }

      raceGame.startRace(longRace)

      expect(mockCalculateRaceDuration).toHaveBeenCalledWith(5000)
    })

    it('should handle race with very short distance', () => {
      const raceGame = useRaceGame(mockAnimationService)
      const shortRace = { ...sampleRace, distance: 100 }

      raceGame.startRace(shortRace)

      expect(mockCalculateRaceDuration).toHaveBeenCalledWith(100)
    })

    it('should handle horses with extreme conditions', () => {
      const raceGame = useRaceGame(mockAnimationService)
      const extremeHorses: IHorse[] = [
        { id: 1, name: 'Perfect', colorHex: '#FF0000', colorName: 'red', condition: 100 },
        { id: 2, name: 'Terrible', colorHex: '#0000FF', colorName: 'blue', condition: 0 },
      ]
      const extremeRace = { ...sampleRace, horses: extremeHorses }

      raceGame.startRace(extremeRace)

      expect(mockCalculateHorseSpeed).toHaveBeenCalledWith(extremeHorses[0], 1200, 6000)
      expect(mockCalculateHorseSpeed).toHaveBeenCalledWith(extremeHorses[1], 1200, 6000)
    })
  })

  describe('animation lifecycle', () => {
    it('should start animation with correct callback', () => {
      const raceGame = useRaceGame(mockAnimationService)

      raceGame.startRace(sampleRace)

      expect(mockAnimationService.startAnimation).toHaveBeenCalledWith(expect.any(Function))
    })
  })

  describe('integration scenarios', () => {
    it('should support pause -> resume workflow', () => {
      const raceGame = useRaceGame(mockAnimationService)

      // Test pause race functionality
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = false
      raceGame.pauseRace()
      expect(mockStateManager.pauseRace).toHaveBeenCalled()

      // Test resume race functionality
      mockStateManager.isPaused.value = true
      raceGame.resumeRace()
      expect(mockStateManager.resumeRace).toHaveBeenCalled()
    })

    it('should support race restart workflow: start -> reset -> start', () => {
      const raceGame = useRaceGame(mockAnimationService)

      // Start first race
      raceGame.startRace(sampleRace)
      expect(mockStateManager.initializeRace).toHaveBeenCalledTimes(1)

      // Reset race
      raceGame.resetRace()
      expect(mockStateManager.resetRace).toHaveBeenCalled()

      // Start second race
      mockStateManager.isRacing.value = false
      raceGame.startRace(sampleRace)
      expect(mockStateManager.initializeRace).toHaveBeenCalledTimes(2)
    })

    it('should handle multiple rapid toggle operations', () => {
      const raceGame = useRaceGame(mockAnimationService)

      // Toggle from not racing to racing
      mockStateManager.isRacing.value = false
      raceGame.toggleRace(sampleRace)

      // Toggle from racing to paused
      mockStateManager.isRacing.value = true
      mockStateManager.isPaused.value = false
      raceGame.toggleRace(sampleRace)
      expect(mockStateManager.pauseRace).toHaveBeenCalled()

      // Toggle from paused to resumed
      mockStateManager.isPaused.value = true
      raceGame.toggleRace(sampleRace)
      expect(mockStateManager.resumeRace).toHaveBeenCalled()
    })
  })

  describe('performance considerations', () => {
    it('should create singleton state managers', () => {
      useRaceGame()
      useRaceGame()
      useRaceGame()

      // With singleton pattern, RaceStateManager should only be created once
      expect(RaceStateManager).toHaveBeenCalledTimes(1)
    })

    it('should reuse provided animation service', () => {
      const sharedAnimationService = mockAnimationService

      useRaceGame(sharedAnimationService)
      useRaceGame(sharedAnimationService)

      // Should not create new AnimationService instances when provided
      expect(AnimationService).not.toHaveBeenCalled()
    })

    it('should handle rapid startRace calls efficiently', () => {
      const raceGame = useRaceGame(mockAnimationService)

      // First call should proceed
      mockStateManager.isRacing.value = false
      raceGame.startRace(sampleRace)

      // Second call should be ignored when racing
      mockStateManager.isRacing.value = true
      raceGame.startRace(sampleRace)

      expect(mockStateManager.initializeRace).toHaveBeenCalledTimes(1)
      expect(mockConsoleWarn).toHaveBeenCalledWith('Race already in progress')
    })
  })
})
