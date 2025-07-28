import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import HorseService from '../services/HorseService'
import type { IHorse } from '../types'

export const STORAGE_KEY = 'horses'

export const useHorseStore = defineStore(STORAGE_KEY, () => {
  // State
  const list = ref<IHorse[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)
  const generationTimestamp = ref<number | null>(null)

  // Getters
  const horseCount = computed(() => list.value.length)
  const hasError = computed(() => error.value !== null)
  const errorMessage = computed(() => error.value)

  // Actions
  const setLoading = (value: boolean) => {
    loading.value = value
  }

  const setError = (value: string | null) => {
    error.value = value
  }

  /**
   * Generate horses, persist to storage, and update state.
   * @returns {Promise<void>}
   */
  const generate = async () => {
    setLoading(true)
    setError(null)

    try {
      const horses = HorseService.generate()
      list.value = horses
      HorseService.save(horses)
      generationTimestamp.value = Date.now()
    } catch (err) {
      console.error('Error generating horses:', err)
      setError('Failed to generate horses')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load persisted horses into state.
   * @returns {Promise<void>}
   */
  const load = async () => {
    setLoading(true)
    setError(null)

    try {
      list.value = HorseService.getAll()
    } catch (err) {
      console.error('Error loading horses:', err)
      setError('Failed to load horses')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Clear both state and persisted data.
   * @return {Promise<void>}
   */
  const clear = async () => {
    setLoading(true)
    setError(null)

    try {
      list.value = []
      HorseService.clear()
    } catch (err) {
      console.error('Error clearing horses:', err)
      setError('Failed to clear horses')
    } finally {
      setLoading(false)
    }
  }

  return {
    // State
    list,
    loading,
    error,
    generationTimestamp,

    // Getters
    horseCount,
    hasError,
    errorMessage,

    // Actions
    setLoading,
    setError,
    generate,
    load,
    clear,
  }
})
