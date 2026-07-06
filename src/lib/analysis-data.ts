import { cache } from 'react'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type {
  AnalysisRow,
  QuizAnswers,
  MasterResults,
} from '@/types/analysis'

type AnalysisForUser = {
  analysis: AnalysisRow
  quizAnswers: QuizAnswers
}

// Returns the couple's uploaded image URLs that are
// tagged for a given category in image_category_map.
// Returns [] gracefully for old analyses without the
// field, missing image_urls, or no matching tags.
export function getImagesForCategory(
  analysis: AnalysisRow,
  categoryKey: string
): string[] {
  const masterResults =
    analysis.master_results as MasterResults | null
  if (!masterResults?.image_category_map) return []
  const imageUrls =
    analysis.image_urls as string[] | null
  if (!imageUrls) return []

  const matchingIndices = masterResults
    .image_category_map
    .filter(entry =>
      entry.categories.includes(categoryKey)
    )
    .map(entry => entry.image_index)

  return matchingIndices
    .map(idx => imageUrls[idx])
    .filter(
      (url): url is string => typeof url === 'string'
    )
}

// Shared auth + ownership + data fetch for the master
// vision page and category detail pages. Wrapped in
// React's cache() to dedupe repeat calls within a
// single server request.
//
// NOTE: cache() only dedupes within ONE request — it
// does not persist across navigations between sidebar
// categories (each is a separate request). The bigger
// cross-navigation win would require a layout.tsx that
// fetches once and shares via context — deferred to a
// future task.
export const getAnalysisForUser = cache(
  async (id: string): Promise<AnalysisForUser> => {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) redirect('/login')

    const { data: analysis, error: dbError } =
      await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

    if (dbError || !analysis) notFound()

    const { data: quizData } = await supabase
      .from('quiz_responses')
      .select('answers')
      .eq('analysis_id', id)
      .eq('respondent', 'partner_a')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const quizAnswers: QuizAnswers =
      (quizData?.answers as QuizAnswers) ?? {
        wedding_month: null,
        wedding_year: null,
        guest_count: null,
        budget_range: null,
      }

    return {
      analysis: analysis as AnalysisRow,
      quizAnswers,
    }
  }
)
