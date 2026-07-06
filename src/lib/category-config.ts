// Category configuration for Curato
// Maps DB keys to display names + icons + emojis
// Wildcard fallback handles unknown
// categories automatically
//
// Icon: Lucide line icon — used in web UI
//   (Vendor Briefs, future tabs, dashboard cards)
// Emoji: text fallback — used in PDF export
//   (React-PDF can't render Lucide), clipboard
//   text, plain-text contexts

import {
  Flower2, Building2, Camera, Shirt,
  Sun, UtensilsCrossed,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

export type CategoryConfig = {
  key: string
  name: string
  emoji: string
  Icon: LucideIcon
}

// The 4 confirmed categories for MVP
// Add more here as they are confirmed
export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    key: 'flowers_d_cor',
    name: 'Flowers & Décor',
    emoji: '🌸',
    Icon: Flower2,
  },
  {
    key: 'venue_atmosphere',
    name: 'Venue & Spaces',
    emoji: '🏛️',
    Icon: Building2,
  },
  {
    key: 'photography_lighting',
    name: 'Photography',
    emoji: '📸',
    Icon: Camera,
  },
  {
    key: 'attire_styling',
    name: 'Attire & Styling',
    emoji: '👗',
    Icon: Shirt,
  },
  {
    key: 'tablescape',
    name: 'Tablescape',
    emoji: '🍽️',
    Icon: UtensilsCrossed,
  },
  {
    key: 'lighting_atmosphere',
    name: 'Lighting & Atmosphere',
    emoji: '☀️',
    Icon: Sun,
  },
]

// Get display config for a category key.
// Falls back gracefully for unknown
// categories — new categories work
// automatically without code changes.
export function getCategoryConfig(
  key: string
): CategoryConfig {
  return (
    CATEGORY_CONFIG.find(
      c => c.key === key
    ) ?? {
      key,
      name: key
        .split('_')
        .map(w =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
        )
        .join(' '),
      emoji: '✨',
      Icon: Sparkles,
    }
  )
}

// Derive category key from category name.
// Must match the exact same logic used in:
// - analyseCategory.ts
// - triggerAnalysis.ts
// - personaliseCategory.ts
export function getCategoryKey(
  categoryName: string
): string {
  return categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
}
