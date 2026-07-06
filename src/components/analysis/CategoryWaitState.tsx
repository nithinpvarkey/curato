'use client'

import { useState, useEffect } from 'react'
import { getWaitContent } from '@/lib/category-wait-content'

interface CategoryWaitStateProps {
  categoryName: string
  categoryKey: string
  palette?: { hex: string; name: string }[]
}

const FALLBACK_PALETTE = [
  { hex: '#E8E2D9', name: 'Cream' },
  { hex: '#C8BFB0', name: 'Warm Grey' },
  { hex: '#9E9589', name: 'Sage Stone' },
  { hex: '#7A7269', name: 'Warm Taupe' },
]

export default function CategoryWaitState({
  categoryName,
  categoryKey,
  palette,
}: CategoryWaitStateProps) {
  const lines = getWaitContent(categoryKey)
  const colors = palette && palette.length > 0 ? palette : FALLBACK_PALETTE

  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    let fadeIn: ReturnType<typeof setTimeout>
    const interval = setInterval(() => {
      setVisible(false)
      fadeIn = setTimeout(() => {
        setIdx(i => (i + 1) % lines.length)
        setVisible(true)
      }, 350)
    }, 5500)
    return () => {
      clearInterval(interval)
      clearTimeout(fadeIn)
    }
  }, [lines.length])

  return (
    <div className="rounded-2xl border border-border/50
    bg-[#FDFAF7] overflow-hidden">

      {/* Pulsing palette strip */}
      <div className="flex w-full animate-pulse">
        {colors.slice(0, 5).map((c) => (
          <div
            key={c.hex}
            className="flex-1 h-3"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>

      <div className="px-5 pt-5 pb-6 space-y-4">

        {/* Status line — honest, fixed */}
        <p className="text-[10px] font-semibold uppercase
        tracking-widest text-muted-foreground/50 leading-relaxed">
          Reading your {categoryName.toLowerCase()}… this takes
          about a minute. Worth getting right.
        </p>

        {/* Rotating tip */}
        <p
          className="text-sm text-foreground/70 leading-relaxed
          min-h-[3rem] transition-opacity duration-300"
          style={{ opacity: visible ? 1 : 0 }}
        >
          {lines[idx]}
        </p>

      </div>
    </div>
  )
}
