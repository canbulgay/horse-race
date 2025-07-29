import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { getItem, setItem, removeItem, clear } from '../storage'

describe('storage utilities', () => {
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
    console.error = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getItem', () => {
    it('should return parsed value when key exists', () => {
      const testData = { name: 'test', value: 123 }
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(testData))

      const result = getItem('testKey', {})

      expect(result).toEqual(testData)
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey')
    })

    it('should return default value when key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      const defaultValue = { default: true }

      const result = getItem('nonExistentKey', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('should return default value when localStorage is not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      })
      const defaultValue = { default: true }

      const result = getItem('testKey', defaultValue)

      expect(result).toEqual(defaultValue)
    })

    it('should return default value when window is undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window
      const defaultValue = { default: true }

      const result = getItem('testKey', defaultValue)

      expect(result).toEqual(defaultValue)
      global.window = originalWindow
    })

    it('should handle JSON parse errors gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-json')
      const defaultValue = { default: true }

      const result = getItem('testKey', defaultValue)

      expect(result).toEqual(defaultValue)
      expect(console.error).toHaveBeenCalledWith(
        'Error reading localStorage key "testKey":',
        expect.any(Error),
      )
    })

    it('should return empty object when defaultValue is null and key does not exist', () => {
      mockLocalStorage.getItem.mockReturnValue(null)

      const result = getItem('testKey', null)

      expect(result).toEqual({})
    })

    it('should handle different data types', () => {
      // String
      mockLocalStorage.getItem.mockReturnValue('"hello"')
      expect(getItem('stringKey', '')).toBe('hello')

      // Number
      mockLocalStorage.getItem.mockReturnValue('42')
      expect(getItem('numberKey', 0)).toBe(42)

      // Boolean
      mockLocalStorage.getItem.mockReturnValue('true')
      expect(getItem('boolKey', false)).toBe(true)

      // Array
      mockLocalStorage.getItem.mockReturnValue('[1,2,3]')
      expect(getItem('arrayKey', [])).toEqual([1, 2, 3])
    })
  })

  describe('setItem', () => {
    it('should store value as JSON string', () => {
      const testData = { name: 'test', value: 123 }

      setItem('testKey', testData)

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testData))
    })

    it('should handle localStorage not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      })

      setItem('testKey', { test: true })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
    })

    it('should handle window undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      setItem('testKey', { test: true })

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled()
      global.window = originalWindow
    })

    it('should handle setItem errors gracefully', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded')
      })

      setItem('testKey', { test: true })

      expect(console.error).toHaveBeenCalledWith(
        'Error writing localStorage key "testKey":',
        expect.any(Error),
      )
    })

    it('should handle different data types', () => {
      setItem('string', 'hello')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('string', '"hello"')

      setItem('number', 42)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('number', '42')

      setItem('boolean', true)
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('boolean', 'true')

      setItem('array', [1, 2, 3])
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('array', '[1,2,3]')
    })
  })

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      removeItem('testKey')

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey')
    })

    it('should handle localStorage not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      })

      removeItem('testKey')

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
    })

    it('should handle window undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      removeItem('testKey')

      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
      global.window = originalWindow
    })

    it('should handle removeItem errors gracefully', () => {
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed')
      })

      removeItem('testKey')

      expect(console.error).toHaveBeenCalledWith(
        'Error removing localStorage key "testKey":',
        expect.any(Error),
      )
    })
  })

  describe('clear', () => {
    it('should clear all localStorage', () => {
      clear()

      expect(mockLocalStorage.clear).toHaveBeenCalled()
    })

    it('should handle localStorage not available', () => {
      Object.defineProperty(window, 'localStorage', {
        value: undefined,
        writable: true,
      })

      clear()

      expect(mockLocalStorage.clear).not.toHaveBeenCalled()
    })

    it('should handle window undefined (SSR)', () => {
      const originalWindow = global.window
      // @ts-ignore
      delete global.window

      clear()

      expect(mockLocalStorage.clear).not.toHaveBeenCalled()
      global.window = originalWindow
    })

    it('should handle clear errors gracefully', () => {
      mockLocalStorage.clear.mockImplementation(() => {
        throw new Error('Clear failed')
      })

      clear()

      expect(console.error).toHaveBeenCalledWith('Error clearing localStorage:', expect.any(Error))
    })
  })
})
