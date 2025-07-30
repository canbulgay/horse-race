import type { IRace } from '../types'
import { RaceStateManager, type RaceResult } from '../services/RaceStateManager'
import { AnimationService } from '../services/AnimationService'
import { calculateRaceDuration, calculateHorseSpeed, calculateVisualPosition } from '../utils/race'

let globalStateManager: RaceStateManager | null = null
let globalAnimationController: AnimationService | null = null
let globalAnimationId: number | null = null

// Test helper function to reset global state
export function resetGlobalState(): void {
  globalStateManager = null
  globalAnimationController = null
  globalAnimationId = null
}

export function useRaceGame(animationController?: AnimationService) {
  if (!globalStateManager) {
    globalStateManager = new RaceStateManager()
  }
  if (!globalAnimationController) {
    globalAnimationController = animationController || new AnimationService()
  }

  const stateManager = globalStateManager
  const controller = globalAnimationController

  const startRace = (race: IRace): Promise<RaceResult> => {
    return new Promise((resolve) => {
      if (stateManager.isRacing.value) {
        console.warn('Race already in progress')
        return
      }

      const raceDistance = race.distance || 1200
      const raceDuration = calculateRaceDuration(raceDistance)

      const horseSpeeds = race.horses.map((horse) =>
        calculateHorseSpeed(horse, raceDistance, raceDuration),
      )

      stateManager.initializeRace(race.horses, horseSpeeds)

      const trackWidth = controller.getTrackWidth()

      console.log(`Starting ${raceDistance}m race (estimated ${(raceDuration / 1000).toFixed(1)}s)`)

      const animate = () => {
        if (stateManager.isPaused.value) {
          globalAnimationId = controller.startAnimation(animate)
          return
        }

        const elapsedTime = stateManager.getCurrentElapsedTime()
        const raceData = stateManager.updateRaceProgress(elapsedTime)

        raceData.forEach((horseData, index) => {
          if (!horseData.finished) {
            const visualPosition = calculateVisualPosition(
              horseData.distanceCovered,
              raceDistance,
              trackWidth,
            )

            stateManager.updateHorseVisualPosition(horseData.horse.id, visualPosition)

            if (horseData.distanceCovered >= raceDistance && !horseData.finished) {
              stateManager.finishHorse(index, elapsedTime)
              console.log(
                `${horseData.horse.name} finished! Time: ${(elapsedTime / 1000).toFixed(2)}s`,
              )
            }
          }
        })

        if (!stateManager.areAllHorsesFinished()) {
          globalAnimationId = controller.startAnimation(animate)
        } else {
          const result = stateManager.finalizeRace(raceDistance)
          console.log(result)
          globalAnimationId = null
          resolve(result)
        }
      }

      globalAnimationId = controller.startAnimation(animate)
    })
  }

  const pauseRace = (): void => {
    if (stateManager.isRacing.value && !stateManager.isPaused.value) {
      const currentPositions = controller.captureCurrentPositions()
      stateManager.updateHorsePositionsFromExternal(currentPositions)

      stateManager.pauseRace()

      console.log('Race paused')
    }
  }

  const resumeRace = (): void => {
    if (stateManager.isRacing.value && stateManager.isPaused.value) {
      stateManager.resumeRace()
      console.log('Race resumed')
    }
  }

  const toggleRace = (race: IRace): Promise<RaceResult> | void => {
    if (!stateManager.isRacing.value) {
      return startRace(race)
    } else if (stateManager.isPaused.value) {
      resumeRace()
    } else {
      pauseRace()
    }
  }

  const resetRace = (): void => {
    if (globalAnimationId) {
      controller.cancelAnimation(globalAnimationId)
      globalAnimationId = null
    }
    stateManager.resetRace()
    console.log('Race reset')
  }

  return {
    isRacing: stateManager.isRacing,
    isPaused: stateManager.isPaused,
    raceResult: stateManager.raceResult,
    horsePositions: stateManager.horsePositions,

    startRace,
    resetRace,
    pauseRace,
    resumeRace,
    toggleRace,
  }
}
