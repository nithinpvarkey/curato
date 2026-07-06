'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import MasterStyleCard from
  './MasterStyleCard'
import { Dialog, DialogContent, DialogTitle } from
  '@/components/ui/dialog'
import { Drawer, DrawerContent } from
  '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useIsDesktop } from
  '@/hooks/useIsDesktop'
import { getBestButtonColour } from
  '@/lib/colour-utils'
import { getCategoryConfig } from
  '@/lib/category-config'
import { saveChosenMaster } from
  '@/app/actions/saveChosenMaster'
import type { MasterStyleOption } from
  '@/types/analysis'

interface MasterStyleCardsProps {
  options: MasterStyleOption[]
  analysisId: string
  imageUrls: string[]
}

function MasterStylePopupContent({
  option,
  onConfirm,
}: {
  option: MasterStyleOption
  onConfirm: () => void
}) {
  const accentHex = getBestButtonColour(
    option.master_palette
  )

  return (
    <div className="space-y-6 p-6
    overflow-y-auto max-h-[80vh]">

      {/* Style name + description */}
      <div>
        <p className="text-xl font-semibold
        text-foreground leading-snug mb-2">
          {option.name}
        </p>
        <p className="text-sm
        text-muted-foreground leading-relaxed">
          {option.behavioral_description}
        </p>
      </div>

      {/* Why your style */}
      <div
        className="rounded-xl p-4"
        style={{
          backgroundColor: `${accentHex}10`
        }}
      >
        <p className="text-[10px] font-semibold
        uppercase tracking-widest mb-2"
        style={{ color: accentHex }}>
          Why this fits your saves
        </p>
        <p className="text-sm
        text-foreground/80 leading-relaxed">
          {option.why_your_style}
        </p>
      </div>

      {/* Master palette */}
      <div>
        <p className="text-[10px] font-semibold
        uppercase tracking-widest
        text-muted-foreground/60 mb-2">
          Your master palette
        </p>
        <div className="flex w-full gap-1 mb-2">
          {option.master_palette.map(
            (colour) => (
            <div
              key={colour.hex}
              className="flex-1 h-8 rounded-lg"
              style={{
                backgroundColor: colour.hex
              }}
              title={colour.name}
            />
          ))}
        </div>
        <div className="flex w-full gap-1">
          {option.master_palette.map(
            (colour) => (
            <p
              key={colour.hex}
              className="flex-1 text-[9px]
              text-muted-foreground/60
              text-center truncate"
            >
              {colour.name}
            </p>
          ))}
        </div>
      </div>

      {/* Category previews */}
      <div>
        <p className="text-[10px] font-semibold
        uppercase tracking-widest
        text-muted-foreground/60 mb-3">
          How this looks across your wedding
        </p>
        <div className="space-y-4">
          {Object.entries(
            option.category_previews
          ).map(([key, preview]) => {
            const config = getCategoryConfig(key)
            return (
              <div key={key}>
                {/* Category header */}
                <div className="flex items-center
                gap-2 mb-2">
                  <span className="text-base">
                    {config.emoji}
                  </span>
                  <p className="text-xs
                  font-semibold text-foreground">
                    {config.name}
                  </p>
                </div>
                {/* Label */}
                <p className="text-xs
                text-muted-foreground
                leading-relaxed mb-2 ml-6">
                  {preview.label}
                </p>
                {/* Category palette */}
                <div className="flex gap-1 ml-6">
                  {preview.palette.map(
                    (colour) => (
                    <div
                      key={colour.hex}
                      className="flex-1 h-6
                      rounded-md"
                      style={{
                        backgroundColor:
                          colour.hex
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

      {/* Confirm button */}
      <Button
        className="w-full h-12 text-sm
        font-semibold text-white"
        style={{ backgroundColor: accentHex }}
        onClick={onConfirm}
      >
        This is our style →
      </Button>

    </div>
  )
}

export default function MasterStyleCards({
  options,
  analysisId,
}: MasterStyleCardsProps) {

  const router = useRouter()
  const [openId, setOpenId] =
    useState<number | null>(null)
  const [isSaving, setIsSaving] =
    useState(false)
  const [saveError, setSaveError] =
    useState<string | null>(null)

  const isDesktop = useIsDesktop()

  const handleOpen = (id: number) => {
    setOpenId(id)
  }

  const handleClose = () => {
    setOpenId(null)
  }

  const handleConfirm = useCallback(
    async (id: number) => {
      setIsSaving(true)
      setSaveError(null)
      setOpenId(null)
      const result = await saveChosenMaster(
        analysisId, id
      )
      if (result.success) {
        router.push(
          `/analysis/${analysisId}/vision`
        )
      } else {
        setIsSaving(false)
        setSaveError(
          result.error ??
          'Could not save your style — please try again'
        )
      }
    },
    [analysisId, router]
  )

  return (
    <div className="space-y-6">

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-3">
        {options.slice(0, 4).map((option) => (
          <MasterStyleCard
            key={option.id}
            option={option}
            isSelected={false}
            onClick={() => handleOpen(option.id)}
          />
        ))}
      </div>

      {/* Saving state */}
      {isSaving && (
        <p className="text-center text-sm
        text-muted-foreground animate-pulse">
          Taking you to your dashboard...
        </p>
      )}

      {/* Save error */}
      {saveError && (
        <p className="text-center text-sm
        text-destructive/80">
          {saveError}
        </p>
      )}

      {/* Popup — Dialog desktop /
          Drawer mobile */}
      {options.slice(0, 4).map((option) => {
        const isOpen = openId === option.id
        const content = (
          <MasterStylePopupContent
            option={option}
            onConfirm={() =>
              handleConfirm(option.id)
            }
          />
        )

        if (isDesktop) {
          return (
            <Dialog
              key={option.id}
              open={isOpen}
              onOpenChange={(open) => {
                if (!open) handleClose()
              }}
            >
              <DialogContent
                className="max-w-lg p-0
                overflow-hidden rounded-2xl"
              >
                <DialogTitle className="sr-only">
                  {option.name}
                </DialogTitle>
                {content}
              </DialogContent>
            </Dialog>
          )
        }

        return (
          <Drawer
            key={option.id}
            open={isOpen}
            onOpenChange={(open) => {
              if (!open) handleClose()
            }}
          >
            <DrawerContent className="px-0
            pb-0 rounded-t-2xl">
              {content}
            </DrawerContent>
          </Drawer>
        )
      })}

    </div>
  )
}
