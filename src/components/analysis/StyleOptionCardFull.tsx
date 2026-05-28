'use client'

import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import {
  getBestButtonColour,
  getContrastText,
} from '@/lib/colour-utils'
import type { StyleOption } from './StyleOptionCard'

interface StyleOptionCardFullProps {
  option: StyleOption
  isSelected: boolean
  onSelect: () => void
}

export default function StyleOptionCardFull({
  option,
  isSelected,
  onSelect,
}: StyleOptionCardFullProps) {
  const accentHex = getBestButtonColour(option.palette)
  const buttonTextColor = getContrastText(accentHex)

  return (
    <div className="overflow-hidden bg-[#FDFAF7]">

      {/* ── Palette circles ── */}
      <div className="px-7 pt-7 pb-6">
        <div className="flex gap-3 flex-wrap">
          {option.palette.slice(0, 5).map((color) => (
            <div key={color.hex} className="flex flex-col items-center gap-1.5">
              <div
                className="w-11 h-11 rounded-full border border-border/40 shadow-sm flex-shrink-0"
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
              <span className="text-[10px] text-muted-foreground text-center max-w-[52px] leading-tight truncate">
                {color.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Option name ── */}
      <div className="px-7 pb-7">
        <h2 className="text-2xl font-bold text-foreground leading-tight">
          {option.name}
        </h2>
      </div>

      {/* ── Section 1: What this says about you ── */}
      <div className="px-7 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
          What this says about you
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {option.why_your_style}
        </p>
      </div>

      {/* ── Section 2: Your visual language ── */}
      <div className="px-7 pb-6">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
          Your visual language
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {option.behavioral_description}
        </p>
      </div>

      {/* ── Section 3: The thread running through ── */}
      <div className="px-7 pb-7">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-2">
          The thread running through your saves
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed">
          {option.signal_evidence}
        </p>
      </div>

      {/* ── Select button ── */}
      <div className="px-7 pb-7">
        {isSelected ? (
          <Button
            className="w-full h-11 transition-all duration-200 font-medium"
            style={{ backgroundColor: accentHex, borderColor: accentHex, color: buttonTextColor }}
            onClick={onSelect}
          >
            <Check className="w-4 h-4 mr-2" />
            Selected — tap to deselect
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full h-11 transition-all duration-200 font-medium"
            onClick={onSelect}
          >
            Select This Style
          </Button>
        )}
      </div>

    </div>
  )
}
