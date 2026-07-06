import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  Sparkles, Leaf, Building2, Camera,
  Shirt, Sun, UtensilsCrossed, Music, Video,
  ArrowLeft,
} from 'lucide-react'
import type { MasterStyleOption } from '@/types/analysis'
import type { CategoryAnalysis } from '@/types/analysis'
import VendorBriefsCard from '@/components/analysis/VendorBriefsCard'
import VisionSidebar from '@/components/analysis/VisionSidebar'
import BackgroundBriefGenerator from '@/components/analysis/BackgroundBriefGenerator'
import { getCategoryConfig } from '@/lib/category-config'
import { getAnalysisForUser } from '@/lib/analysis-data'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function PickStylePrompt({ id }: { id: string }) {
  return (
    <main className="min-h-screen bg-[#FDFAF7]
    flex items-center justify-center p-6">
      <div className="rounded-2xl border border-border/50
      bg-white p-8 max-w-sm w-full text-center space-y-4">
        <p className="font-serif text-xl text-foreground">
          Pick your style first
        </p>
        <p className="text-sm text-muted-foreground
        leading-relaxed">
          Choose one of your four style options on the
          analysis page to see your full vision.
        </p>
        <Link
          href={`/analysis/${id}`}
          className="inline-block mt-2 text-sm underline
          text-foreground/70 hover:text-foreground
          transition-colors"
        >
          ← Go to your analysis
        </Link>
      </div>
    </main>
  )
}

const VENDOR_BRIEF_CATEGORY_KEYS = [
  'flowers_d_cor',
  'venue_atmosphere',
  'photography_lighting',
  'attire_styling',
  'tablescape',
  'lighting_atmosphere',
]

const IMAGE_STRIP_CATEGORIES = [
  { key: 'flowers_d_cor',        label: 'Flowers & Décor',       Icon: Leaf,            active: true  },
  { key: 'venue_atmosphere',     label: 'Venue & Atmosphere',    Icon: Building2,       active: false },
  { key: 'photography_lighting', label: 'Photography',           Icon: Camera,          active: false },
  { key: 'attire_styling',       label: 'Attire & Styling',      Icon: Shirt,           active: false },
  { key: 'lighting_atmosphere',  label: 'Lighting & Atmosphere', Icon: Sun,             active: false },
  { key: 'tablescape',           label: 'Tablescape',            Icon: UtensilsCrossed, active: false },
  { key: 'reception',            label: 'Reception',             Icon: Music,           active: false },
  { key: 'video_memory',         label: 'Video & Memory',        Icon: Video,           active: false },
]

function deriveStyleTags(
  name: string,
  palette: { hex: string; name: string }[]
): string[] {
  const FILLER = new Set([
    'and', 'the', 'of', 'with', 'a', 'an', 'in', 'by', 'for',
  ])
  const nameWords = name
    .split(/[\s,\/\-&]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !FILLER.has(w.toLowerCase()))
  const paletteWords = palette
    .map(c => c.name.split(/\s+/)[0])
    .filter(w => w.length > 2)

  const seen = new Set<string>()
  const tags: string[] = []
  for (const word of [...nameWords, ...paletteWords]) {
    const lower = word.toLowerCase()
    if (!seen.has(lower)) {
      seen.add(lower)
      tags.push(word)
    }
    if (tags.length >= 5) break
  }
  return tags
}

export default async function VisionPage({
  params,
}: PageProps) {
  const { id } = await params

  if (!isValidUUID(id)) notFound()

  const { analysis, quizAnswers } =
    await getAnalysisForUser(id)

  const chosenId =
    analysis.chosen_master_option_id as number | null
  const masterResults =
    analysis.master_results as
      { options: MasterStyleOption[] } | null

  if (!chosenId || !masterResults) {
    return <PickStylePrompt id={id} />
  }

  const chosenOption = masterResults.options.find(
    o => o.id === chosenId
  )
  if (!chosenOption) {
    return <PickStylePrompt id={id} />
  }

  const confidence = (chosenOption.confidence ?? 0) as number
  const confidencePct = Math.round(
    confidence <= 1 ? confidence * 100 : confidence
  )
  const confidenceLabel =
    confidencePct >= 75 ? 'Strong'
    : confidencePct >= 50 ? 'Moderate'
    : 'Developing'

  const weddingDateDisplay =
    quizAnswers.wedding_month && quizAnswers.wedding_year
      ? `${quizAnswers.wedding_month} ${quizAnswers.wedding_year}`
      : null

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

  const vendorBriefs = VENDOR_BRIEF_CATEGORY_KEYS.flatMap(categoryKey => {
    const brief =
      categoryBriefs?.[`${chosenId}_${categoryKey}`]
        ?.options?.[0]?.vendor_brief
    if (!brief) return []
    const config = getCategoryConfig(categoryKey)
    return [{
      categoryKey,
      categoryName: config.name,
      emoji: config.emoji,
      inquiry: brief.inquiry,
      vision: brief.vision,
    }]
  })

  return (
    <div className="min-h-screen flex flex-col
    md:flex-row bg-[#FDFAF7]">

      {/* ── MOBILE TOP BAR ── */}
      <div className="flex md:hidden items-center
      justify-between px-4 py-3 bg-white
      border-b border-border/40 sticky top-0 z-20">
        <Link
          href={`/analysis/${id}`}
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
        activeKey="master"
        confidencePct={confidencePct}
        confidenceLabel={confidenceLabel}
        generatingKeys={generatingKeys}
      />

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col
      overflow-x-hidden">

        {/* Background brief generation — invisible */}
        {chosenOption && generatingKeys.length > 0 && (
          <BackgroundBriefGenerator
            analysisId={id}
            masterOption={chosenOption}
            imageUrls={analysis.image_urls ?? []}
            cachedCategoryKeys={cachedCategoryKeys}
          />
        )}

        {/* Header */}
        <header className="bg-white border-b
        border-border/40 px-5 md:px-8 pt-4 pb-4">

          {/* Top row: desktop back + action buttons */}
          <div className="flex items-center
          justify-between mb-3">
            <Link
              href={`/analysis/${id}`}
              className="hidden md:flex items-center
              gap-1.5 text-sm text-muted-foreground
              hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Change your style
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
            <div>
              <h1 className="font-serif text-3xl
              md:text-4xl font-semibold text-foreground
              leading-tight">
                Our Wedding Vision
              </h1>
              <p className="text-sm
              text-muted-foreground mt-1.5
              leading-relaxed">
                Your complete vision, organised
                and ready to plan
              </p>
            </div>

            {/* Right meta — desktop */}
            <div className="hidden sm:flex flex-col
            items-end gap-1 shrink-0 pt-1">
              {weddingDateDisplay && (
                <span className="text-xs
                text-muted-foreground">
                  {weddingDateDisplay}
                </span>
              )}
              <span className="text-xs font-medium
              text-foreground/80">
                Style: {chosenOption.name}
              </span>
            </div>
          </div>

          {/* Right meta — mobile */}
          <div className="flex sm:hidden items-center
          flex-wrap gap-x-3 gap-y-1 mt-3">
            {weddingDateDisplay && (
              <span className="text-xs
              text-muted-foreground">
                {weddingDateDisplay}
              </span>
            )}
            <span className="text-xs font-medium
            text-foreground/80">
              Style: {chosenOption.name}
            </span>
          </div>

        </header>

        {/* Content area */}
        <div className="flex-1 px-5 md:px-8 py-5 space-y-5">

          {/* ── IMAGE STRIP (full width) ── */}
          <div>
            <p className="text-[10px] font-semibold uppercase
            tracking-widest text-muted-foreground/50 mb-3">
              Your Vision Boards
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2
            -mx-5 px-5">
              {IMAGE_STRIP_CATEGORIES.map(
                ({ key, label, Icon, active }) => (
                <div
                  key={key}
                  className={`flex flex-col w-24 shrink-0
                  rounded-xl overflow-hidden border
                  ${active
                    ? 'border-vision-blush ring-2 ring-vision-blush/40'
                    : 'border-border/40'
                  }`}
                >
                  <div className="h-16 bg-vision-cream
                  flex items-center justify-center">
                    <Icon className="w-5 h-5
                    text-muted-foreground/25" />
                  </div>
                  <div className="px-2 py-1.5 bg-white">
                    <p className="text-[11px] font-medium
                    text-foreground/70 leading-tight truncate">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 3-COLUMN GRID ── */}
          <div className="grid grid-cols-1
          lg:grid-cols-3 gap-5">

            {/* ROW 1 — COL 1: Wedding Style */}
            <div className="rounded-2xl border
            border-border/40 bg-white p-5 space-y-3">

              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5
                text-vision-sage-deep" />
                <p className="text-[10px] font-semibold
                uppercase tracking-widest
                text-vision-sage-deep">
                  Wedding Style
                </p>
              </div>

              <h2 className="font-serif text-xl
              text-foreground leading-tight text-center">
                {chosenOption.name}
              </h2>

              {/* TODO: replace with stored descriptor_tags
                  from schema when added (see roadmap) */}
              <div className="flex flex-wrap
              justify-center gap-1.5">
                {deriveStyleTags(
                  chosenOption.name,
                  chosenOption.master_palette
                ).map(tag => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full
                    text-[11px] bg-vision-blush-soft
                    text-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-xs text-foreground/70
              leading-relaxed line-clamp-4">
                {chosenOption.why_your_style}
              </p>

              <div>
                <p className="text-[10px]
                text-muted-foreground/40 uppercase
                tracking-widest mb-1.5">
                  Reserved for your images
                </p>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className="flex-1 h-10
                      rounded-md bg-vision-cream
                      border border-border/30"
                    />
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-2 border-t
              border-border/30">
                <Link
                  href={`/analysis/${id}`}
                  className="text-xs text-muted-foreground/60
                  hover:text-foreground transition-colors"
                >
                  View full aesthetic breakdown →
                </Link>
              </div>

            </div>

            {/* ROW 1 — COL 2: Vendor Briefs */}
            <VendorBriefsCard
              briefs={vendorBriefs}
              weddingDate={weddingDateDisplay}
            />

            {/* ROW 1 — COL 3: Budget Reality Check */}
            <div className="rounded-2xl border
            border-border/40 bg-white p-5
            flex flex-col min-h-[140px]">
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/50 mb-2">
                💰 Budget Reality Check
              </p>
              <div className="flex-1 flex items-center
              justify-center">
                <p className="text-sm
                text-muted-foreground/40 text-center">
                  Coming in next step
                </p>
              </div>
            </div>

            {/* ROW 2 — COL 1: Aesthetic Breakdown */}
            <div className="rounded-2xl border
            border-border/40 bg-white p-5
            flex flex-col min-h-[140px]">
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/50 mb-2">
                🎨 Aesthetic Breakdown
              </p>
              <div className="flex-1 flex items-center
              justify-center">
                <p className="text-sm
                text-muted-foreground/40 text-center">
                  Coming in next step
                </p>
              </div>
            </div>

            {/* ROW 2 — COL 2: Atmosphere & Feel */}
            <div className="rounded-2xl border
            border-border/40 bg-white p-5
            flex flex-col min-h-[140px]">
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/50 mb-2">
                ✨ Atmosphere & Feel
              </p>
              <div className="flex-1 flex items-center
              justify-center">
                <p className="text-sm
                text-muted-foreground/40 text-center">
                  Coming in next step
                </p>
              </div>
            </div>

            {/* ROW 2 — COL 3: Vision Protection */}
            <div className="rounded-2xl border
            border-border/40 bg-white p-5
            flex flex-col min-h-[140px]">
              <p className="text-[10px] font-semibold
              uppercase tracking-widest
              text-muted-foreground/50 mb-2">
                🛡️ Vision Protection
              </p>
              <div className="flex-1 flex items-center
              justify-center">
                <p className="text-sm
                text-muted-foreground/40 text-center">
                  Coming in next step
                </p>
              </div>
            </div>

          </div>

          {/* ── BOTTOM STRIP ── */}
          <div className="rounded-2xl border
          border-border/40 bg-white p-6 flex
          flex-col sm:flex-row items-start
          sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-lg
              text-foreground leading-snug">
                Ready to connect with vendors?
              </h3>
              <p className="text-xs text-muted-foreground
              mt-1 leading-relaxed">
                Share your complete vision brief with
                photographers, florists, and more.
              </p>
            </div>
            <button
              disabled
              title="Coming soon"
              className="shrink-0 px-5 py-2.5 rounded-xl
              border border-border/50 text-sm font-medium
              text-muted-foreground opacity-50
              cursor-not-allowed"
            >
              Share your master vision
            </button>
          </div>

        </div>

      </div>
    </div>
  )
}
