'use client'

import { getBestButtonColour } from
  '@/lib/colour-utils'
import type { MasterStyleOption } from
  '@/types/analysis'
import { getCategoryConfig } from
  '@/lib/category-config'

interface MasterStyleCardProps {
  option: MasterStyleOption
  isSelected: boolean
  onClick: () => void
}

export default function MasterStyleCard({
  option,
  isSelected,
  onClick,
}: MasterStyleCardProps) {

  const accentHex = getBestButtonColour(
    option.master_palette
  )

  return (
    <div
      onClick={onClick}
      className={`
        relative rounded-2xl border-2 p-4
        cursor-pointer transition-all
        duration-200 select-none
        ${isSelected
          ? 'shadow-sm'
          : 'border-border/40 hover:border-border/70'
        }
      `}
      style={isSelected ? {
        borderColor: accentHex,
        backgroundColor: `${accentHex}08`,
      } : undefined}
    >

      {/* Checkmark — top right when selected */}
      {isSelected && (
        <div
          className="absolute top-3 right-3
          w-6 h-6 rounded-full flex items-center
          justify-center"
          style={{ backgroundColor: accentHex }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Style name */}
      <p className="text-sm font-semibold
      text-foreground leading-snug pr-8 mb-1">
        {option.name}
      </p>

      {/* Behavioral description — 1 line */}
      <p className="text-xs text-muted-foreground
      leading-relaxed line-clamp-1 mb-3">
        {option.behavioral_description}
      </p>

      {/* Master palette strip */}
      <div className="flex w-full gap-0.5 mb-2">
        {option.master_palette
          .slice(0, 5)
          .map((colour) => (
          <div
            key={colour.hex}
            className="flex-1 h-4 rounded-md"
            style={{
              backgroundColor: colour.hex
            }}
            title={colour.name}
          />
        ))}
      </div>

      {/* Category palette strips */}
      <div className="space-y-1.5 mt-3">
        {Object.entries(
          option.category_previews
        ).map(([key, preview]) => {
          const config = getCategoryConfig(key)
          return (
            <div
              key={key}
              className="flex items-center gap-2"
            >
              <span className="text-xs
              flex-shrink-0 w-4 text-center">
                {config.emoji}
              </span>
              <div className="flex flex-1
              gap-0.5">
                {preview.palette
                  .slice(0, 4)
                  .map((colour) => (
                  <div
                    key={colour.hex}
                    className="flex-1 h-2.5
                    rounded-sm"
                    style={{
                      backgroundColor: colour.hex
                    }}
                    title={colour.name}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
