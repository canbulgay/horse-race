export { useRaceStore } from './stores/RaceStore'
export { default as RaceService } from './services/RaceService'
export { default as RaceRepository } from './repositories/RaceRepository'

// New architecture exports
export { RaceStateManager } from './services/RaceStateManager'
export { useRaceGame } from './composables/useRaceGame'

export type { IRace, IRaceRepository, IRaceService, IRaceStore } from './types'
export { AnimationService } from './services/AnimationService'
export type { RaceResult, HorseRaceData } from './services/RaceStateManager'

export { default as RaceSchedule } from './components/RaceSchedule.vue'
export { default as RaceTrack } from './components/RaceTrack.vue'
export { default as GenerateProgramButton } from './components/GenerateProgramButton.vue'
export * from './utils'
