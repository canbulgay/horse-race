import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import ResultService from '../services/ResultService'
import type { IResult } from '../types'

export const STORAGE_KEY = 'resultsHistory'

export const useResultsStore = defineStore(STORAGE_KEY, () => {
  const list = ref<IResult[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const setLoading = (value: boolean): void => {
    loading.value = value
  }

  const setError = (value: string | null): void => {
    error.value = value
  }

  /**
   * Load persisted results from local storage
   */
  const load = (): void => {
    setLoading(true)
    setError(null)

    try {
      const results = ResultService.getAll()
      list.value = results
    } catch (err) {
      console.error('Error loading results:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while loading results')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Save a finished race result to local storage
   */
  const saveResult = (raceResult: IResult): void => {
    try {
      list.value.push(raceResult)
      ResultService.save(raceResult)

      console.log(`Race result for round ${raceResult.round} saved successfully`)
    } catch (err) {
      console.error('Error saving race result:', err)
      setError(err instanceof Error ? err.message : 'Failed to save race result')
    }
  }

  /**
   * Clear all results
   */
  const clear = (): void => {
    list.value = []
    ResultService.clear()
  }

  const totalRaces = computed(() => list.value.length)

  const latestResult = computed(() => {
    return list.value.length > 0
      ? list.value.reduce((latest, current) => (current.round > latest.round ? current : latest))
      : null
  })

  return {
    // State
    list,
    loading,
    error,

    // Getters
    totalRaces,
    latestResult,

    // Actions
    load,
    saveResult,
    clear,
    setLoading,
    setError,
  }
})
