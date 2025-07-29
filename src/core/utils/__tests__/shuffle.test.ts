import { describe, it, expect, vi } from 'vitest'
import { shuffle } from '../shuffle'

describe('shuffle', () => {
  it('should return a new array without modifying the original', () => {
    const original = [1, 2, 3, 4, 5]
    const originalCopy = [...original]
    const shuffled = shuffle(original)

    expect(original).toEqual(originalCopy)
    expect(shuffled).not.toBe(original)
  })

  it('should return an array with the same length', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)

    expect(result).toHaveLength(input.length)
  })

  it('should contain all the same elements', () => {
    const input = [1, 2, 3, 4, 5]
    const result = shuffle(input)

    expect(result.sort()).toEqual(input.sort())
  })

  it('should handle empty array', () => {
    const input: number[] = []
    const result = shuffle(input)

    expect(result).toEqual([])
    expect(result).not.toBe(input)
  })

  it('should handle single element array', () => {
    const input = [42]
    const result = shuffle(input)

    expect(result).toEqual([42])
    expect(result).not.toBe(input)
  })

  it('should handle arrays with duplicate elements', () => {
    const input = [1, 1, 2, 2, 3]
    const result = shuffle(input)

    expect(result).toHaveLength(5)
    expect(result.sort()).toEqual([1, 1, 2, 2, 3])
  })

  it('should work with different data types', () => {
    const strings = ['a', 'b', 'c']
    const stringResult = shuffle(strings)
    expect(stringResult.sort()).toEqual(['a', 'b', 'c'])

    const objects = [{ id: 1 }, { id: 2 }]
    const objectResult = shuffle(objects)
    expect(objectResult).toHaveLength(2)
    expect(objectResult).toContainEqual({ id: 1 })
    expect(objectResult).toContainEqual({ id: 2 })
  })

  it('should produce different results on multiple calls (probabilistic)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const results = Array.from({ length: 10 }, () => shuffle(input))
    
    // Check that not all results are identical (very unlikely with proper shuffling)
    const allIdentical = results.every(result => 
      result.every((val, idx) => val === results[0][idx])
    )
    expect(allIdentical).toBe(false)
  })

  it('should handle array with undefined and null values', () => {
    const input = [1, null, undefined, 2]
    const result = shuffle(input)

    expect(result).toHaveLength(4)
    expect(result).toContain(1)
    expect(result).toContain(2)
    expect(result).toContain(null)
    expect(result).toContain(undefined)
  })
})