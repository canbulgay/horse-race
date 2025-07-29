import { GAME_CONFIG } from '@core/contants'
import type { IHorse } from '@horses/types'

const BASE_RACE_TIME = GAME_CONFIG.ANIMATION_DURATION

/**
 * Calculate race duration based on distance
 * @params {number} distance - Distance
 * @return {number} Estimated race duration in milliseconds
 */
export const calculateRaceDuration = (distance: number): number => {
  const baseDistance = GAME_CONFIG.TRACK_DISTANCES[0]
  const scaleFactor = distance / baseDistance

  return BASE_RACE_TIME * Math.sqrt(scaleFactor) * 1.2
}

/**
 * Calculate horse speed based on condition
 * @param {IHorse} horse - Horse object
 * @param {number} distance
 * @param {number} raceDuration - Duration of the race
 * @return {number} Calculated speed for the horse
 */
export const calculateHorseSpeed = (
  horse: IHorse,
  distance: number,
  raceDuration: number,
): number => {
  const baseSpeedEffect = distance / raceDuration
  const conditionEffect = 0.7 + (horse.condition / 100) * 0.3
  const randomEffect = 0.8 + Math.random() * 0.4

  return baseSpeedEffect * conditionEffect * randomEffect
}

/**
 * Calculate visual position based on actual distance
 * @param {number} actualDistance - Actual distance covered by horse
 * @param {number} totalDistance
 * @return {number} Visual position on the track
 */
export const calculateVisualPosition = (
  actualDistance: number,
  totalDistance: number,
  trackWidth: number,
): number => {
  const progress = Math.min(actualDistance / totalDistance, 1)
  return progress * trackWidth
}

/**
 * Calculate actual distance covered by horse at given time
 * @param {number} speed - Speed of the horse
 * @param {number} elapsedTime - Elapsed time in milliseconds
 * @return {number} Distance covered in meters
 */
export const calculateDistanceCovered = (speed: number, elapsedTime: number): number => {
  return speed * elapsedTime
}
