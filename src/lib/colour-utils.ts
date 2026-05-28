// Returns relative luminance (0 = black, 1 = white)
export function getLuminance(hex: string): number {
  try {
    const clean = hex.replace('#', '')
    const r = parseInt(clean.slice(0, 2), 16) / 255
    const g = parseInt(clean.slice(2, 4), 16) / 255
    const b = parseInt(clean.slice(4, 6), 16) / 255
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  } catch {
    return 0.5
  }
}

// Returns readable text colour for a given background
export function getContrastText(hex: string): string {
  return getLuminance(hex) > 0.35 ? '#1a1a1a' : '#ffffff'
}

// Picks the palette colour in the mid-tone range
// (luminance 0.08–0.50) closest to target 0.22.
// Falls back to closest overall if none qualify.
// Never returns near-black or near-white.
export function getBestButtonColour(
  palette: { hex: string; name: string }[]
): string {
  if (!palette || palette.length === 0) return '#b8a99a'
  const TARGET = 0.22
  const MIN_LUM = 0.08
  const MAX_LUM = 0.50
  const qualifying = palette.filter(c => {
    const l = getLuminance(c.hex)
    return l >= MIN_LUM && l <= MAX_LUM
  })
  const pool = qualifying.length > 0 ? qualifying : palette
  return pool.reduce((best, current) =>
    Math.abs(getLuminance(current.hex) - TARGET) < Math.abs(getLuminance(best.hex) - TARGET)
      ? current : best
  ).hex
}

// Builds a sharp-edged CSS linear-gradient from palette
export function buildPaletteGradient(
  palette: { hex: string; name: string }[]
): string {
  if (!palette || palette.length === 0) return '#b8a99a'
  if (palette.length === 1) return palette[0].hex
  const step = 100 / palette.length
  const stops = palette.flatMap((color, i) => {
    const start = (i * step).toFixed(1)
    const end = ((i + 1) * step).toFixed(1)
    return [`${color.hex} ${start}%`, `${color.hex} ${end}%`]
  })
  return `linear-gradient(to right, ${stops.join(', ')})`
}
