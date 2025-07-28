import { defineStore } from 'pinia'
import HorseService from '../services/HorseService'
import type { IHorse, IHorseStore } from '../types'

type HorseState = Pick<IHorseStore, 'list' | 'loading' | 'error'>
type HorseActions = Pick<IHorseStore, 'generate' | 'load' | 'clear' | 'setLoading' | 'setError'>
type HorseGetters = Record<string, never>

export const STORAGE_KEY = 'horses'

export const useHorseStore = defineStore<
  typeof STORAGE_KEY,
  HorseState,
  HorseGetters,
  HorseActions
>(STORAGE_KEY, {
  state: (): HorseState => ({
    list: [] as IHorse[],
    loading: false as boolean,
    error: null as string | null,
  }),

  actions: {
    setLoading(loading: boolean) {
      this.loading = loading
    },
    setError(error: string | null) {
      this.error = error
    },

    /**
     * Generate horses, persist to storage, and update state.
     */
    async generate() {
      this.setLoading(true)
      this.setError(null)

      try {
        const horses = HorseService.generate()
        this.list = horses
        HorseService.save(horses)
      } catch (error) {
        console.error('Error generating horses:', error)
        this.setError('Failed to generate horses')
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Load persisted horses into state.
     */
    async load() {
      this.setLoading(true)
      this.setError(null)

      try {
        this.list = HorseService.getAll()
      } catch (error) {
        console.error('Error loading horses:', error)
        this.setError('Failed to load horses')
      } finally {
        this.setLoading(false)
      }
    },

    /**
     * Clear both state and persisted data.
     */
    async clear() {
      this.setLoading(true)
      this.setError(null)

      try {
        this.list = []
        HorseService.clear()
      } catch (error) {
        console.error('Error clearing horses:', error)
        this.setError('Failed to clear horses')
      } finally {
        this.setLoading(false)
      }
    },
  },
})
