import {
  parseBudgetRange,
  getCategoryBudgetAllocation,
} from '@/lib/budget-utils'
import type { QuizAnswers } from '@/types/analysis'

type Props = {
  palette: { hex: string; name: string }[]
  quizAnswers: QuizAnswers
  categoryParam: string
}

// Flowers-specific wording for now. Promote to a
// dynamic {category} label if this panel pattern
// gets reused on other category pages later.
const BUDGET_LABEL = 'Estimated floral investment'

// Revisit once Step 9 defines real market tiers —
// kept as named constants so the whole scale can
// be swapped out in one place.
const PRIORITY_TIER_THRESHOLDS = {
  low: 10,
  mid: 20,
}

const TIER_SEGMENT_THRESHOLDS = [7.5, 15, 22.5]
const TIER_SEGMENT_LABELS = ['$', '$$', '$$$', '$$$$']
// Sage → deep forest, the same greens already
// used in this wedding's own color palette.
const TIER_SEGMENT_COLORS = [
  '#8FAF8A',
  '#74936F',
  '#587855',
  '#3D5C3A',
]
const TIER_MARKER_BORDER = '#3D5C3A'

function parsePercentageAvg(range: string): number {
  const nums = range.match(/\d+(\.\d+)?/g)
    ?.map(Number)
  if (!nums || nums.length === 0) return 0
  return nums.length === 2
    ? (nums[0] + nums[1]) / 2
    : nums[0]
}

function getPriorityTier(pct: number): {
  label: string
  bg: string
  fg: string
} {
  if (pct < PRIORITY_TIER_THRESHOLDS.low) {
    return {
      label: 'Low Priority',
      bg: 'rgba(143, 175, 126, 0.15)',
      fg: 'rgb(143, 175, 126)',
    }
  }
  if (pct <= PRIORITY_TIER_THRESHOLDS.mid) {
    return {
      label: 'Mid Priority',
      bg: 'rgba(197, 165, 90, 0.15)',
      fg: '#C5A55A',
    }
  }
  return {
    label: 'High Priority',
    bg: 'rgba(220, 38, 38, 0.12)',
    fg: '#dc2626',
  }
}

function getTierSegmentIndex(pct: number): number {
  if (pct < TIER_SEGMENT_THRESHOLDS[0]) return 0
  if (pct < TIER_SEGMENT_THRESHOLDS[1]) return 1
  if (pct < TIER_SEGMENT_THRESHOLDS[2]) return 2
  return 3
}

export function CategoryPaletteBudgetPanel({
  palette,
  quizAnswers,
  categoryParam,
}: Props) {
  const hasQuizData = !!(
    quizAnswers.budget_range ||
    quizAnswers.guest_count
  )
  const totalBudget = parseBudgetRange(
    quizAnswers.budget_range
  )
  const allocation = getCategoryBudgetAllocation(
    totalBudget, categoryParam
  )
  const avgPct = parsePercentageAvg(
    allocation.percentage
  )
  const tier = getPriorityTier(avgPct)
  const segmentIndex = getTierSegmentIndex(avgPct)

  return (
    <div className="rounded-2xl border
    border-border/40 bg-white p-4 flex
    flex-1 min-w-0 overflow-hidden">

      {/* Color Palette */}
      <div className="flex-1 min-w-0">
        <p className="font-serif font-semibold
        text-[15px] text-[#1F1B17] mb-2">
          Color palette
        </p>
        <div className="flex flex-nowrap gap-0.5">
          {palette.slice(0, 5).map((colour) => (
            <div
              key={colour.hex}
              className="flex flex-col
              items-center gap-0.5 flex-shrink-0"
              title={colour.name}
            >
              <div
                className="w-[34px] h-[34px]
                rounded-full border border-black/5"
                style={{
                  backgroundColor: colour.hex,
                }}
              />
              <p className="text-[9px]
              text-[#8E867D]
              font-mono tracking-tight">
                {colour.hex}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-border/40 mx-4" />

      {/* Estimated Floral Investment */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start
        justify-between gap-2 mb-2">
          <p className="font-serif font-semibold
          text-[15px] text-[#1F1B17] min-w-0">
            {BUDGET_LABEL}
          </p>
          {hasQuizData && (
            <span
              className="px-2 py-0.5 rounded-full
              text-[9px] font-semibold
              uppercase tracking-wide
              flex-shrink-0 whitespace-nowrap"
              style={{
                backgroundColor: tier.bg,
                color: tier.fg,
              }}
            >
              {tier.label}
            </span>
          )}
        </div>

        {hasQuizData ? (
          <>
            <p className="text-[18px] font-serif
            font-semibold text-[#1F1B17]
            leading-snug">
              {allocation.formatted}
            </p>

            {/* Tier bar */}
            <div className="mt-2">
              <div className="flex gap-0.5 h-1.5">
                {TIER_SEGMENT_COLORS.map(
                  (color, i) => (
                  <div
                    key={i}
                    className="flex-1 relative
                    rounded-full"
                    style={{
                      backgroundColor: color,
                    }}
                  >
                    {i === segmentIndex && (
                      <div
                        className="absolute
                        top-1/2 left-1/2 w-2 h-2
                        rounded-full bg-white"
                        style={{
                          transform:
                            'translate(-50%, -50%)',
                          border:
                            `1.5px solid ${TIER_MARKER_BORDER}`,
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between
              mt-1.5">
                {TIER_SEGMENT_LABELS.map(
                  (label, i) => (
                  <span
                    key={label}
                    className="text-label"
                    style={{
                      opacity: i === segmentIndex
                        ? 1 : 0.4,
                    }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-small mt-1">
            Add your wedding budget to see an
            estimate for this category.
          </p>
        )}
      </div>

    </div>
  )
}
