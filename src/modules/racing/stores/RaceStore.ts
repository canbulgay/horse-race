import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import RaceService from '../services/RaceService'
import type { IRace } from '../types'

export const STORAGE_KEY = 'races'

export const useRaceStore = defineStore(STORAGE_KEY, () => {
  const list = ref<IRace[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const setLoading = (value: boolean): void => {
    loading.value = value
  }

  const setError = (value: string | null): void => {
    error.value = value
  }

  const generate = (): void => {
    setLoading(true)
    try {
      const races = RaceService.generate()
      list.value = races
      RaceService.save(races)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while generating races')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load persisted races into state.
   * @returns {void}
   */
  const load = (): void => {
    setLoading(true)
    setError(null)

    try {
      list.value = RaceService.getAll()
    } catch (err) {
      console.error('Error loading races:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while loading races')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Clear the race list.
   */
  const clear = (): void => {
    list.value = []
    RaceService.clear()
  }

  const updateRaceStatus = (round: number, status: 'pending' | 'finished'): void => {
    const raceIndex = list.value.findIndex((race) => race.round === round)
    if (raceIndex !== -1) {
      list.value[raceIndex].status = status
      RaceService.save(list.value)
    }
  }

  const nextRound = computed(() => {
    return list.value.find((race) => race.status === 'pending')?.round || 0
  })

  return {
    list,
    loading,
    error,
    nextRound,
    generate,
    clear,
    load,
    updateRaceStatus,
  }
})
