import type { IAnimationService } from '../types'

export class AnimationService implements IAnimationService {
  private horsePositions: Record<number, number> = {}

  getTrackWidth(): number {
    const trackElement = document.querySelector('.track')
    if (trackElement) {
      const rect = trackElement.getBoundingClientRect()
      // return rect.width - 40 //TODO: Open for horses stop the finish line
      return rect.width
    }
    return 400
  }

  updateHorsePosition(horseId: number, position: number): void {
    this.horsePositions[horseId] = position
  }

  captureCurrentPositions(): Record<number, number> {
    const positions: Record<number, number> = {}
    const horseElements = document.querySelectorAll('.horse[data-horse-id]')

    horseElements.forEach((element) => {
      const horseId = parseInt(element.getAttribute('data-horse-id') || '0')
      if (horseId) {
        const computedStyle = window.getComputedStyle(element)
        const matrix = computedStyle.transform
        if (matrix && matrix !== 'none') {
          const values = matrix.split('(')[1].split(')')[0].split(',')
          const translateX = parseFloat(values[4]) || 0
          positions[horseId] = translateX
        }
      }
    })

    return positions
  }

  startAnimation(callback: () => void): number {
    return requestAnimationFrame(callback)
  }

  cancelAnimation(animationId: number | null): void {
    if (animationId) {
      cancelAnimationFrame(animationId)
    }
  }
}
