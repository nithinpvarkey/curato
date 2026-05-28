'use client'

import { useEffect, useState } from 'react'

// Returns true if viewport is md+ (768px+).
// Defaults to false (mobile) on first render
// to avoid hydration mismatch in Next.js.
// Switches to correct value after mount.
export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    setIsDesktop(mql.matches)

    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
    }

    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [])

  return isDesktop
}
