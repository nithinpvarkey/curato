import { redirect, notFound } from
  'next/navigation'
import { createClient } from
  '@/lib/supabase/server'
import { Suspense } from 'react'
import { triggerMasterAnalysis } from
  '@/app/actions/triggerMasterAnalysis'
import MasterStyleCards from
  '@/components/analysis/MasterStyleCards'
import Questionnaire from
  '@/components/analysis/Questionnaire'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function validateAndFetchAnalysis(
  id: string
) {
  if (!isValidUUID(id)) { notFound() }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  const { data: analysis, error: dbError } =
    await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

  if (dbError || !analysis) { notFound() }
  return { analysis, user }
}

// ── Skeletons ──────────────────────────────

function MasterAnalysisSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        {[1,2,3,4].map(i => (
          <div
            key={i}
            className="rounded-2xl border
            border-border/40 p-4 space-y-3"
          >
            <div className="h-4 bg-muted/60
            rounded w-3/4" />
            <div className="h-3 bg-muted/40
            rounded w-full" />
            <div className="h-4 bg-muted/40
            rounded-md w-full" />
            <div className="space-y-1.5">
              {[1,2,3].map(j => (
                <div
                  key={j}
                  className="flex gap-2
                  items-center"
                >
                  <div className="w-4 h-4
                  bg-muted/40 rounded-sm
                  flex-shrink-0" />
                  <div className="flex-1 h-2.5
                  bg-muted/40 rounded-sm" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Analysis Content (server component) ───

async function AnalysisContent({
  analysisId,
  imageUrls,
}: {
  analysisId: string
  imageUrls: string[]
}) {
  const result = await triggerMasterAnalysis({
    analysisId,
    imageUrls,
  })

  if (!result.success || !result.data) {
    return (
      <div className="rounded-xl border
      border-destructive/20 bg-destructive/5
      p-6 text-center">
        <p className="text-sm font-medium
        text-destructive mb-1">
          Could not analyse your images
        </p>
        <p className="text-xs
        text-muted-foreground">
          {result.error ??
            'Please try again'}
        </p>
      </div>
    )
  }

  const { options } = result.data

  return (
    <MasterStyleCards
      options={options}
      analysisId={analysisId}
      imageUrls={imageUrls}
    />
  )
}

// ── Wrapper — second auth + ownership ─────

async function AnalysisContentWrapper({
  id,
  userId,
}: {
  id: string
  userId: string
}) {
  const { analysis } =
    await validateAndFetchAnalysis(id)

  const imageUrls: string[] =
    analysis.image_urls ?? []

  return (
    <AnalysisContent
      analysisId={id}
      imageUrls={imageUrls}
    />
  )
}

// ── Page ───────────────────────────────────

export default async function AnalysisPage({
  params,
}: PageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()
  if (authError || !user) {
    redirect('/login')
  }

  if (!isValidUUID(id)) {
    notFound()
  }

  return (
    <main className="min-h-screen
    bg-background">
      <div className="max-w-2xl mx-auto
      px-4 py-8 space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-2xl
          font-semibold text-foreground
          mb-1">
            Your Vision Analysis
          </h1>
          <p className="text-sm
          text-muted-foreground">
            We analysed your images to find
            your wedding style direction.
          </p>
        </div>

        {/* Questionnaire during analysis */}
        <Questionnaire
          analysisId={id}
          userId={user.id}
        />

        {/* Master analysis — streams in */}
        <Suspense
          fallback={<MasterAnalysisSkeleton />}
        >
          <AnalysisContentWrapper
            id={id}
            userId={user.id}
          />
        </Suspense>

      </div>
    </main>
  )
}
