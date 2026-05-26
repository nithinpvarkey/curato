// NO directive — this is a shared skeleton component
// Used as the Suspense fallback while CategoryAnalyser loads
// Layout matches the real CategoryAnalyser output exactly
// to prevent layout shift when content streams in

type CategorySkeletonProps = {
  categoryName: string
}

export default function CategorySkeleton({
  categoryName
}: CategorySkeletonProps) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold
              text-card-foreground">
            {categoryName}
          </span>
          <span className="text-xs text-muted-foreground
              animate-pulse">
            Analysing your images...
          </span>
        </div>
        <div className="h-3 w-20 bg-muted rounded
            animate-pulse" />
      </div>

      <div className="space-y-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-3 w-28 bg-muted rounded
                  animate-pulse" />
              <div className="h-4 w-12 bg-muted rounded-full
                  animate-pulse" />
            </div>
            <div className="space-y-1 mb-2">
              <div className="h-2.5 w-full bg-muted rounded
                  animate-pulse" />
              <div className="h-2.5 w-4/5 bg-muted rounded
                  animate-pulse" />
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="w-5 h-5 rounded-full
                    bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-center text-muted-foreground
          mt-3 animate-pulse">
        Finding patterns in your {categoryName.toLowerCase()} images...
      </p>
    </div>
  )
}
