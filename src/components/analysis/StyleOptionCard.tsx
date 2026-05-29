'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { getBestButtonColour, getContrastText } from '@/lib/colour-utils'

export type StyleOption = {
  id: number
  name: string
  confidence: 'high' | 'medium' | 'low'
  signal_evidence: string
  behavioral_description: string
  why_your_style: string
  palette: { hex: string; name: string }[]
  do_not_list: string[]
  vendor_keywords: string[]
  avoid_keywords: string[]
  budget_items: {
    item: string
    range: string
    note: string
  }[]
  vendor_brief: string
  planner: {
    booking_window: string
    questions_to_ask: string[]
    coordination_checklist: string[]
  }
  budget_reality_range: string
  cost_drivers: string[]
  budget_surprises: string[]
  savings_opportunities: {
    expensive_element: string
    lower_cost_alternative: string
    estimated_saving: string
    atmosphere_impact: 'low' | 'medium' | 'high'
  }[]
  atmosphere_protection: {
    protect_first: string[]
    reduce_first: string[]
  }
}

interface StyleOptionCardProps {
  option: StyleOption
  isSelected: boolean
  onSelect: (id: number) => void
}


export default function StyleOptionCard({
  option,
  isSelected,
  onSelect,
}: StyleOptionCardProps) {
  const [showMore, setShowMore] = useState(false)

  const accentHex = getBestButtonColour(option.palette)
  const buttonTextColor = getContrastText(accentHex)

  return (
    <Card
      className={
        isSelected
          ? 'relative overflow-hidden rounded-2xl border-2 bg-[#FDFAF7] shadow-md transition-all duration-300 -translate-y-0.5'
          : 'relative overflow-hidden rounded-2xl border border-border bg-[#FDFAF7] shadow-sm transition-all duration-300 cursor-default'
      }
      style={
        isSelected
          ? ({ '--card-accent': accentHex, borderColor: accentHex } as React.CSSProperties)
          : ({ '--card-accent': accentHex } as React.CSSProperties)
      }
    >
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{ backgroundColor: accentHex, opacity: isSelected ? 0.06 : 0 }}
      />

      <CardContent className="p-6 md:p-7 space-y-5 relative z-10">

        {/* Section 1 — Header */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-foreground leading-snug">
            {option.name}
          </h3>
        </div>

        {/* Section 2 — Behavioral description */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {option.behavioral_description}
        </p>

        {/* Section 3 — Palette swatches */}
        <div className="flex flex-wrap gap-4">
          {option.palette.slice(0, 5).map((color) => (
            <div key={color.hex} className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full border border-border/60 shadow-sm flex-shrink-0"
                style={{ backgroundColor: color.hex }}
                title={color.hex}
              />
              <span className="text-[10px] text-muted-foreground text-center max-w-[52px] leading-tight truncate">
                {color.name}
              </span>
            </div>
          ))}
        </div>

        {/* Section 4 — Expandable toggle */}
        <div>
          <button
            onClick={() => setShowMore(!showMore)}
            className="flex items-center justify-between w-full min-h-[44px] text-sm text-muted-foreground hover:text-foreground transition-colors"
            aria-expanded={showMore}
          >
            <span className="font-medium">
              {showMore ? 'Show less' : 'What makes this your style?'}
            </span>
            {showMore
              ? <ChevronUp className="w-4 h-4 flex-shrink-0" />
              : <ChevronDown className="w-4 h-4 flex-shrink-0" />
            }
          </button>

          {showMore && (
            <div className="space-y-4 pt-2">
              <p
                className="text-sm italic text-foreground/75 leading-relaxed border-l-2 pl-3"
                style={{ borderColor: accentHex }}
              >
                "{option.why_your_style}"
              </p>

              <p className="text-xs text-muted-foreground">
                Match confidence:{' '}
                <span className="font-medium capitalize">{option.confidence}</span>
              </p>

              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1.5">
                  What your images kept coming back to
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {option.signal_evidence}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Section 5 — Select button */}
        {isSelected ? (
          <Button
            className="w-full transition-all duration-200"
            style={{ backgroundColor: accentHex, borderColor: accentHex, color: buttonTextColor }}
            onClick={() => onSelect(option.id)}
          >
            <Check className="w-4 h-4 mr-2 animate-in zoom-in-50 duration-200" />
            Selected
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full transition-all duration-200"
            onClick={() => onSelect(option.id)}
          >
            Select This Style
          </Button>
        )}

      </CardContent>
    </Card>
  )
}
