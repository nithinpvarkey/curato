'use client'

import { useState } from 'react'
import {
  Flower2,
  Leaf,
  Shapes,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CostBreakdownDonut } from './CostBreakdownDonut'
import type { StyleOption } from './StyleOptionCard'
import type {
  QuizAnswers,
  PersonalisedResult
} from '@/types/analysis'
import {
  parseBudgetRange,
  getCategoryBudgetAllocation,
  getBookingStatus
} from '@/lib/budget-utils'

interface StyleOptionTabsProps {
  option: StyleOption
  accentHex: string
  quizAnswers: QuizAnswers
  personalisedResult: PersonalisedResult | null
  isPersonalising: boolean
  categoryKey: string
}

function parsePriceMidpoint(range: string): number {
  const nums = range.match(/[\d,]+(\.\d+)?/g)
    ?.map(n => parseFloat(n.replace(/,/g, '')))
  if (!nums || nums.length === 0) return 0
  return nums.length >= 2
    ? (nums[0] + nums[1]) / 2
    : nums[0]
}

function parseDollarRangeBounds(
  text: string
): { low: number; high: number } | null {
  const nums = text.match(/[\d,]+(\.\d+)?/g)
    ?.map(n => parseFloat(n.replace(/,/g, '')))
  if (!nums || nums.length < 2) return null
  if (nums[0] <= 0 || nums[1] <= 0) return null
  return { low: nums[0], high: nums[1] }
}

export default function StyleOptionTabs({
  option,
  accentHex,
  quizAnswers,
  personalisedResult,
  isPersonalising,
  categoryKey,
}: StyleOptionTabsProps) {
  const [copiedInquiry, setCopiedInquiry] =
    useState(false)
  const [copiedVision, setCopiedVision] =
    useState(false)
  const [copiedBoth, setCopiedBoth] =
    useState(false)

  const totalBudget = parseBudgetRange(
    quizAnswers.budget_range
  )
  const allocation = getCategoryBudgetAllocation(
    totalBudget, categoryKey
  )
  const hasQuizData = !!(
    quizAnswers.budget_range ||
    quizAnswers.guest_count
  )

  const typicalCost = parseDollarRangeBounds(
    option.budget_reality_range
  )
  const realityGap =
    hasQuizData && typicalCost
      ? {
          lowPct: Math.round(
            (allocation.min / typicalCost.high) * 100
          ),
          highPct: Math.round(
            (allocation.max / typicalCost.low) * 100
          ),
        }
      : null

  const costBreakdownItems = (
    personalisedResult?.personalised_budget_items ??
    option.budget_items.map(b => ({
      item: b.item,
      adjusted_range: b.range,
      achievable: true,
      note: b.note,
    }))
  ).map(item => ({
    name: item.item,
    description: item.note,
    priceLabel: item.adjusted_range,
    chartValue: parsePriceMidpoint(item.adjusted_range),
    achievable: item.achievable,
  }))

  const bookingStatus = getBookingStatus(
    option.planner.booking_window,
    quizAnswers.wedding_month,
    quizAnswers.wedding_year
  )

  const resolvedInquiry =
    option.vendor_brief.inquiry
      .replace(
        '[WEDDING_DATE]',
        quizAnswers.wedding_month &&
        quizAnswers.wedding_year
          ? `${quizAnswers.wedding_month} ${quizAnswers.wedding_year}`
          : 'our wedding date'
      )
      .replace(
        '[CATEGORY_VENDOR]',
        categoryKey === 'flowers_d_cor'
          ? 'florist'
          : categoryKey === 'venue_atmosphere'
          ? 'venue'
          : categoryKey === 'photography_lighting'
          ? 'photographer'
          : categoryKey === 'attire_styling'
          ? 'stylist'
          : categoryKey === 'tablescape'
          ? 'rental and tabletop specialist'
          : categoryKey === 'lighting_atmosphere'
          ? 'lighting designer'
          : 'vendor'
      )

  const handleCopyInquiry = async () => {
    try {
      await navigator.clipboard.writeText(
        resolvedInquiry
      )
      setCopiedInquiry(true)
      setTimeout(
        () => setCopiedInquiry(false), 2000
      )
    } catch {
      // Silent fail
    }
  }

  const handleCopyVision = async () => {
    try {
      await navigator.clipboard.writeText(
        option.vendor_brief.vision
      )
      setCopiedVision(true)
      setTimeout(
        () => setCopiedVision(false), 2000
      )
    } catch {
      // Silent fail
    }
  }

  const handleCopyBoth = async () => {
    try {
      const combined =
        option.vendor_brief.inquiry +
        '\n\n---\n\n' +
        option.vendor_brief.vision
      await navigator.clipboard.writeText(
        combined
      )
      setCopiedBoth(true)
      setTimeout(
        () => setCopiedBoth(false), 2000
      )
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="space-y-6">

      {/* ── MAIN + SIDEBAR 12-COL LAYOUT ── */}
      <div className="grid grid-cols-1
      lg:grid-cols-12 gap-5">

        {/* ── MAIN COLUMN (lg: 8 cols) ── */}
        <div className="lg:col-span-8 space-y-5">

          {/* SUB-ROW: Why Curato + Design Language */}
          <div className="grid grid-cols-1
          lg:grid-cols-2 gap-5 items-start">

            {/* CARD: Why Curato Chose This */}
            <div className="rounded-2xl border
            border-border/40 bg-white p-5">
              <h3 className="font-serif font-semibold
              text-[15px] text-[#1F1B17] mb-3">
                Why Curato Chose This Direction
              </h3>
              {option.pattern_insights ? (
                <>
                  <p className="text-small mb-4">
                    We analyzed{' '}
                    {option.pattern_insights.sample_size}{' '}
                    saved images.
                  </p>
                  <ul className="space-y-2.5">
                    {option.pattern_insights.insights
                      .map((insight, i) => (
                      <li
                        key={i}
                        className="flex items-start
                        gap-2.5 text-small"
                      >
                        <span
                          className="flex-shrink-0
                          w-1 h-1 rounded-full mt-2.5"
                          style={{
                            backgroundColor: '#8FAF7E',
                          }}
                        />
                        <span>
                          <span className="text-[#1F1B17]
                          font-semibold tabular-nums">
                            {insight.percentage}%
                          </span>
                          {' '}
                          {insight.observation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-body">
                    {option.why_your_style}
                  </p>
                  <p className="text-small mt-3">
                    {option.signal_evidence}
                  </p>
                </>
              )}
            </div>

            {/* CARD: Design Language */}
            {option.design_language && (
              <div className="rounded-2xl border
              border-border/40 bg-white p-5">
                <h3 className="font-serif font-semibold
                text-[15px] text-[#1F1B17] mb-5">
                  Design Language
                </h3>
                <div className="grid grid-cols-2
                gap-4">

                  <div>
                    <Flower2
                      className="h-5 w-5 mb-1.5"
                      strokeWidth={1.5}
                      style={{ color: accentHex }}
                    />
                    <p className="text-label mb-2">
                      Flowers
                    </p>
                    <p
                      className="text-small"
                      style={{ color: '#4F4A45' }}
                    >
                      {option.design_language.flowers}
                    </p>
                  </div>

                  <div>
                    <Leaf
                      className="h-5 w-5 mb-1.5"
                      strokeWidth={1.5}
                      style={{ color: accentHex }}
                    />
                    <p className="text-label mb-2">
                      Greenery
                    </p>
                    <p
                      className="text-small"
                      style={{ color: '#4F4A45' }}
                    >
                      {option.design_language.greenery}
                    </p>
                  </div>

                  <div>
                    <Shapes
                      className="h-5 w-5 mb-1.5"
                      strokeWidth={1.5}
                      style={{ color: accentHex }}
                    />
                    <p className="text-label mb-2">
                      Texture &amp; Shape
                    </p>
                    <p
                      className="text-small"
                      style={{ color: '#4F4A45' }}
                    >
                      {option.design_language
                        .texture_shape}
                    </p>
                  </div>

                  <div>
                    <Sparkles
                      className="h-5 w-5 mb-1.5"
                      strokeWidth={1.5}
                      style={{ color: accentHex }}
                    />
                    <p className="text-label mb-2">
                      Vibe
                    </p>
                    <p
                      className="text-small"
                      style={{ color: '#4F4A45' }}
                    >
                      {option.design_language.vibe}
                    </p>
                  </div>

                </div>
              </div>
            )}

          </div>

          {/* CARD: Protect / Reduce / Preserve */}
          <div className="rounded-2xl border
          border-border/40 bg-white p-5 md:p-6">
            <h3 className="text-card-title mb-4">
              What to Protect, What to Reduce
            </h3>
            <div className="grid grid-cols-1
            md:grid-cols-3 gap-5">

              {/* Protect First */}
              <div>
                <p
                  className="text-label mb-3"
                  style={{ color: accentHex }}
                >
                  Protect First (High Impact)
                </p>
                <ul className="space-y-2">
                  {option.atmosphere_protection
                    .protect_first
                    .map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start
                      gap-2 text-xs
                      text-foreground/80
                      leading-snug"
                    >
                      <span
                        className="flex-shrink-0
                        mt-0.5 font-bold text-xs"
                        style={{ color: accentHex }}
                      >
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Reduce First */}
              <div>
                <p className="text-label mb-3">
                  Reduce First (Lower Impact)
                </p>
                <ul className="space-y-2">
                  {option.atmosphere_protection
                    .reduce_first
                    .map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start
                      gap-2 text-xs
                      text-muted-foreground/80
                      leading-snug"
                    >
                      <span className="flex-shrink-0
                      mt-0.5 text-xs">
                        •
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preserve The Feeling For Less */}
              <div>
                <p className="text-label mb-3">
                  Preserve the Feeling for Less
                </p>
                <ul className="space-y-3">
                  {option.savings_opportunities
                    .map((opp, i) => (
                    <li
                      key={i}
                      className="text-xs space-y-1"
                    >
                      <p className="text-muted-foreground/60
                      line-through leading-snug">
                        {opp.expensive_element}
                      </p>
                      <p className="text-foreground/80
                      leading-snug">
                        → {opp.lower_cost_alternative}
                      </p>
                      <p
                        className="text-[10px]
                        font-semibold"
                        style={{ color: accentHex }}
                      >
                        Save {opp.estimated_saving}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

          {/* CARD: Budget Reality Check + Cost Breakdown */}
          <div className="rounded-2xl border
          border-border/40 bg-white p-5 md:p-6
          space-y-5">

            {/* Budget Reality Check */}
            <div className="space-y-4">
              <h3 className="text-card-title">
                Budget Reality Check
              </h3>

              <div className="flex flex-col
              md:flex-row">

                {/* LEFT: Reality gap stat */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start
                  justify-between gap-2 mb-1">
                    <p className="text-label">
                      Budget covers
                    </p>
                    {realityGap && (
                      <span
                        className="px-2 py-0.5
                        rounded-full bg-destructive/10
                        text-destructive/80 font-sans
                        text-[10.5px] font-bold
                        uppercase tracking-[0.14em]
                        leading-none whitespace-nowrap
                        flex-shrink-0"
                      >
                        Reality gap
                      </span>
                    )}
                  </div>

                  {realityGap && typicalCost ? (
                    <>
                      <p className="font-serif
                      text-[24px] font-semibold
                      text-destructive/80
                      leading-tight">
                        ~{realityGap.lowPct}–
                        {realityGap.highPct}%
                      </p>
                      <p className="text-small mt-1.5">
                        of typical cost for this look
                      </p>

                      <div className="h-3
                      rounded-full overflow-hidden
                      mt-3 bg-destructive/10">
                        <div
                          className="h-full
                          rounded-full"
                          style={{
                            backgroundColor: '#8FAF8A',
                            width: `${Math.min(
                              100, realityGap.lowPct
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="grid
                      grid-cols-2 gap-2 mt-3">
                        <div className="rounded-lg
                        bg-muted/20 border
                        border-border/40 px-2.5 py-2">
                          <p className="text-label mb-1">
                            Your budget
                          </p>
                          <p className="text-[15px]
                          font-semibold
                          text-foreground">
                            {allocation.formatted}
                          </p>
                        </div>
                        <div className="rounded-lg
                        bg-muted/20 border
                        border-border/40 px-2.5 py-2">
                          <p className="text-label mb-1">
                            Typical cost
                          </p>
                          <p className="text-[15px]
                          font-semibold
                          text-foreground">
                            ${typicalCost.low
                              .toLocaleString()}–
                            ${typicalCost.high
                              .toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-small mt-2">
                      Add your wedding budget to see
                      how it compares to typical cost
                      for this look.
                    </p>
                  )}
                </div>

                {/* Divider */}
                <div className="hidden md:block
                w-px bg-border/40 mx-5" />

                {/* RIGHT: What drives the cost */}
                <div className="flex-1 min-w-0
                mt-5 md:mt-0">
                  <h4 className="font-serif
                  font-semibold text-[15px]
                  text-[#1F1B17] mb-3">
                    What drives the cost
                  </h4>
                  <ul className="space-y-2">
                    {option.cost_drivers
                      .slice(0, 3)
                      .map((driver, i) => (
                      <li
                        key={i}
                        className="flex items-start
                        gap-2 text-small"
                      >
                        <span className="flex-shrink-0
                        text-[10px] mt-0.5">
                          ⚠️
                        </span>
                        {driver}
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Curato advice */}
              {personalisedResult?.curato_advice &&
               !isPersonalising && (
                <div
                  className="rounded-lg p-3
                  border border-border/40"
                  style={{
                    backgroundColor: `${accentHex}08`
                  }}
                >
                  <p
                    className="text-label mb-2"
                    style={{ color: accentHex }}
                  >
                    What we&apos;d do
                  </p>
                  <p className="text-xs
                  text-foreground/80 leading-relaxed">
                    {personalisedResult.curato_advice}
                  </p>
                </div>
              )}

              {/* If this were my budget */}
              {personalisedResult &&
               !isPersonalising && (
                <div>
                  <p className="text-label mb-3">
                    If this were my budget
                  </p>
                  <div className="space-y-2">
                    {[
                      ...option.atmosphere_protection
                        .protect_first
                        .slice(0, 2)
                        .map((item, i) => ({
                          priority: i + 1,
                          text: `Protect ${item}`,
                          isProtect: true
                        })),
                      ...personalisedResult
                        .top_priority_cuts
                        .slice(0, 2)
                        .map((cut, i) => ({
                          priority: i + 3,
                          text: `Cut ${
                            cut.cut_this
                          } — use ${
                            cut.keep_this
                          } instead`,
                          isProtect: false
                        }))
                    ].map((item) => (
                      <div
                        key={item.priority}
                        className="flex items-start
                        gap-2 text-xs
                        text-foreground/80
                        leading-relaxed"
                      >
                        <span
                          className="text-[9px]
                          font-bold flex-shrink-0
                          mt-0.5 w-4 h-4 rounded-full
                          flex items-center
                          justify-center text-white"
                          style={{
                            backgroundColor:
                              item.isProtect
                                ? accentHex
                                : '#9ca3af'
                          }}
                        >
                          {item.priority}
                        </span>
                        {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="pt-5 border-t
            border-border/40 space-y-5">
              <div className="flex items-center
              justify-between">
                <h3 className="text-card-title">
                  Cost Breakdown
                </h3>
                {isPersonalising && (
                  <p className="text-[10px]
                  text-muted-foreground
                  animate-pulse">
                    Personalising...
                  </p>
                )}
                {personalisedResult &&
                 !isPersonalising && (
                  <p
                    className="text-[10px]
                    font-medium"
                    style={{ color: accentHex }}
                  >
                    ✓ Personalised for you
                  </p>
                )}
              </div>

              <CostBreakdownDonut
                items={costBreakdownItems}
              />
            </div>

          </div>


        </div>

        {/* ── SIDEBAR COLUMN (lg: 4 cols) ── */}
        <div className="lg:col-span-4 space-y-5
        lg:sticky lg:top-4 lg:self-start">

          {/* CARD: Vendor Brief */}
          <div
            className="rounded-2xl border-2
            p-5 space-y-4"
            style={{ borderColor: accentHex }}
          >
            <h3 className="font-serif font-semibold
            text-[15px] text-[#1F1B17]">
              Vendor Brief
            </h3>

            {/* Inquiry */}
            <div>
              <p
                className="text-label mb-2"
                style={{ color: accentHex }}
              >
                Inquiry Message
              </p>
              <p className="text-small
              line-clamp-4 mb-2">
                {resolvedInquiry}
              </p>
              <Button
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={handleCopyInquiry}
                style={copiedInquiry ? {
                  borderColor: accentHex,
                  color: accentHex,
                } : undefined}
              >
                {copiedInquiry
                  ? '✓ Copied'
                  : 'Copy inquiry'}
              </Button>
            </div>

            {/* Vision */}
            <div className="border-t
            border-border/30 pt-4">
              <p className="text-label mb-2">
                Full Vision Brief
              </p>
              <p className="text-small
              line-clamp-4 mb-2">
                {option.vendor_brief.vision}
              </p>
              <Button
                variant="outline"
                className="w-full h-9 text-xs"
                onClick={handleCopyVision}
                style={copiedVision ? {
                  borderColor: accentHex,
                  color: accentHex,
                } : undefined}
              >
                {copiedVision
                  ? '✓ Copied'
                  : 'Copy full brief'}
              </Button>
            </div>
          </div>

          {/* CARD: Why This Fits You */}
          <div className="rounded-2xl border
          border-border/40 bg-white p-5 md:p-6">
            <h3 className="font-serif text-lg
            font-semibold text-foreground mb-3">
              Why This Fits You
            </h3>
            <p className="text-small">
              {option.behavioral_description}
            </p>
          </div>

          {/* CARD: Don'ts */}
          <div className="rounded-2xl border
          border-border/40 bg-white p-5">
            <h3 className="font-serif font-semibold
            text-[15px] text-[#1F1B17] mb-3">
              Don&apos;ts — Tell Your Vendor
              to Avoid These
            </h3>
            <ul className="space-y-2">
              {option.do_not_list.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start
                  gap-2.5 text-small"
                >
                  <span
                    className="font-bold mt-0.5
                    flex-shrink-0 text-xs"
                    style={{ color: accentHex }}
                  >
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CARD: Ask Your Vendor */}
          <div className="rounded-2xl border
          border-border/40 bg-white p-5">
            <h3 className="font-serif font-semibold
            text-[15px] text-[#1F1B17] mb-3">
              Ask Your Vendor
            </h3>
            <ul className="space-y-2">
              {option.planner.questions_to_ask
                .map((q, i) => (
                <li
                  key={i}
                  className="flex items-start
                  gap-2.5 text-small"
                >
                  <span
                    className="text-xs font-bold
                    flex-shrink-0 mt-0.5 w-4
                    text-center"
                    style={{ color: accentHex }}
                  >
                    {i + 1}
                  </span>
                  {q}
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>

      {/* ── ROW 3: BOTTOM 3-COLUMN TILES ── */}
      <div className="grid grid-cols-1
      sm:grid-cols-2 lg:grid-cols-3 gap-5">

        {/* CARD: Common Budget Surprises */}
        <div className="rounded-2xl border
        border-border/40 bg-white p-5">
          <h4 className="text-card-title mb-3">
            Common Budget Surprises
          </h4>
          <ul className="space-y-2">
            {option.budget_surprises
              .slice(0, 5)
              .map((surprise, i) => (
              <li
                key={i}
                className="flex items-start
                gap-2 text-xs
                text-muted-foreground
                leading-relaxed"
              >
                <span className="flex-shrink-0
                text-[10px] mt-0.5">
                  ⚠️
                </span>
                {surprise}
              </li>
            ))}
          </ul>
        </div>

        {/* CARD: Planner Checklist (compact) */}
        <div className="rounded-2xl border
        border-border/40 bg-white p-5">
          <h4 className="text-card-title mb-3">
            Your Next Steps
          </h4>
          <ul className="space-y-2">
            {/* Folded in from the removed Book By card */}
            <li
              className="flex items-start
              gap-2 text-xs leading-relaxed
              text-destructive/80"
            >
              <div
                className="w-3 h-3 rounded
                border border-destructive/80
                flex-shrink-0 mt-0.5"
              />
              {bookingStatus?.genericText ??
                option.planner.booking_window}
              {bookingStatus?.calculatedMessage &&
                ` — ${bookingStatus.calculatedMessage}`}
            </li>
            {option.planner
              .coordination_checklist
              .slice(0, 5)
              .map((item, i) => (
              <li
                key={i}
                className="flex items-start
                gap-2 text-xs
                text-foreground/80
                leading-relaxed"
              >
                <div
                  className="w-3 h-3 rounded
                  border flex-shrink-0 mt-0.5"
                  style={{ borderColor: accentHex }}
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CARD: Search Smart (compact) */}
        <div className="rounded-2xl border
        border-border/40 bg-white p-5">
          <h4 className="text-card-title mb-3">
            Search Smart
          </h4>
          <p className="text-label mb-2">
            Use these
          </p>
          <div className="flex flex-wrap
          gap-1.5 mb-3">
            {option.vendor_keywords
              .slice(0, 5)
              .map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5
                rounded-full text-[10px]
                font-medium border"
                style={{
                  backgroundColor:
                    `${accentHex}15`,
                  borderColor:
                    `${accentHex}40`,
                  color: accentHex,
                }}
              >
                {kw}
              </span>
            ))}
          </div>
          <p className="text-label mb-2">
            Avoid these
          </p>
          <div className="flex flex-wrap gap-1.5">
            {option.avoid_keywords
              .slice(0, 5)
              .map((kw, i) => (
              <span
                key={i}
                className="px-2 py-0.5
                rounded-full text-[10px]
                font-medium border
                text-muted-foreground/50
                border-border/30
                bg-muted/20 line-through"
              >
                {kw}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* ── Copy both button ── */}
      <div className="flex justify-center pt-2">
        <Button
          variant="ghost"
          className="h-9 px-6 text-xs
          text-muted-foreground
          hover:text-foreground
          transition-all duration-200"
          onClick={handleCopyBoth}
          style={copiedBoth
            ? { color: accentHex }
            : undefined
          }
        >
          {copiedBoth
            ? '✓ Both copied'
            : 'Copy both inquiry + vision together'}
        </Button>
      </div>

    </div>
  )
}
