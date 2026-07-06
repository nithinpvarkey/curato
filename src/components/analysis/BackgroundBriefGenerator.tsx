'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { analyseCategoryFromMaster } from
  '@/app/actions/analyseCategoryFromMaster'
import { getCategoryConfig } from
  '@/lib/category-config'
import type { MasterStyleOption } from
  '@/types/analysis'

// Single source of truth for background
// generation order — matches CATEGORY_CONFIG
const ALL_CATEGORY_KEYS = [
  'flowers_d_cor',
  'venue_atmosphere',
  'photography_lighting',
  'attire_styling',
  'tablescape',
  'lighting_atmosphere',
] as const

interface BackgroundBriefGeneratorProps {
  analysisId: string
  masterOption: MasterStyleOption
  imageUrls: string[]
  cachedCategoryKeys: string[]
}

export default function BackgroundBriefGenerator({
  analysisId,
  masterOption,
  imageUrls,
  cachedCategoryKeys,
}: BackgroundBriefGeneratorProps) {
  const router = useRouter()
  const startedRef = useRef(false)
  const cancelledRef = useRef(false)

  useEffect(() => {
    // StrictMode double-mount guard
    if (startedRef.current) return
    startedRef.current = true

    const missingKeys = ALL_CATEGORY_KEYS.filter(
      k => !cachedCategoryKeys.includes(k)
    )

    if (missingKeys.length === 0) return

    async function generateSequentially() {
      for (const key of missingKeys) {
        if (cancelledRef.current) break
        const categoryName =
          getCategoryConfig(key).name
        const result =
          await analyseCategoryFromMaster({
            analysisId,
            categoryKey: key,
            categoryName,
            imageUrls,
            masterOption,
          })
        if (cancelledRef.current) break
        if (result.success) {
          router.refresh()
        } else {
          console.warn(
            `[BackgroundBriefGenerator] failed for ${key}`
          )
        }
      }
    }

    generateSequentially()

    return () => {
      cancelledRef.current = true
    }
  }, [
    analysisId,
    masterOption,
    imageUrls,
    cachedCategoryKeys,
    router,
  ])

  return null
}
