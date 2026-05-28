// NO 'use client' — this is a server component
// It fetches its own data — React fires all instances
// simultaneously when wrapped in separate Suspense boundaries
// Total time = slowest category, not sum of all categories

import { triggerCategoryAnalysis } from '@/app/actions/triggerAnalysis'
import type { CategoryAnalysis } from '@/types/analysis'
import StyleOptionCards from './StyleOptionCards'
import type { StyleOption } from './StyleOptionCard'

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
          {result.error ?? 'Analysis failed — please try again'}
        </p>
      </div>
    )
  }

  const data: CategoryAnalysis = result.data

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">
          {data.category}
        </h3>
        <span className="text-xs text-muted-foreground">
          {data.options.length} style options found
        </span>
      </div>

      <StyleOptionCards
        options={data.options as StyleOption[]}
        categoryName={categoryName}
      />
    </div>
  )
}
