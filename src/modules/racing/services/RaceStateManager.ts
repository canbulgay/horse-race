import { ref, reactive } from 'vue'
import type { IHorse } from '@horses/types'

export interface RaceResult {
  winner: IHorse
  positions: { horse: IHorse; position: number; time: number; distance: number }[]
  raceTime: number
  distance: number
}

export interface HorseRaceData {
  horse: IHorse
  speed: number
  distanceCovered: number
  visualPosition: number
  finished: boolean
  finishTime: number
}

export class RaceStateManager {
  public readonly isRacing = ref(false)
  public readonly isPaused = ref(false)
  public readonly raceResult = ref<RaceResult | null>(null)
  public readonly horsePositions = reactive<Record<number, number>>({})

  private currentRaceData: HorseRaceData[] = []
  private raceStartTime: number = 0
  private totalPausedTime: number = 0
  private pauseStartTime: number = 0

  initializeRace(horses: IHorse[], horseSpeeds: number[]): void {
    this.isRacing.value = true
    this.isPaused.value = false
    this.raceResult.value = null
    this.totalPausedTime = 0
    this.pauseStartTime = 0
    this.raceStartTime = Date.now()

    horses.forEach((horse) => {
      this.horsePositions[horse.id] = 0
    })
    this.currentRaceData = horses.map((horse, index) => ({
      horse,
      speed: horseSpeeds[index],
      distanceCovered: 0,
      visualPosition: 0,
      finished: false,
      finishTime: 0,
    }))
  }

  updateRaceProgress(elapsedTime: number): HorseRaceData[] {
    this.currentRaceData.forEach((horseData) => {
      if (!horseData.finished) {
        horseData.distanceCovered = horseData.speed * elapsedTime
      }
    })

    return this.currentRaceData
  }

  finishHorse(horseIndex: number, finishTime: number): void {
    if (horseIndex >= 0 && horseIndex < this.currentRaceData.length) {
      this.currentRaceData[horseIndex].finished = true
      this.currentRaceData[horseIndex].finishTime = finishTime
    }
  }

  updateHorseVisualPosition(horseId: number, position: number): void {
    this.horsePositions[horseId] = position

    const horseData = this.currentRaceData.find((data) => data.horse.id === horseId)
    if (horseData) {
      horseData.visualPosition = position
    }
  }

  areAllHorsesFinished(): boolean {
    return this.currentRaceData.every((data) => data.finished)
  }

  getFinishedHorses(): HorseRaceData[] {
    return this.currentRaceData
      .filter((data) => data.finished)
      .sort((a, b) => a.finishTime - b.finishTime)
  }

  finalizeRace(raceDistance: number): RaceResult {
    const finishedHorses = this.getFinishedHorses()
    const raceTime = Date.now() - this.raceStartTime - this.totalPausedTime

    const result: RaceResult = {
      winner: finishedHorses[0].horse,
      positions: finishedHorses.map((horseData, index) => ({
        horse: horseData.horse,
        position: index + 1,
        time: horseData.finishTime,
        distance: horseData.distanceCovered,
      })),
      raceTime,
      distance: raceDistance,
    }

    this.raceResult.value = result
    this.isRacing.value = false
    this.isPaused.value = false

    return result
  }

  pauseRace(): void {
    if (this.isRacing.value && !this.isPaused.value) {
      this.isPaused.value = true
      this.pauseStartTime = Date.now()
    }
  }

  resumeRace(): void {
    if (this.isRacing.value && this.isPaused.value) {
      const pauseDuration = Date.now() - this.pauseStartTime
      this.totalPausedTime += pauseDuration
      this.isPaused.value = false
      this.pauseStartTime = 0
    }
  }

  updateHorsePositionsFromExternal(positions: Record<number, number>): void {
    Object.assign(this.horsePositions, positions)
  }

  resetRace(): void {
    this.isRacing.value = false
    this.isPaused.value = false
    this.raceResult.value = null
    this.raceStartTime = 0
    this.currentRaceData = []
    this.totalPausedTime = 0
    this.pauseStartTime = 0

    Object.keys(this.horsePositions).forEach((horseId) => {
      this.horsePositions[parseInt(horseId)] = 0
    })
  }

  getCurrentElapsedTime(): number {
    return Date.now() - this.raceStartTime - this.totalPausedTime
  }

  getCurrentRaceData(): readonly HorseRaceData[] {
    return this.currentRaceData
  }
}
