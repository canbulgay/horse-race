import { defineStore } from 'pinia'
import HorseService from '../services/HorseService'
import HorseRepository from '../repositories/HorseRepository'
import type { IHorse } from '../types'

export const STORAGE_KEY = 'horses'

export const useHorseStore = defineStore(STORAGE_KEY, {
  state: () => ({
    list: [] as IHorse[],
    loading: false,
    error: null as string | null,
  }),

  getters: {
    getHorseById: (state) => (id: number) => {
      return state.list.find((horse) => horse.id === id)
    },
    getHorses: (state) => {
      return state.list
    },

    horseCount: (state) => state.list.length,
    hasError: (state) => state.error !== null,
    errorMessage: (state) => state.error,
  },

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
        console.log('Generated horses:', horses)
        this.list = horses
        HorseRepository.save(horses)
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
        this.list = HorseRepository.getAll()
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
        HorseRepository.clear()
      } catch (error) {
        console.error('Error clearing horses:', error)
        this.setError('Failed to clear horses')
      } finally {
        this.setLoading(false)
      }
    },
  },
})
