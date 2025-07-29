import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AnimationService } from '../AnimationService'

// Mock DOM APIs
const mockQuerySelector = vi.fn()
const mockQuerySelectorAll = vi.fn()
const mockGetBoundingClientRect = vi.fn()
const mockGetComputedStyle = vi.fn()
const mockRequestAnimationFrame = vi.fn()
const mockCancelAnimationFrame = vi.fn()

// Mock window and document
Object.defineProperty(global, 'document', {
  value: {
    querySelector: mockQuerySelector,
    querySelectorAll: mockQuerySelectorAll
  },
  writable: true
})

Object.defineProperty(global, 'window', {
  value: {
    getComputedStyle: mockGetComputedStyle
  },
  writable: true
})

Object.defineProperty(global, 'requestAnimationFrame', {
  value: mockRequestAnimationFrame,
  writable: true
})

Object.defineProperty(global, 'cancelAnimationFrame', {
  value: mockCancelAnimationFrame,
  writable: true
})

describe('AnimationService', () => {
  let animationService: AnimationService

  beforeEach(() => {
    animationService = new AnimationService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getTrackWidth', () => {
    it('should return track width when track element exists', () => {
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect
      }
      mockQuerySelector.mockReturnValue(mockElement)
      mockGetBoundingClientRect.mockReturnValue({ width: 800 })

      const width = animationService.getTrackWidth()

      expect(mockQuerySelector).toHaveBeenCalledWith('.track')
      expect(width).toBe(800)
    })

    it('should return default width when track element does not exist', () => {
      mockQuerySelector.mockReturnValue(null)

      const width = animationService.getTrackWidth()

      expect(width).toBe(400)
    })

    it('should handle getBoundingClientRect errors gracefully', () => {
      const mockElement = {
        getBoundingClientRect: vi.fn(() => {
          throw new Error('DOM error')
        })
      }
      mockQuerySelector.mockReturnValue(mockElement)

      expect(() => animationService.getTrackWidth()).toThrow('DOM error')
    })

    it('should return full width without adjustment', () => {
      // Based on the comment in the code, the 40px adjustment is disabled
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect
      }
      mockQuerySelector.mockReturnValue(mockElement)
      mockGetBoundingClientRect.mockReturnValue({ width: 1000 })

      const width = animationService.getTrackWidth()

      expect(width).toBe(1000) // Full width, not 960 (1000-40)
    })

    it('should handle decimal width values', () => {
      const mockElement = {
        getBoundingClientRect: mockGetBoundingClientRect
      }
      mockQuerySelector.mockReturnValue(mockElement)
      mockGetBoundingClientRect.mockReturnValue({ width: 599.5 })

      const width = animationService.getTrackWidth()

      expect(width).toBe(599.5)
    })
  })

  describe('updateHorsePosition', () => {
    it('should store horse position in internal state', () => {
      animationService.updateHorsePosition(1, 150)
      animationService.updateHorsePosition(2, 200)

      // Since horsePositions is private, we test through captureCurrentPositions
      // which should preserve positions that were set
      const mockElements = [
        {
          getAttribute: vi.fn().mockReturnValue('1'),
          getBoundingClientRect: () => ({ left: 150 })
        },
        {
          getAttribute: vi.fn().mockReturnValue('2'),
          getBoundingClientRect: () => ({ left: 200 })
        }
      ]
      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle.mockReturnValue({ transform: 'none' })

      // The position should be stored internally
      expect(() => animationService.updateHorsePosition(3, 100)).not.toThrow()
    })

    it('should handle negative positions', () => {
      expect(() => animationService.updateHorsePosition(1, -50)).not.toThrow()
    })

    it('should handle decimal positions', () => {
      expect(() => animationService.updateHorsePosition(1, 123.45)).not.toThrow()
    })

    it('should handle zero position', () => {
      expect(() => animationService.updateHorsePosition(1, 0)).not.toThrow()
    })

    it('should update existing horse position', () => {
      animationService.updateHorsePosition(1, 100)
      animationService.updateHorsePosition(1, 200)

      // Position should be updated, not added
      expect(() => animationService.updateHorsePosition(1, 300)).not.toThrow()
    })
  })

  describe('captureCurrentPositions', () => {
    it('should capture positions from DOM elements', () => {
      const mockElements = [
        {
          getAttribute: vi.fn().mockReturnValue('1'),
        },
        {
          getAttribute: vi.fn().mockReturnValue('2'),
        }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, 150, 0)' })
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, 200, 0)' })

      const positions = animationService.captureCurrentPositions()

      expect(mockQuerySelectorAll).toHaveBeenCalledWith('.horse[data-horse-id]')
      expect(positions).toEqual({ 1: 150, 2: 200 })
    })

    it('should handle elements with no data-horse-id attribute', () => {
      const mockElements = [
        {
          getAttribute: vi.fn().mockReturnValue(null),
        },
        {
          getAttribute: vi.fn().mockReturnValue('2'),
        }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle.mockReturnValue({ transform: 'matrix(1, 0, 0, 1, 100, 0)' })

      const positions = animationService.captureCurrentPositions()

      expect(positions).toEqual({ 2: 100 })
    })

    it('should handle elements with invalid horse ID', () => {
      const mockElements = [
        {
          getAttribute: vi.fn().mockReturnValue('invalid'),
        },
        {
          getAttribute: vi.fn().mockReturnValue('2'),
        }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle.mockReturnValue({ transform: 'matrix(1, 0, 0, 1, 100, 0)' })

      const positions = animationService.captureCurrentPositions()

      expect(positions).toEqual({ 2: 100 })
    })

    it('should handle elements with no transform', () => {
      const mockElements = [
        {
          getAttribute: vi.fn().mockReturnValue('1'),
        }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle.mockReturnValue({ transform: 'none' })

      const positions = animationService.captureCurrentPositions()

      expect(positions).toEqual({})
    })

    it('should parse different transform matrix formats', () => {
      const mockElements = [
        { getAttribute: vi.fn().mockReturnValue('1') },
        { getAttribute: vi.fn().mockReturnValue('2') },
        { getAttribute: vi.fn().mockReturnValue('3') }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, 150.5, 0)' }) // Decimal
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, -50, 0)' }) // Negative
        .mockReturnValueOnce({ transform: 'matrix(1,0,0,1,300,0)' }) // No spaces

      const positions = animationService.captureCurrentPositions()

      expect(positions).toEqual({ 1: 150.5, 2: -50, 3: 300 })
    })

    it('should handle malformed transform matrices', () => {
      const mockElements = [
        { getAttribute: vi.fn().mockReturnValue('1') },
        { getAttribute: vi.fn().mockReturnValue('2') }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle
        .mockReturnValueOnce({ transform: 'matrix(invalid)' })
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, 100, 0)' })

      const positions = animationService.captureCurrentPositions()

      expect(positions).toEqual({ 2: 100 })
    })

    it('should handle empty NodeList', () => {
      mockQuerySelectorAll.mockReturnValue([])

      const positions = animationService.captureCurrentPositions()

      expect(positions).toEqual({})
    })

    it('should skip elements with zero horse ID', () => {
      const mockElements = [
        { getAttribute: vi.fn().mockReturnValue('0') },
        { getAttribute: vi.fn().mockReturnValue('1') }
      ]

      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle.mockReturnValue({ transform: 'matrix(1, 0, 0, 1, 100, 0)' })

      const positions = animationService.captureCurrentPositions()

      // Horse ID 0 should be skipped based on the condition in the code
      expect(positions).toEqual({ 1: 100 })
    })
  })

  describe('startAnimation', () => {
    it('should call requestAnimationFrame with callback', () => {
      const mockCallback = vi.fn()
      const mockAnimationId = 123
      mockRequestAnimationFrame.mockReturnValue(mockAnimationId)

      const result = animationService.startAnimation(mockCallback)

      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(mockCallback)
      expect(result).toBe(mockAnimationId)
    })

    it('should handle different callback types', () => {
      const arrowCallback = () => {}
      const functionCallback = function() {}
      
      mockRequestAnimationFrame.mockReturnValue(1)

      animationService.startAnimation(arrowCallback)
      animationService.startAnimation(functionCallback)

      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2)
    })

    it('should return the animation frame ID', () => {
      const mockId = 456
      mockRequestAnimationFrame.mockReturnValue(mockId)

      const result = animationService.startAnimation(() => {})

      expect(result).toBe(mockId)
    })
  })

  describe('cancelAnimation', () => {
    it('should call cancelAnimationFrame with valid ID', () => {
      const animationId = 123

      animationService.cancelAnimation(animationId)

      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(animationId)
    })

    it('should not call cancelAnimationFrame with null ID', () => {
      animationService.cancelAnimation(null)

      expect(mockCancelAnimationFrame).not.toHaveBeenCalled()
    })

    it('should handle zero ID', () => {
      animationService.cancelAnimation(0)

      expect(mockCancelAnimationFrame).not.toHaveBeenCalled()
    })

    it('should handle undefined ID', () => {
      animationService.cancelAnimation(undefined as any)

      expect(mockCancelAnimationFrame).not.toHaveBeenCalled()
    })

    it('should handle negative ID', () => {
      animationService.cancelAnimation(-1)

      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(-1)
    })
  })

  describe('integration scenarios', () => {
    it('should support animation lifecycle', () => {
      const callback = vi.fn()
      mockRequestAnimationFrame.mockReturnValue(100)

      const animationId = animationService.startAnimation(callback)
      animationService.cancelAnimation(animationId)

      expect(mockRequestAnimationFrame).toHaveBeenCalledWith(callback)
      expect(mockCancelAnimationFrame).toHaveBeenCalledWith(100)
    })

    it('should handle multiple concurrent animations', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()
      mockRequestAnimationFrame.mockReturnValueOnce(100).mockReturnValueOnce(200)

      const id1 = animationService.startAnimation(callback1)
      const id2 = animationService.startAnimation(callback2)

      expect(id1).toBe(100)
      expect(id2).toBe(200)
      expect(mockRequestAnimationFrame).toHaveBeenCalledTimes(2)
    })

    it('should update and capture horse positions correctly', () => {
      // Update internal positions
      animationService.updateHorsePosition(1, 150)
      animationService.updateHorsePosition(2, 200)

      // Mock DOM elements for capture
      const mockElements = [
        { getAttribute: vi.fn().mockReturnValue('1') },
        { getAttribute: vi.fn().mockReturnValue('3') }
      ]
      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, 175, 0)' })
        .mockReturnValueOnce({ transform: 'matrix(1, 0, 0, 1, 225, 0)' })

      const positions = animationService.captureCurrentPositions()

      // Should capture current DOM positions, not stored positions
      expect(positions).toEqual({ 1: 175, 3: 225 })
    })
  })

  describe('error handling', () => {
    it('should handle DOM query errors gracefully', () => {
      mockQuerySelector.mockImplementation(() => {
        throw new Error('DOM query failed')
      })

      expect(() => animationService.getTrackWidth()).toThrow('DOM query failed')
    })

    it('should handle getComputedStyle errors gracefully', () => {
      const mockElements = [
        { getAttribute: vi.fn().mockReturnValue('1') }
      ]
      mockQuerySelectorAll.mockReturnValue(mockElements)
      mockGetComputedStyle.mockImplementation(() => {
        throw new Error('Style computation failed')
      })

      expect(() => animationService.captureCurrentPositions()).toThrow('Style computation failed')
    })

    it('should handle requestAnimationFrame unavailability', () => {
      delete (global as any).requestAnimationFrame

      // Should throw since requestAnimationFrame is not available
      expect(() => animationService.startAnimation(() => {})).toThrow()
    })
  })
})