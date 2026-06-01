'use server'

import { createClient } from '@/lib/supabase/server'
import { analyseCategory } from '@/app/actions/analyseCategory'
import type { AnalysisResult } from '@/types/analysis'

// Cloudinary URL optimizer
// Inserts w_800,c_limit,q_auto transformation before version
// Reduces vision tokens by ~83% — same visual content, fraction of the cost
// Example:
// Input:  .../upload/v1779728008/filename.jpg
// Output: .../upload/w_800,c_limit,q_auto/v1779728008/filename.jpg
function optimiseCloudinaryUrl(url: string): string {
  // Only transform Cloudinary URLs — safety check
  if (!url.startsWith('https://res.cloudinary.com')) {
    return url
  }
  // Insert transformation after /upload/
  return url.replace(
    '/upload/',
    '/upload/w_800,c_limit,q_auto/'
  )
}

export async function triggerCategoryAnalysis(params: {
  analysisId: string
  categoryName: string
  imageUrls: string[]
}): Promise<AnalysisResult> {

  // SECURITY CHECK 1 — verify user is authenticated
  // getUser() hits Supabase Auth server every time — safe to trust
  const supabase = await createClient()
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorised' }
  }

  // SECURITY CHECK 2 — verify analysis belongs to this user
  // Prevents authenticated users from triggering analysis
  // on another user's analysisId
  const { data: analysis, error: dbError } = await supabase
    .from('analyses')
    .select('id, user_id, image_urls')
    .eq('id', params.analysisId)
    .eq('user_id', user.id)
    .single()

  if (dbError || !analysis) {
    return { success: false, error: 'Analysis not found' }
  }

  // SECURITY CHECK 3 — validate imageUrls
  // Never trust client-provided URLs
  // Only allow Cloudinary URLs from this analysis
  // Cross-check against URLs stored in the DB
  const storedUrls: string[] = analysis.image_urls ?? []
  const allUrlsValid = params.imageUrls.every(url =>
    url.startsWith('https://res.cloudinary.com') &&
    storedUrls.includes(url)
  )

  if (!allUrlsValid || params.imageUrls.length < 3) {
    return { success: false, error: 'Invalid image URLs' }
  }

  // CACHE CHECK — if results already exist
  // for this category, return them immediately
  // Prevents unnecessary API calls on every
  // page load and saves API credits
  const categoryKey = params.categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')

  const { data: existingAnalysis } =
    await supabase
      .from('analyses')
      .select('category_results')
      .eq('id', params.analysisId)
      .eq('user_id', user.id)
      .single()

  if (
    existingAnalysis?.category_results?.[categoryKey]
      ?.options?.length > 0
  ) {
    return {
      success: true,
      data: existingAnalysis!
        .category_results[categoryKey]
    }
  }

  // No cached result — proceed with API call

  // OPTIMISE — resize images before sending to Claude
  // Inserts w_800,c_limit,q_auto into Cloudinary URL
  // Reduces vision tokens by ~83% — faster and cheaper
  const optimisedUrls = params.imageUrls.map(optimiseCloudinaryUrl)

  // CALL — trigger the Claude AI analysis
  return analyseCategory({
    categoryName: params.categoryName,
    imageUrls: optimisedUrls,
    analysisId: params.analysisId,
    userId: user.id,
  })
}
