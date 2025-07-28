import { ref, reactive } from 'vue'
import type { IHorse } from '@horses/types'
import type { IRace } from '../types'

interface RaceResult {
  winner: IHorse
  positions: { horse: IHorse; position: number; time: number }[]
  raceTime: number
}

export function useRaceGame() {
  const isRacing = ref(false)
  const isPaused = ref(false)
  const raceResult = ref<RaceResult | null>(null)
  const horsePositions = reactive<Record<number, number>>({})

  const RACE_DURATION = 5000 // 5 seconds race duration
  let trackWidth = 400 // Will be dynamically set from DOM
  let animationId: number | null = null
  let pauseStartTime = 0
  let totalPausedTime = 0

  const calculateHorseSpeed = (horse: IHorse): number => {
    // Speed calculation to ensure ALL horses finish the race
    // Base speed guarantees even the slowest horse finishes
    const baseSpeed = trackWidth / (RACE_DURATION * 0.9) // Allow finishing in 90% of race duration
    const conditionMultiplier = (horse.condition / 100) * 0.3 + 0.7 // Scale from 0.7 to 1.0 (narrower range)
    const randomFactor = 0.8 + Math.random() * 0.4 // 0.8 to 1.2 multiplier (smaller variance)
    
    return baseSpeed * conditionMultiplier * randomFactor
  }

  const resetRace = () => {
    isRacing.value = false
    isPaused.value = false
    raceResult.value = null
    if (animationId) {
      cancelAnimationFrame(animationId)
      animationId = null
    }
    totalPausedTime = 0
    pauseStartTime = 0
    Object.keys(horsePositions).forEach(horseId => {
      horsePositions[parseInt(horseId)] = 0
    })
  }

  const pauseRace = () => {
    if (isRacing.value && !isPaused.value) {
      // First, capture the current actual positions from DOM
      const horseElements = document.querySelectorAll('.horse[data-horse-id]')
      horseElements.forEach((element) => {
        const horseId = parseInt(element.getAttribute('data-horse-id') || '0')
        if (horseId) {
          const computedStyle = window.getComputedStyle(element)
          const matrix = computedStyle.transform
          if (matrix && matrix !== 'none') {
            const values = matrix.split('(')[1].split(')')[0].split(',')
            const translateX = parseFloat(values[4]) || 0
            horsePositions[horseId] = translateX
            console.log(`Horse ${horseId} paused at position:`, translateX)
          }
        }
      })
      
      isPaused.value = true
      pauseStartTime = Date.now()
      console.log('Race paused at:', pauseStartTime)
    }
  }

  const resumeRace = () => {
    if (isRacing.value && isPaused.value) {
      const pauseDuration = Date.now() - pauseStartTime
      totalPausedTime += pauseDuration
      isPaused.value = false
      pauseStartTime = 0
      console.log('Race resumed, pause duration:', pauseDuration, 'total paused:', totalPausedTime)
    }
  }

  const toggleRace = (race: IRace): Promise<RaceResult> | void => {
    if (!isRacing.value) {
      // Start new race
      return startRace(race)
    } else if (isPaused.value) {
      // Resume race
      resumeRace()
    } else {
      // Pause race
      pauseRace()
    }
  }

  const startRace = (race: IRace): Promise<RaceResult> => {
    return new Promise((resolve) => {
      if (isRacing.value) {
        console.warn('Race already in progress')
        return
      }

      // Reset pause states
      isPaused.value = false
      totalPausedTime = 0
      pauseStartTime = 0

      // Get actual track width from DOM
      const trackElement = document.querySelector('.track')
      if (trackElement) {
        const rect = trackElement.getBoundingClientRect()
        trackWidth = rect.width - 40 // Subtract horse width and padding
      }

      isRacing.value = true
      raceResult.value = null

      // Initialize horse positions
      race.horses.forEach(horse => {
        horsePositions[horse.id] = 0
      })

      // Calculate speeds for each horse
      const horseSpeeds = race.horses.map(horse => ({
        horse,
        speed: calculateHorseSpeed(horse),
        position: 0,
        finished: false,
        finishTime: 0
      }))

      const raceStartTime = Date.now()
      const finishedHorses: typeof horseSpeeds = []

      // Animation loop
      const animate = () => {
        if (isPaused.value) {
          // If paused, don't continue animation but keep the promise alive
          animationId = requestAnimationFrame(animate)
          return
        }

        const currentTime = Date.now()
        const elapsed = currentTime - raceStartTime - totalPausedTime

        let raceFinished = false

        horseSpeeds.forEach(horseData => {
          if (!horseData.finished) {
            // Update position based on speed and time
            const newPosition = Math.min(
              horseData.speed * elapsed,
              trackWidth // Use dynamic track width
            )
            
            horsePositions[horseData.horse.id] = newPosition
            horseData.position = newPosition

            // Check if horse finished
            if (newPosition >= trackWidth && !horseData.finished) {
              horseData.finished = true
              horseData.finishTime = elapsed
              finishedHorses.push({ ...horseData })
            }
          }
        })

        // Continue animation until ALL horses finish
        if (finishedHorses.length < race.horses.length) {
          animationId = requestAnimationFrame(animate)
        } else {
          // All horses finished - race completed
          raceFinished = true
        }

        if (raceFinished) {
          // Sort by finish time (fastest first)
          finishedHorses.sort((a, b) => a.finishTime - b.finishTime)

          // Create race result
          const result: RaceResult = {
            winner: finishedHorses[0].horse,
            positions: finishedHorses.map((horseData, index) => ({
              horse: horseData.horse,
              position: index + 1,
              time: horseData.finishTime
            })),
            raceTime: elapsed
          }

          // Console log the race results
          console.log('🏁 RACE FINISHED! 🏁')
          console.log('Race Results:')
          result.positions.forEach((position, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏃'
            console.log(`${medal} ${position.position}. ${position.horse.name} (${position.horse.colorName}) - ${(position.time / 1000).toFixed(2)}s`)
          })
          console.log(`Total race time: ${(result.raceTime / 1000).toFixed(2)} seconds`)
          console.log('-------------------')

          raceResult.value = result
          isRacing.value = false
          isPaused.value = false
          animationId = null
          resolve(result)
        }
      }

      // Start animation
      animationId = requestAnimationFrame(animate)
    })
  }

  return {
    isRacing,
    isPaused,
    raceResult,
    horsePositions,
    startRace,
    resetRace,
    pauseRace,
    resumeRace,
    toggleRace
  }
}