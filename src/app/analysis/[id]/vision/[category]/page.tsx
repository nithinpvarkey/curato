import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Sparkles } from 'lucide-react'
import type { MasterStyleOption } from '@/types/analysis'
import type { CategoryAnalysis } from '@/types/analysis'
import type { PersonalisedResult } from '@/types/analysis'
import VisionSidebar from '@/components/analysis/VisionSidebar'
import CategoryDetailContent from '@/components/analysis/CategoryDetailContent'
import CategoryBriefGenerator from '@/components/analysis/CategoryBriefGenerator'
import { getCategoryConfig } from '@/lib/category-config'
import { getAnalysisForUser, getImagesForCategory } from '@/lib/analysis-data'
import { CategoryImageStrip } from '@/components/analysis/CategoryImageStrip'
import { CategoryPaletteBudgetPanel } from '@/components/analysis/CategoryPaletteBudgetPanel'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string; category: string }>
}

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

// The 4 real product categories — must match
// VENDOR_BRIEF_CATEGORY_KEYS in vision/page.tsx
// and the REAL_CATEGORIES keys in VisionSidebar.
const VALID_CATEGORY_KEYS = [
  'flowers_d_cor',
  'venue_atmosphere',
  'photography_lighting',
  'attire_styling',
  'tablescape',
  'lighting_atmosphere',
] as const

type ValidCategoryKey = typeof VALID_CATEGORY_KEYS[number]

function isValidCategoryKey(
  value: string
): value is ValidCategoryKey {
  return (VALID_CATEGORY_KEYS as readonly string[]).includes(value)
}

export default async function CategoryPage({
  params,
}: PageProps) {
  const { id, category } = await params

  if (!isValidUUID(id)) notFound()
  if (!isValidCategoryKey(category)) notFound()

  const categoryParam = category

  const { analysis, quizAnswers } =
    await getAnalysisForUser(id)

  const chosenId =
    analysis.chosen_master_option_id as number | null
  const masterResults =
    analysis.master_results as
      { options: MasterStyleOption[] } | null

  if (!chosenId || !masterResults) {
    redirect(`/analysis/${id}/vision`)
  }

  const chosenOption = masterResults.options.find(
    o => o.id === chosenId
  )
  if (!chosenOption) {
    redirect(`/analysis/${id}/vision`)
  }

  const weddingDateDisplay =
    quizAnswers.wedding_month && quizAnswers.wedding_year
      ? `${quizAnswers.wedding_month} ${quizAnswers.wedding_year}`
      : null

  const confidence = (chosenOption.confidence ?? 0) as number
  const confidencePct = Math.round(
    confidence <= 1 ? confidence * 100 : confidence
  )
  const confidenceLabel =
    confidencePct >= 75 ? 'Strong'
    : confidencePct >= 50 ? 'Moderate'
    : 'Developing'

  const categoryBriefs =
    analysis.category_briefs as
      Record<string, CategoryAnalysis> | null

  const cachedCategoryKeys = chosenId
    ? Object.keys(categoryBriefs ?? {})
        .filter(k => k.startsWith(`${chosenId}_`))
        .map(k => k.replace(`${chosenId}_`, ''))
    : []

  const ALL_CATEGORY_KEYS = [
    'flowers_d_cor',
    'venue_atmosphere',
    'photography_lighting',
    'attire_styling',
    'tablescape',
    'lighting_atmosphere',
  ]
  const generatingKeys = chosenId
    ? ALL_CATEGORY_KEYS.filter(
        k => !cachedCategoryKeys.includes(k)
      )
    : []

  const cachedBrief =
    categoryBriefs?.[`${chosenId}_${categoryParam}`]

  const personalisedResult =
    (analysis.personalised_results as
      Record<string, PersonalisedResult> | null)
      ?.[categoryParam] ?? null

  const categoryConfig = getCategoryConfig(categoryParam)
  const categoryImages = getImagesForCategory(
    analysis, categoryParam
  )
  const paletteTags = chosenOption.master_palette
    .slice(0, 5)
    .map(c => c.name)

  return (
    <div className="min-h-screen flex flex-col
    md:flex-row bg-[#FDFAF7]">

      {/* ── MOBILE TOP BAR ── */}
      <div className="flex md:hidden items-center
      justify-between px-4 py-3 bg-white
      border-b border-border/40 sticky top-0 z-20">
        <Link
          href={`/analysis/${id}/vision`}
          className="flex items-center gap-1.5 text-sm
          text-muted-foreground hover:text-foreground
          transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>
        <span className="font-serif text-sm
        font-semibold tracking-wide text-foreground">
          VISIONBOARD AI
        </span>
        {/* balance spacer */}
        <div className="w-12" />
      </div>

      {/* ── SIDEBAR ── */}
      <VisionSidebar
        analysisId={id}
        activeKey={categoryParam}
        confidencePct={confidencePct}
        confidenceLabel={confidenceLabel}
        generatingKeys={generatingKeys}
      />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col
      overflow-x-hidden">

        {/* Header */}
        <header className="px-5 md:px-8 pt-4 pb-3">

          {/* Top row: desktop back + action buttons */}
          <div className="flex items-center
          justify-between mb-3">
            <Link
              href={`/analysis/${id}/vision`}
              className="hidden md:flex items-center
              gap-1.5 text-sm text-muted-foreground
              hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Master Vision
            </Link>
            <div className="flex items-center gap-2
            ml-auto">
              <button
                disabled
                title="Coming soon"
                className="px-4 py-2 rounded-xl border
                border-border/50 text-xs font-medium
                text-muted-foreground opacity-50
                cursor-not-allowed"
              >
                Share with vendors
              </button>
              <button
                disabled
                title="Coming soon"
                className="px-4 py-2 rounded-xl border
                border-border/50 text-xs font-medium
                text-muted-foreground opacity-50
                cursor-not-allowed"
              >
                Export PDF
              </button>
            </div>
          </div>

          {/* Heading row */}
          <div className="flex items-start
          justify-between gap-4">
            <div className="flex items-start
            gap-3 flex-1">

              {/* Circular category icon */}
              <div
                className="w-12 h-12 rounded-full
                flex items-center justify-center
                shrink-0 mt-1"
                style={{
                  backgroundColor:
                    'rgba(143, 175, 126, 0.15)',
                }}
              >
                <categoryConfig.Icon
                  className="w-6 h-6"
                  style={{ color: 'rgb(143, 175, 126)' }}
                  strokeWidth={1.5}
                />
              </div>

              {/* Title + tagline + tags */}
              <div className="flex-1 min-w-0">
                <h1 className="text-h1">
                  {categoryConfig.name}
                </h1>
                {chosenOption.tagline && (
                  <p className="mt-2 font-serif italic
                  text-[15px] text-[#4F4A45]
                  leading-snug">
                    {chosenOption.tagline}
                  </p>
                )}
                <div className="flex flex-wrap
                gap-1.5 mt-2">
                  {paletteTags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1
                      rounded-full bg-vision-blush/40
                      text-[12px] font-medium
                      text-[#5C544D] tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Right meta — desktop */}
            <div className="hidden sm:flex
            items-start gap-7 flex-shrink-0
            mt-10">

              {/* Meta group 1: Wedding date */}
              {weddingDateDisplay && (
                <div className="flex items-start
                gap-2.5">
                  <Calendar
                    className="w-3.5 h-3.5 mt-0.5
                    flex-shrink-0"
                    style={{ color: '#C5A55A' }}
                    strokeWidth={1.5}
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px]
                    font-medium text-[#8E867D]
                    leading-tight">
                      Wedding date
                    </span>
                    <span className="text-[14px]
                    font-medium text-[#1F1B17]
                    mt-0.5 leading-tight">
                      {weddingDateDisplay}
                    </span>
                  </div>
                </div>
              )}

              {/* Meta group 2: Style summary */}
              <div className="flex items-start
              gap-2.5">
                <Sparkles
                  className="w-3.5 h-3.5 mt-0.5
                  flex-shrink-0"
                  style={{ color: '#C5A55A' }}
                  strokeWidth={1.5}
                />
                <div className="flex flex-col">
                  <span className="text-[11px]
                  font-medium text-[#8E867D]
                  leading-tight">
                    Style summary
                  </span>
                  <span
                    className="text-[13px]
                    font-medium text-[#1F1B17]
                    mt-0.5 leading-snug"
                    style={{ maxWidth: '140px' }}
                  >
                    {chosenOption.name}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Right meta — mobile */}
          <div className="sm:hidden mt-4
          flex flex-col gap-2.5">

            {/* Meta group 1: Wedding date */}
            {weddingDateDisplay && (
              <div className="flex items-start
              gap-2.5">
                <Calendar
                  className="w-3.5 h-3.5 mt-0.5
                  flex-shrink-0"
                  style={{ color: '#C5A55A' }}
                  strokeWidth={1.5}
                />
                <div className="flex flex-col">
                  <span className="text-[11px]
                  font-medium text-[#8E867D]
                  leading-tight">
                    Wedding date
                  </span>
                  <span className="text-[14px]
                  font-medium text-[#1F1B17]
                  mt-0.5 leading-tight">
                    {weddingDateDisplay}
                  </span>
                </div>
              </div>
            )}

            {/* Meta group 2: Style summary */}
            <div className="flex items-start
            gap-2.5">
              <Sparkles
                className="w-3.5 h-3.5 mt-0.5
                flex-shrink-0"
                style={{ color: '#C5A55A' }}
                strokeWidth={1.5}
              />
              <div className="flex flex-col">
                <span className="text-[11px]
                font-medium text-[#8E867D]
                leading-tight">
                  Style summary
                </span>
                <span className="text-[13px]
                font-medium text-[#1F1B17]
                mt-0.5 leading-snug">
                  {chosenOption.name}
                </span>
              </div>
            </div>

          </div>

        </header>

        {/* Image strip + palette/budget panel */}
        <div className="px-5 md:px-8 mt-5
        flex flex-col md:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <CategoryImageStrip
              images={categoryImages}
              categoryName={categoryConfig.name}
            />
          </div>
          {cachedBrief && (
            <CategoryPaletteBudgetPanel
              palette={cachedBrief.options[0].palette}
              quizAnswers={quizAnswers}
              categoryParam={categoryParam}
            />
          )}
        </div>

        {/* Content area */}
        <div className="flex-1 px-5 md:px-8 py-5">
          {cachedBrief ? (
            <CategoryDetailContent
              option={cachedBrief.options[0]}
              categoryParam={categoryParam}
              quizAnswers={quizAnswers}
              personalisedResult={personalisedResult}
            />
          ) : (
            <CategoryBriefGenerator
              analysisId={id}
              categoryKey={categoryParam}
              categoryName={categoryConfig.name}
              imageUrls={analysis.image_urls ?? []}
              masterOption={chosenOption}
            />
          )}
        </div>

      </div>
    </div>
  )
}
