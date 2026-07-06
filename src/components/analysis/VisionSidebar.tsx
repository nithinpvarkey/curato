import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { CATEGORY_CONFIG } from
  '@/lib/category-config'

type VisionSidebarProps = {
  analysisId: string
  activeKey:
    | 'master'
    | 'flowers_d_cor'
    | 'venue_atmosphere'
    | 'photography_lighting'
    | 'attire_styling'
    | 'tablescape'
    | 'lighting_atmosphere'
  confidencePct: number
  confidenceLabel: string
  generatingKeys?: string[]
}

export default function VisionSidebar({
  analysisId,
  activeKey,
  confidencePct,
  confidenceLabel,
  generatingKeys,
}: VisionSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col
    w-60 shrink-0 bg-white border-r
    border-border/40 sticky top-0 h-screen
    overflow-y-auto">

      {/* Wordmark */}
      <div className="px-5 pt-6 pb-4
      border-b border-border/30">
        <p className="font-serif text-base
        font-semibold tracking-wide text-foreground
        leading-tight">
          VISIONBOARD AI
        </p>
        <p className="text-[10px] text-muted-foreground/60
        tracking-widest uppercase mt-0.5">
          by Curato
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">

        <Link
          href={`/analysis/${analysisId}/vision`}
          className={`flex items-center gap-3
          px-3 py-2.5 rounded-xl text-sm
          transition-colors select-none
          ${activeKey === 'master'
            ? 'bg-vision-blush-soft text-foreground font-medium'
            : 'text-muted-foreground/50 hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4 flex-shrink-0" />
          Master Vision
        </Link>

        {CATEGORY_CONFIG.map((config) => {
          const isActive = activeKey === config.key
          const isGenerating =
            !isActive &&
            (generatingKeys?.includes(config.key) ?? false)
          return (
            <Link
              key={config.key}
              href={`/analysis/${analysisId}/vision/${config.key}`}
              className={`flex items-center gap-3
              px-3 py-2.5 rounded-xl text-sm
              transition-colors select-none
              ${isActive
                ? 'bg-vision-blush-soft text-foreground font-medium'
                : 'text-muted-foreground/50 hover:text-foreground'
              }`}
            >
              <config.Icon
                className="w-4 h-4 flex-shrink-0"
              />
              <span className="flex-1 truncate">
                {config.name}
              </span>
              {isGenerating && (
                <span
                  className="w-1.5 h-1.5 rounded-full
                  bg-vision-sage animate-pulse shrink-0"
                  aria-label="Generating brief"
                />
              )}
            </Link>
          )
        })}

      </nav>

      {/* Bottom cards */}
      <div className="px-3 pb-5 space-y-3">

        {/* Vision confidence */}
        <div className="rounded-xl border
        border-border/40 bg-[#FDFAF7] p-4 space-y-2">
          <p className="text-[10px] font-semibold
          uppercase tracking-widest
          text-muted-foreground/50">
            Vision confidence
          </p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-semibold
            text-foreground tabular-nums leading-none">
              {confidencePct}%
            </span>
            <span className="text-xs
            text-muted-foreground pb-0.5">
              {confidenceLabel}
            </span>
          </div>
          <div className="h-1.5 bg-muted/30
          rounded-full overflow-hidden">
            <div
              className="h-full rounded-full
              bg-vision-sage"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <Link
            href={`/analysis/${analysisId}`}
            className="block text-[11px]
            text-muted-foreground/60
            hover:text-foreground transition-colors
            underline mt-1"
          >
            View analysis
          </Link>
        </div>

        {/* Tip */}
        <div className="rounded-xl border
        border-vision-blush/40
        bg-vision-blush-soft/40 p-3">
          <p className="text-[10px] font-semibold
          uppercase tracking-widest
          text-vision-sage-deep mb-1">
            Tip
          </p>
          <p className="text-[11px]
          text-foreground/60 leading-relaxed">
            Add more images to any category to
            refine your vision.
          </p>
        </div>

      </div>
    </aside>
  )
}

// NOTE: mobile top bar is intentionally not part of
// this component — each page keeps its own top bar
// for now. Extracting a full shared shell (sidebar +
// mobile bar) is future work once more pages exist.
