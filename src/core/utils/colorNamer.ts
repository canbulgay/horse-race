import namer from 'color-namer'

/**
 * Given any hex string (“#RRGGBB” or “RRGGBB”), returns the closest CSS color name.
 * @param {string} hex - The hex color string
 * @returns {string} The name of the color
 */
export function getColorName(hex: string): string {
  const palettes = namer(hex)
  return palettes.html?.[0]?.name || 'Unknown Color'
}
