'use server'

import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { CATEGORY_FROM_MASTER_SYSTEM_PROMPT } from './categoryFromMasterPrompt'
import { CATEGORY_FROM_MASTER_SCHEMA } from './analysisSchema'
import type {
  MasterStyleOption,
  CategoryAnalysis,
} from '@/types/analysis'
import type { StyleOption } from
  '@/components/analysis/StyleOptionCard'

function validatePatternInsights(
  option: Record<string, unknown>
): boolean | 'bounds' | 'count' {
  const pi = option.pattern_insights
  if (pi === undefined) return true // optional
  if (typeof pi !== 'object' || pi === null) {
    return false
  }
  const p = pi as Record<string, unknown>
  if (
    typeof p.sample_size !== 'number' ||
    !Number.isInteger(p.sample_size)
  ) return false
  if (p.sample_size < 1) return 'bounds'
  if (!Array.isArray(p.insights)) return false
  if (
    p.insights.length < 3 ||
    p.insights.length > 5
  ) return 'count'
  for (const item of p.insights as unknown[]) {
    if (
      typeof item !== 'object' ||
      item === null
    ) return false
    const ins = item as Record<string, unknown>
    if (
      typeof ins.percentage !== 'number' ||
      !Number.isInteger(ins.percentage)
    ) return false
    if (
      ins.percentage < 0 ||
      ins.percentage > 100
    ) return 'bounds'
    if (
      typeof ins.observation !== 'string' ||
      ins.observation.trim() === ''
    ) return false
  }
  return true
}

function validateDesignLanguage(
  option: Record<string, unknown>,
  categoryKey: string
): boolean | 'missing' | 'invalid' {
  const dl = option.design_language
  if (dl === undefined) {
    if (categoryKey === 'flowers_d_cor') {
      return 'missing'
    }
    return true // optional for other categories
  }
  if (typeof dl !== 'object' || dl === null) {
    return 'invalid'
  }
  const d = dl as Record<string, unknown>
  for (const field of [
    'flowers',
    'greenery',
    'texture_shape',
    'vibe',
  ]) {
    const val = d[field]
    if (typeof val !== 'string') return 'invalid'
    if (val.trim().length < 5) return 'invalid'
    if (val.length > 200) return 'invalid'
  }
  if (categoryKey !== 'flowers_d_cor') {
    console.warn(
      '[analyseCategoryFromMaster] design_language present for non-flowers category:',
      categoryKey
    )
  }
  return true
}

function optimiseCategoryImageUrl(
  url: string
): string {
  if (!url.includes('res.cloudinary.com')) {
    return url
  }
  const uploadIndex = url.indexOf('/upload/')
  if (uploadIndex === -1) return url
  const base = url.substring(
    0, uploadIndex + 8
  )
  const rest = url.substring(uploadIndex + 8)
  return `${base}w_800,c_limit,q_auto,f_auto/${rest}`
}

export async function analyseCategoryFromMaster(
  params: {
    analysisId: string
    categoryKey: string
    categoryName: string
    imageUrls: string[]
    masterOption: MasterStyleOption
  }
): Promise<{
  success: boolean
  data?: CategoryAnalysis
  error?: string
}> {

  // SECURITY — verify auth + ownership
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

  const { data: analysis } = await supabase
    .from('analyses')
    .select('id, category_briefs')
    .eq('id', params.analysisId)
    .eq('user_id', user.id)
    .single()

  if (!analysis) {
    return {
      success: false,
      error: 'Unauthorised'
    }
  }

  // VALIDATION — categoryKey must be canonical
  const VALID_CATEGORY_KEYS = [
    'flowers_d_cor',
    'venue_atmosphere',
    'photography_lighting',
    'attire_styling',
    'tablescape',
    'lighting_atmosphere',
  ]
  if (!VALID_CATEGORY_KEYS.includes(
    params.categoryKey
  )) {
    return {
      success: false,
      error: 'Invalid category'
    }
  }

  // CACHE CHECK
  // Key: "{masterOptionId}_{categoryKey}"
  const briefKey =
    `${params.masterOption.id}_${params.categoryKey}`

  const cached =
    (analysis.category_briefs as Record<string, CategoryAnalysis> | null)
      ?.[briefKey]

  if ((cached?.options?.length ?? 0) > 0) {
    const healed = cached!.options.slice(0, 1).map(o => ({
      ...o,
      palette: o.palette.map(c => ({
        ...c,
        hex: c.hex.startsWith('#') ? c.hex : `#${c.hex}`,
      })),
    }))
    return { success: true, data: { ...cached!, options: healed } }
  }

  // GUARDS
  if (params.imageUrls.length < 3) {
    return {
      success: false,
      error: 'At least 3 images required'
    }
  }

  const allCloudinary = params.imageUrls
    .every(url =>
      url.includes('res.cloudinary.com')
    )
  if (!allCloudinary) {
    return {
      success: false,
      error: 'Invalid image source'
    }
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const optimisedUrls = params.imageUrls
      .map(optimiseCategoryImageUrl)

    const imageBlocks = optimisedUrls.map(
      url => ({
        type: 'image' as const,
        source: {
          type: 'url' as const,
          url,
        },
      })
    )

    // Replace [CATEGORY_NAME] placeholder
    // in system prompt with actual category
    const systemPrompt =
      CATEGORY_FROM_MASTER_SYSTEM_PROMPT
        .replace(
          '[CATEGORY_NAME]',
          params.categoryName
        )

    const masterContext =
`MASTER STYLE CHOSEN BY THIS COUPLE:
Name: ${params.masterOption.name}
Description: ${params.masterOption.behavioral_description}
Signal evidence: ${params.masterOption.signal_evidence}
Master palette: ${params.masterOption.master_palette
  .map(c => `${c.name} (${c.hex})`)
  .join(', ')}
${params.masterOption.category_previews[params.categoryKey]
  ? `Category preview for ${params.categoryName}: ${params.masterOption.category_previews[params.categoryKey].label}`
  : ''
}

Now translate this master style into the specific vendor language of ${params.categoryName}. Return exactly 1 StyleOption that expresses this master direction for ${params.categoryName}.`

    const response = await anthropic
      .messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: masterContext,
            },
          ],
        }],
        output_config: {
          format: {
            type: 'json_schema',
            schema: CATEGORY_FROM_MASTER_SCHEMA,
          },
        },
      })
    if (response.stop_reason === 'max_tokens') {
      return {
        success: false,
        error: 'Analysis incomplete — please try again'
      }
    }

    const textBlock = response.content
      .find(b => b.type === 'text')
    if (!textBlock ||
        textBlock.type !== 'text') {
      return {
        success: false,
        error: 'Analysis failed — please try again'
      }
    }

    const parsed = JSON.parse(
      textBlock.text
    ) as {
      category: string
      options: StyleOption[]
    }

    // Soft-validate pattern_insights and design_language
    for (const opt of parsed.options) {
      const piResult = validatePatternInsights(
        opt as unknown as Record<string, unknown>
      )
      if (piResult !== true) {
        const reason =
          piResult === 'bounds'
            ? 'pattern_insights_bounds_invalid'
            : piResult === 'count'
              ? 'pattern_insights_count_invalid'
              : 'pattern_insights_invalid'
        console.error(
          '[analyseCategoryFromMaster] validation failed:',
          reason
        )
        return {
          success: false,
          error:
            'Analysis incomplete — please try again',
        }
      }

      const dlResult = validateDesignLanguage(
        opt as unknown as Record<string, unknown>,
        params.categoryKey
      )
      if (dlResult !== true) {
        const reason =
          dlResult === 'missing'
            ? 'design_language_missing_flowers'
            : 'design_language_invalid'
        console.error(
          '[analyseCategoryFromMaster] validation failed:',
          reason
        )
        return {
          success: false,
          error:
            'Analysis incomplete — please try again',
        }
      }
    }

    const sliced = parsed.options.slice(0, 1)
    if (sliced.length > 0 && sliced[0].palette.length < 3) {
      sliced[0] = {
        ...sliced[0],
        palette: params.masterOption.master_palette
          .map(c => ({ hex: c.hex, name: c.name })),
      }
    }
    if (sliced.length > 0) {
      sliced[0] = {
        ...sliced[0],
        palette: sliced[0].palette.map(c => ({
          ...c,
          hex: c.hex.startsWith('#') ? c.hex : `#${c.hex}`,
        })),
      }
    }
    const result: CategoryAnalysis = {
      category: params.categoryName,
      options: sliced,
    }

    // SAVE via secure RPC
    const { error: saveError } =
      await supabase.rpc(
        'save_category_brief',
        {
          p_analysis_id: params.analysisId,
          p_user_id: user.id,
          p_brief_key: briefKey,
          p_brief: result,
        }
      )

    if (saveError) {
      console.error(
        'Failed to save category brief'
      )
    }

    return { success: true, data: result }

  } catch (err) {
    console.error('[analyseCategoryFromMaster]', err)
    return {
      success: false,
      error: 'Analysis failed — please try again'
    }
  }
}
