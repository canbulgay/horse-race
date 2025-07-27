import { HorseFactory } from '../factories/HorseFactory'
import type { IHorse, IHorseService } from '../types'

class HorseService implements IHorseService {
  private factory = new HorseFactory()

  /**
   * Generate a batch of unique horses.
   *
   * @returns An array of Horse, each with unique name + color. Defaults to 20 horses.
   */
  generate(): IHorse[] {
    return this.factory.create()
  }
}

export default new HorseService()
