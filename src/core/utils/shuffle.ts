/**
 * Returns a new shuffled array without modifying the original.
 *
 * @template T
 * @param {T[]} arr — the array to shuffle
 * @returns {T[]} a new array with elements in random order
 */
export const shuffle = <T>(arr: T[]): T[] => {
  const array = [...arr]

  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }

  return array
}
