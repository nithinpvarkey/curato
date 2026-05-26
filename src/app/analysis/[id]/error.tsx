'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function AnalysisError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Analysis page error:', error)
    }
  }, [error])

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <h2 className="text-xl font-semibold mb-2">
          Something went wrong
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          We could not load your analysis. This may be a temporary issue.
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} variant="default">
            Try again
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            variant="outline"
          >
            Back to dashboard
          </Button>
        </div>
      </div>
    </main>
  )
}
