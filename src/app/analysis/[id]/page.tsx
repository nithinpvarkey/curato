import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'
import CategoryAnalyser from '@/components/analysis/CategoryAnalyser'
import CategorySkeleton from '@/components/analysis/CategorySkeleton'

// Force dynamic rendering on every request
// Prevents Next.js from statically caching
// user-specific analysis pages
// Critical: without this, cross-user data
// leakage is possible via edge/CDN caching
export const dynamic = 'force-dynamic'

// This type is required in Next.js 15 — params is a Promise
type PageProps = {
  params: Promise<{ id: string }>
}

// UUID v4 format validator
// Validates format BEFORE hitting the database
// Prevents malformed requests, log pollution,
// and potential query edge cases
// No external library needed — pure regex
function isValidUUID(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

// This function runs BEFORE streaming starts
// It validates auth and ownership server-side
// notFound() and redirect() here work correctly
// because no HTML has been sent to the browser yet
async function validateAndFetchAnalysis(id: string) {
  // SECURITY CHECK 0 — validate UUID format first
  // Prevents malformed IDs from hitting the database
  // notFound() here is safe — no streaming has started
  if (!isValidUUID(id)) {
    notFound()
  }

  const supabase = await createClient()

  // SECURITY CHECK 1 — verify user is authenticated
  // getUser() sends a request to Supabase Auth server
  // every time to revalidate the token — safe to trust
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  // SECURITY CHECK 2 — verify ownership
  // scope query to BOTH id AND user.id
  // prevents authenticated users accessing
  // other users' analyses by guessing UUIDs
  const { data: analysis, error: dbError } =
    await supabase
      .from('analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

  if (dbError || !analysis) {
    notFound()
  }

  return { analysis, user }
}

// Skeleton component for Suspense fallback
// Used INSIDE the page — not as a route-level loading.tsx
function AnalysisSkeleton() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="h-8 w-48 bg-muted rounded-lg
          animate-pulse mb-2" />
      <div className="h-4 w-64 bg-muted rounded
          animate-pulse mb-8" />
      <div className="flex gap-2 mb-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-9 w-24 bg-muted
              rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="rounded-xl border
              bg-card overflow-hidden">
            <div className="h-28 bg-muted animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-32 bg-muted
                  rounded animate-pulse" />
              <div className="h-3 w-full bg-muted
                  rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <p className="text-center text-sm
          text-muted-foreground animate-pulse mt-6">
        Reading your images and finding your patterns...
      </p>
    </div>
  )
}

// Async component that renders the actual content
// Wrapped in Suspense inside the page
// Streaming happens HERE — after auth is validated
async function AnalysisContent({ id }: { id: string }) {
  const { analysis } = await validateAndFetchAnalysis(id)

  // Parse image_urls from the analysis row
  // This is the array of Cloudinary URLs stored in Supabase
  const imageUrls: string[] = analysis.image_urls ?? []

  // For now we treat all images as one category
  // In Task 7.5 we will split by category groups
  // This validates the parallel streaming pattern works
  const categories = [
    { name: 'Flowers & Décor', urls: imageUrls },
  ]

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-2">
        Your Vision Analysis
      </h1>
      <p className="text-muted-foreground text-sm mb-8">
        Each category is analysed simultaneously —
        results stream in as they complete.
      </p>

      <div className="space-y-6">
        {categories.map(category => (
          <Suspense
            key={category.name}
            fallback={
              <CategorySkeleton
                categoryName={category.name}
              />
            }
          >
            <CategoryAnalyser
              analysisId={id}
              categoryName={category.name}
              imageUrls={category.urls}
            />
          </Suspense>
        ))}
      </div>
    </div>
  )
}

// Main page component
// validateAndFetchAnalysis runs here FIRST
// before any JSX or streaming begins
// This ensures notFound() and redirect() work correctly
export default async function AnalysisPage(
  { params }: PageProps
) {
  // Await params — required in Next.js 15
  const { id } = await params

  // Run validation BEFORE streaming starts
  // If user is not authenticated → redirect('/login')
  // If analysis not found or not owned → notFound()
  // Both work correctly here because no HTML sent yet
  await validateAndFetchAnalysis(id)

  // Only reaches here if validation passed
  // Now safe to stream the UI with Suspense
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<AnalysisSkeleton />}>
        <AnalysisContent id={id} />
      </Suspense>
    </main>
  )
}
