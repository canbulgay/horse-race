/**
 * Read a value from localStorage. Returns defaultValue if the key doesn’t exist or on any error.
 */
export function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.localStorage) {
    return defaultValue
  }
  try {
    const raw = window.localStorage.getItem(key)
    return raw !== null ? (JSON.parse(raw) as T) : defaultValue || ({} as T)
  } catch (err) {
    console.error(`Error reading localStorage key "${key}":`, err)
    return defaultValue || ({} as T)
  }
}

/**
 * Write a value to localStorage as JSON.
 * @param key - The key to set
 * @param value - The value to store
 * @returns {void}
 */
export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    console.error(`Error writing localStorage key "${key}":`, err)
  }
}

/**
 * Remove a key from localStorage.
 * @param key - The key to remove
 * @returns {void}
 */
export function removeItem(key: string): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    window.localStorage.removeItem(key)
  } catch (err) {
    console.error(`Error removing localStorage key "${key}":`, err)
  }
}

/**
 * Clear all localStorage. You could extend this to clear only
 * keys with a certain prefix if needed.
 */
export function clear(): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return
  }
  try {
    window.localStorage.clear()
  } catch (err) {
    console.error('Error clearing localStorage:', err)
  }
}
