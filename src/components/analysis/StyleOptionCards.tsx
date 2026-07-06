'use client'

import { useState, useEffect } from 'react'
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
} from '@/lib/colour-utils'
import type { StyleOption } from './StyleOptionCard'
import StyleOptionTabs from './StyleOptionTabs'
import { personaliseCategory } from
  '@/app/actions/personaliseCategory'
import { createClient } from
  '@/lib/supabase/client'
import type {
  QuizAnswers,
  PersonalisedResult
} from '@/types/analysis'
import { getCategoryConfig, getCategoryKey } from '@/lib/category-config'

interface StyleOptionCardsProps {
  options: StyleOption[]
  categoryName: string
  analysisId: string
}

export default function StyleOptionCards({
  options,
  categoryName,
  analysisId,
}: StyleOptionCardsProps) {
  const isSingleOption = options.length === 1
  const categoryKey = getCategoryKey(categoryName)
  const categoryConfig = getCategoryConfig(categoryKey)

  const [selectedId, setSelectedId] = useState<number | null>(
    isSingleOption ? options[0].id : null
  )
  const [openId, setOpenId] = useState<number | null>(null)
  const isDesktop = useIsDesktop()

  const [quizAnswers, setQuizAnswers] =
    useState<QuizAnswers>({
      wedding_month: null,
      wedding_year: null,
      guest_count: null,
      budget_range: null,
    })
  const [personalisedResult, setPersonalisedResult] =
    useState<PersonalisedResult | null>(null)
  const [isPersonalising, setIsPersonalising] =
    useState(false)

  const selectedOption = selectedId !== null
    ? options.find(o => o.id === selectedId) ?? null
    : null

  const bannerAccent = selectedOption
    ? getBestButtonColour(selectedOption.palette)
    : '#b8a99a'

  const handleClose = () => setOpenId(null)

  const fetchAndPersonalise = async (
    option: StyleOption
  ) => {
    setIsPersonalising(true)
    setPersonalisedResult(null)
    try {
      const supabase = createClient()
      const { data: quizData } = await supabase
        .from('quiz_responses')
        .select('answers')
        .eq('analysis_id', analysisId)
        .eq('respondent', 'partner_a')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      const answers: QuizAnswers =
        (quizData?.answers as QuizAnswers) ?? {
          wedding_month: null,
          wedding_year: null,
          guest_count: null,
          budget_range: null,
        }
      setQuizAnswers(answers)

      const result = await personaliseCategory({
        analysisId,
        optionId: option.id,
        categoryName,
        option,
        quizAnswers: answers,
      })
      if (result.success && result.data) {
        setPersonalisedResult(result.data)
      }
    } catch {
      // Silent fail — tabs still show generic data
    } finally {
      setIsPersonalising(false)
    }
  }

  useEffect(() => {
    if (isSingleOption) {
      setSelectedId(options[0].id)
      fetchAndPersonalise(options[0])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options[0]?.id])

  const handleSelect = (id: number) => {
    const newId = selectedId === id ? null : id
    setSelectedId(newId)
    setOpenId(null)
    if (newId !== null) {
      const selected = options.find(o => o.id === newId)
      if (selected) fetchAndPersonalise(selected)
    } else {
      setPersonalisedResult(null)
      setQuizAnswers({
        wedding_month: null,
        wedding_year: null,
        guest_count: null,
        budget_range: null,
      })
    }
  }

  return (
    <div className="space-y-4">

      {/* ── 2×2 GRID ── */}
      {!isSingleOption && (
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
      )}

      {/* ── POST-SELECTION SECTION ── */}
      {selectedOption && (
        <div className="animate-in
        slide-in-from-top-2 fade-in duration-300
        mt-6 rounded-2xl border border-border/50
        bg-[#FDFAF7] overflow-hidden">

          {/* Chosen banner row */}
          <div className="flex items-start
          justify-between gap-3 px-5 pt-5 mb-3">
            <div>
              <p className="text-sm font-semibold
              text-foreground leading-snug">
                {categoryConfig.emoji} Your {categoryConfig.name} Direction
              </p>
              <p className="text-xs mt-0.5"
                style={{ color: '#4A7A4A' }}>
                All briefs below are based on
                this choice
              </p>
            </div>
            {!isSingleOption && (
              <button
                onClick={() => setSelectedId(null)}
                className="flex-shrink-0 px-3 py-1.5
                rounded-full border border-border
                text-xs text-muted-foreground
                hover:text-foreground
                hover:border-foreground/40
                transition-colors whitespace-nowrap
                mt-0.5"
              >
                Change style
              </button>
            )}
          </div>

          {/* Full-width palette strip with
              colour names inside each bar */}
          <div className="flex w-full gap-0.5
          mb-0">
            {selectedOption.palette
              .slice(0, 5)
              .map((color) => {
                return (
                  <div
                    key={color.hex}
                    className="flex-1 h-10"
                    style={{
                      backgroundColor: color.hex
                    }}
                    title={color.name}
                  />
                )
              })
            }
          </div>

          <div className="px-5 pb-5 pt-4">
            <StyleOptionTabs
              option={selectedOption}
              accentHex={bannerAccent}
              quizAnswers={quizAnswers}
              personalisedResult={personalisedResult}
              isPersonalising={isPersonalising}
              categoryKey={categoryKey}
            />
          </div>

        </div>
      )}

      {/* ── RESPONSIVE POPUP ── */}
      {!isSingleOption && options.map((option) => {
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


    </div>
  )
}
