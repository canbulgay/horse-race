import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getColorName } from '../colorNamer'

// Mock the color-namer module
vi.mock('color-namer', () => ({
  default: vi.fn(),
}))

describe('getColorName', () => {
  let mockNamer: any

  beforeEach(async () => {
    const colorNamerModule = await import('color-namer')
    mockNamer = vi.mocked(colorNamerModule.default)
    vi.clearAllMocks()
  })

  it('should return the closest HTML color name for a valid hex color', () => {
    const mockResult = {
      html: [{ name: 'red' }],
    }
    mockNamer.mockReturnValue(mockResult)

    const result = getColorName('#FF0000')

    expect(mockNamer).toHaveBeenCalledWith('#FF0000')
    expect(result).toBe('red')
  })

  it('should handle hex colors without hash prefix', () => {
    const mockResult = {
      html: [{ name: 'blue' }],
    }
    mockNamer.mockReturnValue(mockResult)

    const result = getColorName('0000FF')

    expect(mockNamer).toHaveBeenCalledWith('0000FF')
    expect(result).toBe('blue')
  })

  it('should return "Unknown Color" when no name is found', () => {
    const mockResult = {
      html: [{ name: null }],
    }
    mockNamer.mockReturnValue(mockResult)

    const result = getColorName('#123456')

    expect(result).toBe('Unknown Color')
  })

  it('should return "Unknown Color" when name is undefined', () => {
    const mockResult = {
      html: [{ name: undefined }],
    }
    mockNamer.mockReturnValue(mockResult)

    const result = getColorName('#123456')

    expect(result).toBe('Unknown Color')
  })

  it('should return "Unknown Color" when html array is empty', () => {
    const mockResult = {
      html: [],
    }
    mockNamer.mockReturnValue(mockResult)

    const result = getColorName('#123456')

    expect(result).toBe('Unknown Color')
  })

  it('should handle various hex color formats', () => {
    const testCases = [
      { input: '#FFFFFF', expected: 'white' },
      { input: '#000000', expected: 'black' },
      { input: 'FFFF00', expected: 'yellow' },
      { input: '#ff0000', expected: 'red' },
    ]

    testCases.forEach(({ input, expected }) => {
      const mockResult = {
        html: [{ name: expected }],
      }
      mockNamer.mockReturnValue(mockResult)

      const result = getColorName(input)
      expect(result).toBe(expected)
      expect(mockNamer).toHaveBeenCalledWith(input)
    })
  })

  it('should handle invalid hex colors gracefully', () => {
    // Even if namer throws or returns unexpected data, our function should handle it
    const mockResult = {
      html: [{ name: 'gray' }],
    }
    mockNamer.mockReturnValue(mockResult)

    const result = getColorName('invalid-color')
    expect(result).toBe('gray')
  })
})
