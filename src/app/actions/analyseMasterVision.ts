'use server'

import 'server-only'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type {
  MasterResults,
  MasterStyleOption
} from '@/types/analysis'
import { MASTER_VISION_SYSTEM_PROMPT } from
  './masterVisionPrompt'

const MASTER_VISION_SCHEMA = {
  type: 'object',
  properties: {
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          tagline: { type: 'string' },
          confidence: { type: 'number' },
          signal_evidence: { type: 'string' },
          behavioral_description: {
            type: 'string'
          },
          why_your_style: { type: 'string' },
          master_palette: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                hex: { type: 'string' },
                name: { type: 'string' }
              },
              required: ['hex', 'name'],
              additionalProperties: false
            }
          },
          category_previews: {
            type: 'object',
            properties: {
              flowers_d_cor: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        hex: { type: 'string' },
                        name: { type: 'string' }
                      },
                      required: ['hex','name'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['label','palette'],
                additionalProperties: false
              },
              venue_atmosphere: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        hex: { type: 'string' },
                        name: { type: 'string' }
                      },
                      required: ['hex','name'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['label','palette'],
                additionalProperties: false
              },
              photography_lighting: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        hex: { type: 'string' },
                        name: { type: 'string' }
                      },
                      required: ['hex','name'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['label','palette'],
                additionalProperties: false
              },
              attire_styling: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        hex: { type: 'string' },
                        name: { type: 'string' }
                      },
                      required: ['hex','name'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['label','palette'],
                additionalProperties: false
              },
              tablescape: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        hex: { type: 'string' },
                        name: { type: 'string' }
                      },
                      required: ['hex','name'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['label','palette'],
                additionalProperties: false
              },
              lighting_atmosphere: {
                type: 'object',
                properties: {
                  label: { type: 'string' },
                  palette: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        hex: { type: 'string' },
                        name: { type: 'string' }
                      },
                      required: ['hex','name'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['label','palette'],
                additionalProperties: false
              }
            },
            required: [
              'flowers_d_cor',
              'venue_atmosphere',
              'photography_lighting',
              'attire_styling',
              'tablescape',
              'lighting_atmosphere'
            ],
            additionalProperties: false
          }
        },
        required: [
          'id',
          'name',
          'tagline',
          'confidence',
          'signal_evidence',
          'behavioral_description',
          'why_your_style',
          'master_palette',
          'category_previews'
        ],
        additionalProperties: false
      }
    },
    image_category_map: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          image_index: { type: 'number' },
          categories: {
            type: 'array',
            items: {
              type: 'string',
              enum: [
                'flowers_d_cor',
                'venue_atmosphere',
                'photography_lighting',
                'attire_styling',
                'tablescape',
                'lighting_atmosphere'
              ]
            }
          }
        },
        required: ['image_index', 'categories'],
        additionalProperties: false
      }
    }
  },
  required: ['options', 'image_category_map'],
  additionalProperties: false
} as const

const EXPECTED_CATEGORY_KEYS = [
  'flowers_d_cor',
  'venue_atmosphere',
  'photography_lighting',
  'attire_styling',
  'tablescape',
  'lighting_atmosphere',
] as const

function validateMasterResults(
  result: unknown,
  expectedImageCount: number
): { valid: true } | { valid: false; reason: string } {
  if (
    typeof result !== 'object' ||
    result === null
  ) {
    return {
      valid: false,
      reason: 'result_not_object',
    }
  }

  const r = result as Record<string, unknown>

  // 1. options array length 3-4
  if (!Array.isArray(r.options)) {
    return {
      valid: false,
      reason: 'options_not_array',
    }
  }
  if (
    r.options.length < 3 ||
    r.options.length > 4
  ) {
    return {
      valid: false,
      reason: `options_length_${r.options.length}`,
    }
  }

  // 2. image_category_map length matches
  if (!Array.isArray(r.image_category_map)) {
    return {
      valid: false,
      reason: 'image_category_map_missing',
    }
  }
  if (
    r.image_category_map.length !==
    expectedImageCount
  ) {
    return {
      valid: false,
      reason: 'image_category_map_wrong_length',
    }
  }

  // 3. Per-option checks
  for (let i = 0; i < r.options.length; i++) {
    const opt = r.options[i] as
      Record<string, unknown>

    // 3a. confidence 0-100 integer
    const conf = opt.confidence
    if (
      typeof conf !== 'number' ||
      !Number.isInteger(conf) ||
      conf < 0 ||
      conf > 100
    ) {
      return {
        valid: false,
        reason: `option_${i}_confidence_invalid`,
      }
    }

    // 3b. tagline non-empty, 4-15 words
    const tagline = opt.tagline
    if (
      typeof tagline !== 'string' ||
      tagline.trim() === ''
    ) {
      return {
        valid: false,
        reason: `option_${i}_tagline_invalid`,
      }
    }
    const wordCount = tagline.trim()
      .split(/\s+/).length
    if (wordCount < 4 || wordCount > 15) {
      return {
        valid: false,
        reason: `option_${i}_tagline_invalid`,
      }
    }

    // 3c. category_previews exists
    if (
      typeof opt.category_previews !== 'object' ||
      opt.category_previews === null
    ) {
      return {
        valid: false,
        reason: `option_${i}_category_previews_missing`,
      }
    }
    const cp = opt.category_previews as
      Record<string, unknown>

    // 3c. All 6 keys present
    for (const key of EXPECTED_CATEGORY_KEYS) {
      if (!(key in cp)) {
        return {
          valid: false,
          reason: `option_${i}_missing_${key}`,
        }
      }
    }

    // 3d. Each category has label + palette 3-4
    for (const key of EXPECTED_CATEGORY_KEYS) {
      const cat = cp[key] as
        Record<string, unknown>
      if (
        typeof cat.label !== 'string' ||
        cat.label.trim() === ''
      ) {
        return {
          valid: false,
          reason: `option_${i}_${key}_label_empty`,
        }
      }
      if (
        !Array.isArray(cat.palette) ||
        cat.palette.length < 3 ||
        cat.palette.length > 4
      ) {
        return {
          valid: false,
          reason: `option_${i}_${key}_palette_invalid`,
        }
      }
    }
  }

  // 4. image_category_map entry checks
  const seenIndices = new Set<number>()
  for (
    let i = 0;
    i < r.image_category_map.length;
    i++
  ) {
    const entry = r.image_category_map[i] as
      Record<string, unknown>

    // 4a. image_index valid integer in range
    const idx = entry.image_index
    if (
      typeof idx !== 'number' ||
      !Number.isInteger(idx) ||
      idx < 0 ||
      idx >= expectedImageCount
    ) {
      return {
        valid: false,
        reason: `image_map_${i}_index_invalid`,
      }
    }

    // 4b. categories non-empty array
    if (
      !Array.isArray(entry.categories) ||
      entry.categories.length === 0
    ) {
      return {
        valid: false,
        reason: `image_map_${i}_categories_empty`,
      }
    }

    // 4c. every category in allowlist
    for (const cat of entry.categories as unknown[]) {
      if (
        !(EXPECTED_CATEGORY_KEYS as readonly string[])
          .includes(cat as string)
      ) {
        return {
          valid: false,
          reason: `image_map_${i}_unknown_category`,
        }
      }
    }

    seenIndices.add(idx as number)
  }

  // 5. every index 0..N-1 appears exactly once
  for (let i = 0; i < expectedImageCount; i++) {
    if (!seenIndices.has(i)) {
      return {
        valid: false,
        reason: `image_index_${i}_missing`,
      }
    }
  }

  return { valid: true }
}

function optimiseMasterImageUrl(
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

export async function analyseMasterVision(
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
  const supabase = await createClient()
  const {
    data: { user },
    error: authError
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return {
      success: false,
      error: 'Unauthorised'
    }
  }

  const { data: analysis } = await supabase
    .from('analyses')
    .select('id, master_results')
    .eq('id', params.analysisId)
    .eq('user_id', user.id)
    .single()

  if (!analysis) {
    return {
      success: false,
      error: 'Unauthorised'
    }
  }

  // CACHE CHECK — return if already analysed
  if (
    ((analysis.master_results as MasterResults | null)
      ?.options?.length ?? 0) > 0
  ) {
    return {
      success: true,
      data: analysis.master_results as MasterResults
    }
  }

  // GUARD — minimum images required
  if (params.imageUrls.length < 3) {
    return {
      success: false,
      error: 'At least 3 images required'
    }
  }

  // GUARD — Cloudinary URLs only
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
      .map(optimiseMasterImageUrl)

    const imageBlocks = optimisedUrls.map(
      url => ({
        type: 'image' as const,
        source: {
          type: 'url' as const,
          url,
        },
      })
    )

    const response = await anthropic
      .messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 6000,
        system: MASTER_VISION_SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            ...imageBlocks,
            {
              type: 'text',
              text: `Analyse these ${params.imageUrls.length} wedding inspiration images and identify 3-4 coherent master style directions. Each direction must work across ALL the categories represented in these images.`,
            },
          ],
        }],
        output_config: {
          format: {
            type: 'json_schema',
            schema: MASTER_VISION_SCHEMA,
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

    const result = JSON.parse(
      textBlock.text
    ) as MasterResults

    // VALIDATE — reject partial AI output
    // before touching the database
    const validation = validateMasterResults(
      result,
      params.imageUrls.length
    )
    if (!validation.valid) {
      console.error(
        '[analyseMasterVision] validation failed:',
        validation.reason
      )
      return {
        success: false,
        error:
          'Analysis incomplete — please try again',
      }
    }

    // SAVE via secure RPC function
    const { error: saveError } =
      await supabase.rpc(
        'save_master_results',
        {
          p_analysis_id: params.analysisId,
          p_user_id: user.id,
          p_results: result,
        }
      )

    if (saveError) {
      console.error(
        'Failed to save master results'
      )
    }

    return { success: true, data: result }

  } catch (err) {
    console.error(
      '[analyseMasterVision] error:', err
    )
    return {
      success: false,
      error: 'Analysis failed — please try again'
    }
  }
}

// Suppress unused import warning —
// MasterStyleOption is part of the public
// API surface exported alongside this file
export type { MasterStyleOption }
