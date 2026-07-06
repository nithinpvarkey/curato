'use client'

import { useEffect, useState } from 'react'
import { analyseCategoryFromMaster } from
  '@/app/actions/analyseCategoryFromMaster'
import StyleOptionCards from
  './StyleOptionCards'
import CategorySkeleton from
  './CategorySkeleton'
import CategoryWaitState from
  './CategoryWaitState'
import type { CategoryAnalysis } from
  '@/types/analysis'
import type { MasterStyleOption } from
  '@/types/analysis'
import type { StyleOption } from
  './StyleOptionCard'

interface CategoryBriefGeneratorProps {
  analysisId: string
  categoryKey: string
  categoryName: string
  imageUrls: string[]
  masterOption: MasterStyleOption
}

export default function CategoryBriefGenerator({
  analysisId,
  categoryKey,
  categoryName,
  imageUrls,
  masterOption,
}: CategoryBriefGeneratorProps) {

  const [state, setState] = useState<
    | { status: 'loading' }
    | { status: 'success'; data: CategoryAnalysis }
    | { status: 'error'; message: string }
  >({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function generate() {
      setState({ status: 'loading' })

      const result = await
        analyseCategoryFromMaster({
          analysisId,
          categoryKey,
          categoryName,
          imageUrls,
          masterOption,
        })

      if (cancelled) return

      if (result.success && result.data) {
        setState({
          status: 'success',
          data: result.data
        })
      } else {
        setState({
          status: 'error',
          message: result.error ??
            'Analysis failed — please try again'
        })
      }
    }

    generate()

    return () => { cancelled = true }
  }, [
    analysisId,
    categoryKey,
    categoryName,
    masterOption.id
  ])
  // masterOption.id in deps — if couple
  // changes master style selection, this
  // re-generates for the new master option.
  // imageUrls is stable so not needed in deps.

  if (state.status === 'loading') {
    return (
      <CategoryWaitState
        categoryName={categoryName}
        categoryKey={categoryKey}
        palette={masterOption.master_palette}
      />
    )
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-xl border
      border-destructive/20 bg-destructive/5
      p-6 text-center">
        <p className="text-sm font-medium
        text-destructive mb-1">
          Could not generate {categoryName}
        </p>
        <p className="text-xs
        text-muted-foreground">
          {state.message}
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border
    bg-card p-4">
      <div className="flex items-center
      justify-between mb-4">
        <h3 className="text-sm font-semibold
        text-card-foreground">
          {state.data.category}
        </h3>
        <span className="text-xs
        text-muted-foreground">
          {state.data.options.length} style
          options found
        </span>
      </div>
      <StyleOptionCards
        options={
          state.data.options as StyleOption[]
        }
        categoryName={categoryName}
        analysisId={analysisId}
      />
    </div>
  )
}
