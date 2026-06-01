'use client'

import { useState } from 'react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import type { StyleOption } from './StyleOptionCard'

interface StyleOptionTabsProps {
  option: StyleOption
  accentHex: string
}

export default function StyleOptionTabs({
  option,
  accentHex,
}: StyleOptionTabsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(
        option.vendor_brief
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silent fail
    }
  }

  return (
    <div className="animate-in slide-in-from-top-2
    fade-in duration-300 mt-6">

      {/* Section label */}
      <p className="text-xs font-semibold uppercase
      tracking-widest text-muted-foreground/60
      mb-3 px-1">
        Your {option.name} direction
      </p>

      <Tabs defaultValue="brief">

        {/* Scrollable tab row — mobile friendly */}
        <div className="overflow-x-auto
        scrollbar-none -mx-1 px-1 mb-4">
          <TabsList
            variant="line"
            className="w-max min-w-full flex"
          >
            <TabsTrigger
              value="brief"
              className="flex-1"
            >
              Brief
            </TabsTrigger>
            <TabsTrigger
              value="donts"
              className="flex-1"
            >
              Don&apos;ts
            </TabsTrigger>
            <TabsTrigger
              value="planner"
              className="flex-1"
            >
              Planner
            </TabsTrigger>
            <TabsTrigger
              value="keywords"
              className="flex-1"
            >
              Search
            </TabsTrigger>
            <TabsTrigger
              value="budget"
              className="flex-1"
            >
              Budget
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ── BRIEF TAB ── */}
        <TabsContent value="brief">
          <div
            className="bg-[#FDFAF7] rounded-2xl
            border-2 p-6 space-y-4"
            style={{ borderColor: accentHex }}
          >
            <div>
              <p
                className="text-[10px] font-semibold
                uppercase tracking-widest mb-3"
                style={{ color: accentHex }}
              >
                Send this to your vendor
              </p>
              <p className="text-sm text-foreground/80
              leading-relaxed">
                {option.vendor_brief}
              </p>
            </div>
            <Button
              variant="outline"
              className="w-full h-11 text-sm
              transition-all duration-200"
              onClick={handleCopy}
              style={copied ? {
                borderColor: accentHex,
                color: accentHex,
              } : undefined}
            >
              {copied
                ? '✓ Copied to clipboard'
                : 'Copy to clipboard'}
            </Button>
          </div>
        </TabsContent>

        {/* ── DON'TS TAB ── */}
        <TabsContent value="donts">
          <div className="bg-[#FDFAF7] rounded-2xl
          border border-border/40 p-6">
            <p className="text-[10px] font-semibold
            uppercase tracking-widest
            text-muted-foreground/60 mb-4">
              Tell your vendor to avoid these
            </p>
            <ul className="space-y-3">
              {option.do_not_list.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start
                  gap-3 text-sm text-foreground/80
                  leading-relaxed"
                >
                  <span
                    className="font-bold mt-0.5
                    flex-shrink-0 text-sm"
                    style={{ color: accentHex }}
                  >
                    —
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        {/* ── PLANNER TAB ── */}
        <TabsContent value="planner">
          <div className="bg-[#FDFAF7] rounded-2xl
          border border-border/40 p-6 space-y-6">

            {/* Book by */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-2">
                Book by
              </p>
              <p className="text-sm font-medium
              text-foreground leading-snug">
                {option.planner.booking_window}
              </p>
            </div>

            <div className="border-t
            border-border/30" />

            {/* Ask your vendor */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                Ask your vendor
              </p>
              <ul className="space-y-4">
                {option.planner.questions_to_ask
                  .map((q, i) => (
                  <li
                    key={i}
                    className="flex items-start
                    gap-3 text-sm text-foreground/80
                    leading-relaxed"
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

            <div className="border-t
            border-border/30" />

            {/* Your next steps */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                Your next steps
              </p>
              <ul className="space-y-3">
                {option.planner.coordination_checklist
                  .map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start
                    gap-3 text-sm text-foreground/80
                    leading-relaxed"
                  >
                    <div
                      className="w-4 h-4 rounded
                      border-2 flex-shrink-0 mt-0.5"
                      style={{
                        borderColor: accentHex
                      }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </TabsContent>

        {/* ── KEYWORDS TAB ── */}
        <TabsContent value="keywords">
          <div className="bg-[#FDFAF7] rounded-2xl
          border border-border/40 p-6 space-y-5">

            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                Search for vendors using
              </p>
              <div className="flex flex-wrap gap-2">
                {option.vendor_keywords.map(
                  (kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5
                    rounded-full text-xs
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
            </div>

            <div className="border-t
            border-border/30" />

            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                Don't search these
              </p>
              <div className="flex flex-wrap gap-2">
                {option.avoid_keywords.map(
                  (kw, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5
                    rounded-full text-xs
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
        </TabsContent>

        {/* ── BUDGET TAB ── */}
        <TabsContent value="budget">
          <div className="bg-[#FDFAF7] rounded-2xl
          border border-border/40 p-6 space-y-6">

            {/* Reality Check Banner */}
            <div
              className="rounded-xl px-4 py-4
              flex items-start gap-3"
              style={{
                backgroundColor: `${accentHex}12`,
              }}
            >
              <span className="text-lg
              flex-shrink-0 leading-none mt-0.5">
                🟡
              </span>
              <div>
                <p className="text-xs font-semibold
                text-foreground mb-1">
                  Budget Reality Check
                </p>
                <p className="text-sm
                text-foreground/80 leading-relaxed">
                  Your selected direction typically
                  requires{' '}
                  <span className="font-semibold">
                    {option.budget_reality_range}
                  </span>
                </p>
              </div>
            </div>

            {/* Cost breakdown table */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                Cost breakdown
              </p>
              <div className="divide-y
              divide-border/30">
                {option.budget_items.map(
                  (item, i) => (
                  <div key={i} className="py-3
                  first:pt-0 last:pb-0">
                    <div className="flex items-start
                    justify-between gap-4">
                      <span className="text-sm
                      text-foreground/80
                      leading-snug">
                        {item.item}
                      </span>
                      <span className="text-sm
                      font-semibold text-foreground
                      flex-shrink-0 tabular-nums">
                        {item.range}
                      </span>
                    </div>
                    {item.note && (
                      <p className="text-xs
                      text-muted-foreground mt-1
                      leading-relaxed">
                        {item.note}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t
            border-border/30" />

            {/* What drives the cost */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                What drives the cost
              </p>
              <ul className="space-y-2.5">
                {option.cost_drivers.map(
                  (driver, i) => (
                  <li
                    key={i}
                    className="flex items-start
                    gap-2.5 text-sm
                    text-muted-foreground
                    leading-relaxed"
                  >
                    <span
                      className="flex-shrink-0
                      w-1.5 h-1.5 rounded-full
                      mt-1.5"
                      style={{
                        backgroundColor: accentHex,
                      }}
                    />
                    {driver}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t
            border-border/30" />

            {/* Common budget surprises */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-3">
                Common budget surprises
              </p>
              <ul className="space-y-2.5">
                {option.budget_surprises.map(
                  (surprise, i) => (
                  <li
                    key={i}
                    className="flex items-start
                    gap-2.5 text-sm
                    text-muted-foreground
                    leading-relaxed"
                  >
                    <span className="flex-shrink-0
                    text-xs mt-0.5">
                      ⚠️
                    </span>
                    {surprise}
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t
            border-border/30" />

            {/* Preserve the feeling for less */}
            <div>
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/60 mb-1">
                Preserve the feeling for less
              </p>
              <p className="text-xs
              text-muted-foreground mb-4
              leading-relaxed">
                These swaps protect the atmosphere
                while reducing cost.
              </p>
              <div className="space-y-4">
                {option.savings_opportunities.map(
                  (opp, i) => (
                  <div
                    key={i}
                    className="rounded-xl border
                    border-border/40 p-4 space-y-3"
                  >
                    <div className="grid
                    grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px]
                        font-semibold uppercase
                        tracking-wider
                        text-muted-foreground/50
                        mb-1.5">
                          Instead of
                        </p>
                        <p className="text-xs
                        text-muted-foreground/60
                        line-through
                        leading-relaxed">
                          {opp.expensive_element}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px]
                        font-semibold uppercase
                        tracking-wider
                        text-muted-foreground/50
                        mb-1.5">
                          Consider
                        </p>
                        <p className="text-xs
                        text-foreground/80
                        leading-relaxed">
                          {opp.lower_cost_alternative}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center
                    justify-between pt-2
                    border-t border-border/20">
                      <span
                        className="text-xs
                        font-semibold"
                        style={{ color: accentHex }}
                      >
                        Save {opp.estimated_saving}
                      </span>
                      <span className={`
                        text-[10px] font-semibold
                        uppercase tracking-wide
                        px-2.5 py-1 rounded-full
                        ${opp.atmosphere_impact === 'low'
                          ? 'bg-green-50 text-green-700'
                          : opp.atmosphere_impact === 'medium'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                        }
                      `}>
                        {opp.atmosphere_impact === 'low'
                          ? '✓ Low impact'
                          : opp.atmosphere_impact === 'medium'
                          ? '~ Some impact'
                          : '⚠ High impact'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}
