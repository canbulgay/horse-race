import { faker } from '@faker-js/faker'

import { getColorName } from '@/core/utils'
import { GAME_CONFIG } from '@/core/contants'
import type { IHorse, IHorseFactory } from '../types'

export class HorseFactory implements IHorseFactory {
  /**
   * Create between `min` and `max` horses.
   * @param {number} count - Number of horses to create (default: 20)
   * @param {number[]} conditionRange - Range for horse condition (default: [1, 100])
   * @returns {Horse[]} Array of created horses
   */
  create(
    count = GAME_CONFIG.HORSES_COUNT,
    conditionRange = { min: GAME_CONFIG.MIN_CONDITION, max: GAME_CONFIG.MAX_CONDITION },
  ): IHorse[] {
    const names = faker.helpers.uniqueArray(faker.animal.horse, count)
    const colors = faker.helpers.uniqueArray(() => faker.color.rgb({ casing: 'upper' }), count)

    let nextId = 0
    return Array.from({ length: count }, () => {
      const colorHex = colors.pop() as string
      const colorName = getColorName(colorHex)

      const horse: IHorse = {
        id: nextId++,
        name: (names.pop() as string).split(' ').slice(0, 3).join(' '),
        colorName: colorName,
        colorHex: colorHex,
        condition: this.getRandomInt(conditionRange.min, conditionRange.max),
      }
      return horse
    })
  }

  private getRandomInt(a: number, b: number): number {
    return Math.floor(Math.random() * (b - a + 1)) + a
  }
}

export default HorseFactory
