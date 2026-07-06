'use client'

import { useState } from 'react'
import { ClipboardList, ChevronDown } from 'lucide-react'
import { getCategoryConfig } from '@/lib/category-config'

type VendorBrief = {
  categoryKey: string
  categoryName: string
  emoji: string
  inquiry: string
  vision: string
}

type VendorBriefsCardProps = {
  briefs: VendorBrief[]
  weddingDate: string | null
}

const COLLAPSED_COUNT = 3
const EXPAND_THRESHOLD = 4

export default function VendorBriefsCard({
  briefs,
  weddingDate,
}: VendorBriefsCardProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  const resolveDate = (text: string) =>
    text.replaceAll(
      '[WEDDING_DATE]',
      weddingDate ?? 'our wedding date'
    )

  const handleCopy = (brief: VendorBrief, resolvedInquiry: string) => {
    navigator.clipboard.writeText(resolvedInquiry)
    setCopiedKey(brief.categoryKey)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const showExpandRow = briefs.length > EXPAND_THRESHOLD
  const visibleBriefs = showExpandRow && !expanded
    ? briefs.slice(0, COLLAPSED_COUNT)
    : briefs

  return (
    <div className="rounded-2xl border border-border/40 bg-white p-5 flex flex-col">

      <div className="flex items-center gap-1.5 mb-3">
        <ClipboardList className="w-3.5 h-3.5 text-vision-sage-deep" />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
          Vendor Briefs
        </p>
      </div>

      {briefs.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground/40">
            No briefs generated yet — open categories on your analysis page.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {visibleBriefs.map(brief => {
              const Icon = getCategoryConfig(brief.categoryKey).Icon
              const resolvedInquiry = resolveDate(brief.inquiry)
              return (
                <div
                  key={brief.categoryKey}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-vision-cream/40 p-3"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-full bg-vision-sage/15 shrink-0">
                    <Icon
                      className="w-4 h-4 text-vision-sage-deep"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground/85 truncate">
                      {brief.categoryName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {resolvedInquiry}
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(brief, resolvedInquiry)}
                    className="shrink-0 px-3 py-1.5 rounded-lg border border-border/50 bg-white text-xs font-medium text-foreground/70 hover:bg-vision-blush-soft transition-colors"
                  >
                    {copiedKey === brief.categoryKey ? 'Copied!' : 'Copy brief'}
                  </button>
                </div>
              )
            })}
          </div>

          {showExpandRow && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="mt-3 flex items-center justify-between w-full rounded-xl border border-border/30 bg-white px-3 py-2.5 text-sm text-foreground/70 hover:bg-vision-cream/30 transition-colors"
              aria-expanded={expanded}
            >
              <span>
                {expanded
                  ? 'Show less'
                  : `See all vendor briefs (${briefs.length})`}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-muted-foreground transition-transform ${
                  expanded ? 'rotate-180' : ''
                }`}
                strokeWidth={1.5}
              />
            </button>
          )}
        </>
      )}
    </div>
  )
}
