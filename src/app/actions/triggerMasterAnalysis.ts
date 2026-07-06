'use server'

import { createClient } from
  '@/lib/supabase/server'
import { analyseMasterVision } from
  '@/app/actions/analyseMasterVision'
import type { MasterResults } from
  '@/types/analysis'

export async function triggerMasterAnalysis(
  params: {
    analysisId: string
    imageUrls: string[]
  }
): Promise<{
  success: boolean
  data?: MasterResults
  error?: string
}> {

  // SECURITY — verify auth + ownership
  // + URL integrity (same 3-layer pattern
  // as old triggerCategoryAnalysis)
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'Unauthorised'
    }
  }

  // Ownership check + fetch stored URLs
  // for cross-validation
  const { data: analysis } = await supabase
    .from('analyses')
    .select('id, image_urls, master_results')
    .eq('id', params.analysisId)
    .eq('user_id', user.id)
    .single()

  if (!analysis) {
    return {
      success: false,
      error: 'Unauthorised'
    }
  }

  // URL INTEGRITY CHECK
  // Every URL passed in must exist in the
  // stored image_urls for this analysis.
  // Prevents arbitrary URL injection.
  const storedUrls: string[] =
    analysis.image_urls ?? []

  const allUrlsValid = params.imageUrls
    .every(url =>
      url.includes('res.cloudinary.com') &&
      storedUrls.includes(url)
    )

  if (!allUrlsValid) {
    return {
      success: false,
      error: 'Invalid image source'
    }
  }

  // CACHE CHECK — return immediately if
  // master results already exist.
  // Prevents redundant API calls on every
  // page load.
  const cached = analysis.master_results as
    MasterResults | null

  if ((cached?.options?.length ?? 0) > 0) {
    return {
      success: true,
      data: cached!
    }
  }

  // No cache — delegate to main analysis
  return analyseMasterVision({
    analysisId: params.analysisId,
    imageUrls: params.imageUrls,
  })
}
