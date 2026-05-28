'use client'

import { useState } from 'react'
import { useIsDesktop } from '@/hooks/useIsDesktop'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import StyleOptionCardCompact from './StyleOptionCardCompact'
import StyleOptionCardFull from './StyleOptionCardFull'
import {
  getBestButtonColour,
  buildPaletteGradient,
} from '@/lib/colour-utils'
import type { StyleOption } from './StyleOptionCard'

interface StyleOptionCardsProps {
  options: StyleOption[]
  categoryName: string
}

export default function StyleOptionCards({
  options,
  categoryName: _categoryName,
}: StyleOptionCardsProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [openId, setOpenId] = useState<number | null>(null)
  const isDesktop = useIsDesktop()

  const selectedOption = selectedId !== null
    ? options.find(o => o.id === selectedId) ?? null
    : null

  const bannerAccent = selectedOption
    ? getBestButtonColour(selectedOption.palette)
    : '#b8a99a'

  const paletteGradient = selectedOption
    ? buildPaletteGradient(selectedOption.palette)
    : ''

  const handleSelect = (id: number) => {
    setSelectedId(prev => prev === id ? null : id)
    setOpenId(null)
  }

  const handleClose = () => setOpenId(null)

  return (
    <div className="space-y-4">

      {/* ── CHOSEN BANNER ── */}
      {selectedOption && (
        <div
          className="rounded-2xl border-2 overflow-hidden animate-in slide-in-from-top-2 duration-300"
          style={{ borderColor: bannerAccent }}
        >
          <div
            className="h-10 w-full"
            style={{ background: paletteGradient }}
          />
          <div
            className="px-5 py-4"
            style={{ backgroundColor: `${bannerAccent}12` }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                  Your chosen direction
                </p>
                <p className="text-base font-semibold text-foreground leading-snug">
                  {selectedOption.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap mt-1 underline-offset-2 hover:underline flex-shrink-0"
              >
                Change selection →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2×2 GRID ── */}
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <StyleOptionCardCompact
            key={option.id}
            option={option}
            isSelected={selectedId === option.id}
            onClick={() => setOpenId(option.id)}
          />
        ))}
      </div>

      {/* ── RESPONSIVE POPUP ── */}
      {options.map((option) => {
        const isOpen = openId === option.id
        const isSelected = selectedId === option.id

        return (
          <div key={option.id}>
            {isDesktop ? (
              /* DESKTOP — shadcn Dialog */
              /* Only rendered when isDesktop is true */
              /* Dialog overlay never activates on mobile */
              <Dialog
                open={isOpen}
                onOpenChange={(open) => {
                  if (!open) handleClose()
                }}
              >
                <DialogContent
                  className="max-w-[720px] w-full p-0 overflow-hidden rounded-2xl border-0 animate-in zoom-in-95 duration-200"
                >
                  <DialogHeader className="sr-only">
                    <DialogTitle>{option.name}</DialogTitle>
                  </DialogHeader>
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: '75vh' }}
                  >
                    <StyleOptionCardFull
                      option={option}
                      isSelected={isSelected}
                      onSelect={() => handleSelect(option.id)}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            ) : (
              /* MOBILE — Vaul bottom drawer */
              /* Only rendered when isDesktop is false */
              /* Never active on desktop */
              <Drawer
                open={isOpen}
                onOpenChange={(open) => {
                  if (!open) handleClose()
                }}
              >
                <DrawerContent
                  className="focus:outline-none"
                  style={{ maxHeight: '75vh' }}
                >
                  <DrawerHeader className="sr-only">
                    <DrawerTitle>{option.name}</DrawerTitle>
                  </DrawerHeader>
                  <div className="overflow-y-auto">
                    <StyleOptionCardFull
                      option={option}
                      isSelected={isSelected}
                      onSelect={() => handleSelect(option.id)}
                    />
                  </div>
                </DrawerContent>
              </Drawer>
            )}
          </div>
        )
      })}

      {/* ── FLOATING INDICATOR ── */}
      {selectedOption && openId === null && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border border-border/50 bg-background/95 backdrop-blur-sm animate-in slide-in-from-bottom-2 duration-300 pointer-events-none">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: bannerAccent }}
          />
          <span className="text-xs font-medium text-foreground whitespace-nowrap">
            {selectedOption.name}
          </span>
        </div>
      )}

    </div>
  )
}
