'use client'

import { getBestButtonColour } from '@/lib/colour-utils'
import type { StyleOption } from './StyleOptionCard'

interface StyleOptionCardCompactProps {
  option: StyleOption
  isSelected: boolean
  onClick: () => void
}

export default function StyleOptionCardCompact({
  option,
  isSelected,
  onClick,
}: StyleOptionCardCompactProps) {
  const accentHex = getBestButtonColour(option.palette)

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border overflow-hidden
        cursor-pointer transition-all duration-300
        bg-[#FDFAF7]
        ${isSelected
          ? 'border-2 shadow-md -translate-y-0.5'
          : 'border-border shadow-sm hover:shadow-md'
        }
      `}
      style={isSelected ? { borderColor: accentHex } : undefined}
    >
      {/* Selection wash overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{ backgroundColor: accentHex, opacity: isSelected ? 0.08 : 0 }}
      />

      {/* Selected checkmark — top right corner */}
      {isSelected && (
        <div
          className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center z-10"
          style={{ backgroundColor: accentHex }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path
              d="M2 5l2.5 2.5L8 3"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Card content */}
      <div className="p-4 space-y-3 relative z-10">
        <h3 className="text-sm font-semibold text-foreground leading-snug pr-6">
          {option.name}
        </h3>

        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {option.behavioral_description}
        </p>

        <div className="flex gap-1.5 flex-wrap">
          {option.palette.slice(0, 5).map((color) => (
            <div
              key={color.hex}
              className="w-4 h-4 rounded-full border border-border/40 flex-shrink-0"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
