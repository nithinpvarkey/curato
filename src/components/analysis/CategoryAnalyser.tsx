// NO 'use client' — this is a server component
// It fetches its own data — React fires all instances
// simultaneously when wrapped in separate Suspense boundaries
// Total time = slowest category, not sum of all categories

import { triggerCategoryAnalysis } from '@/app/actions/triggerAnalysis'
import type { CategoryAnalysis } from '@/types/analysis'

type CategoryAnalyserProps = {
  analysisId: string
  categoryName: string
  imageUrls: string[]
}

export default async function CategoryAnalyser({
  analysisId,
  categoryName,
  imageUrls,
}: CategoryAnalyserProps) {

  const result = await triggerCategoryAnalysis({
    analysisId,
    categoryName,
    imageUrls,
  })

  // Handle failure gracefully
  // Show a per-category error — does not break other categories
  if (!result.success || !result.data) {
    return (
      <div className="rounded-xl border border-destructive/20
          bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive mb-1">
          Could not analyse {categoryName}
        </p>
        <p className="text-xs text-muted-foreground">
          {'Analysis failed — please try again'}
        </p>
      </div>
    )
  }

  const data: CategoryAnalysis = result.data

  // Placeholder render — shows raw data for now
  // Will be replaced in Tasks 7.5–7.8 with full UI
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-card-foreground">
          {data.category}
        </h3>
        <span className="text-xs text-muted-foreground">
          {data.options.length} style options found
        </span>
      </div>

      <div className="space-y-2">
        {data.options.map(option => (
          <div
            key={option.id}
            className="rounded-lg bg-muted/50 p-3"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-medium
                  text-foreground">
                {option.name}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full
                font-medium ${
                  option.confidence === 'high'
                    ? 'bg-green-100 text-green-700'
                    : option.confidence === 'medium'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                {option.confidence}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {option.signal_evidence}
            </p>
            <div className="flex gap-1 mt-2">
              {option.palette.map(color => (
                <div
                  key={color.hex}
                  className="w-5 h-5 rounded-full border
                      border-border flex-shrink-0"
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
