'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { StyleOption } from
  '@/components/analysis/StyleOptionCard'
import type {
  QuizAnswers,
  PersonalisedResult
} from '@/types/analysis'
import {
  parseBudgetRange,
  parseGuestCount,
  getCategoryBudgetAllocation
} from '@/lib/budget-utils'

const PERSONALISATION_SCHEMA = {
  type: 'object',
  properties: {
    personalised_budget_items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string' },
          adjusted_range: { type: 'string' },
          achievable: { type: 'boolean' },
          note: { type: 'string' }
        },
        required: [
          'item','adjusted_range',
          'achievable','note'
        ],
        additionalProperties: false
      }
    },
    budget_gap_summary: { type: 'string' },
    top_priority_cuts: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          cut_this: { type: 'string' },
          keep_this: { type: 'string' },
          saving: { type: 'string' },
          atmosphere_impact: {
            type: 'string',
            enum: ['low','medium','high']
          }
        },
        required: [
          'cut_this','keep_this',
          'saving','atmosphere_impact'
        ],
        additionalProperties: false
      }
    },
    booking_dates: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          action: { type: 'string' },
          target_date: { type: 'string' },
          months_away: { type: 'number' }
        },
        required: [
          'action','target_date','months_away'
        ],
        additionalProperties: false
      }
    },
    achievability_score: {
      type: 'string',
      enum: ['full','partial','stretch']
    },
    curato_advice: { type: 'string' }
  },
  required: [
    'personalised_budget_items',
    'budget_gap_summary',
    'top_priority_cuts',
    'booking_dates',
    'achievability_score',
    'curato_advice'
  ],
  additionalProperties: false
} as const

export async function personaliseCategory(params: {
  analysisId: string
  optionId: number
  categoryName: string
  option: StyleOption
  quizAnswers: QuizAnswers
}): Promise<{
  success: boolean
  data?: PersonalisedResult
  error?: string
}> {

  // SECURITY — verify auth + ownership
  const supabase = await createClient()
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()
  if (authError || !user) {
    return { success: false, error: 'Unauthorised' }
  }

  const { data: ownerCheck } = await supabase
    .from('analyses')
    .select('id, personalised_results')
    .eq('id', params.analysisId)
    .eq('user_id', user.id)
    .single()
  if (!ownerCheck) {
    return { success: false, error: 'Unauthorised' }
  }

  // CACHE CHECK
  const cacheKey =
    `${params.categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]/g,'_')
      .replace(/_+/g,'_')
      .replace(/^_|_$/g,'')}_${params.optionId}`

  const cached =
    ownerCheck.personalised_results?.[cacheKey]
  if (cached) {
    return {
      success: true,
      data: cached as PersonalisedResult
    }
  }

  // CALCULATE budget context
  const categoryKey = params.categoryName
    .toLowerCase()
    .replace(/[^a-z0-9]/g,'_')
    .replace(/_+/g,'_')
    .replace(/^_|_$/g,'')

  const totalBudget = parseBudgetRange(
    params.quizAnswers.budget_range
  )
  const guestCount = parseGuestCount(
    params.quizAnswers.guest_count
  )
  const allocation = getCategoryBudgetAllocation(
    totalBudget, categoryKey
  )

  const weddingDateContext =
    params.quizAnswers.wedding_month &&
    params.quizAnswers.wedding_year
      ? `${params.quizAnswers.wedding_month} ${params.quizAnswers.wedding_year}`
      : 'not specified'

  const budgetDisplay =
    params.quizAnswers.budget_range ??
    'approximately $25,000'
  const guestDisplay =
    params.quizAnswers.guest_count ??
    'approximately 100 guests'

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const systemPrompt =
`You are Curato's Wedding Budget Analyst.

Your job is to take a couple's selected wedding
style direction and produce a PERSONALISED budget
breakdown calibrated to their specific situation.

THEIR SITUATION:
- Total wedding budget: ${budgetDisplay}
- Guest count: ${guestDisplay}
- Wedding date: ${weddingDateContext}
- Realistic ${params.categoryName} budget:
  ${allocation.formatted}
  (${allocation.percentage} of total budget)

CRITICAL RULES:
- All costs MUST be calibrated to
  ${guestCount} guests
- All costs MUST reflect what is achievable
  within ${allocation.formatted}
- Use real 2025 US market rates only
- Be completely honest: if this style direction
  cannot be achieved within their category budget,
  say so clearly and show what IS achievable
- achievability_score rules:
  "full" = style fully achievable within budget
  "partial" = achievable with modifications
  "stretch" = budget needs significant increase
- budget_gap_summary: exactly 1 sentence.
  State the gap honestly if one exists.
  Example: "Your ${params.categoryName} budget of
  ${allocation.formatted} covers approximately
  30% of this direction's full cost — here is
  what you can achieve within your budget."
- booking_dates: calculate from their wedding date
  (${weddingDateContext}). Today is June 2026.
  Format target_date as "Month Year" e.g.
  "October 2026". months_away = months between
  today (June 2026) and that target date.
- top_priority_cuts: exactly 2 items
- curato_advice: exactly 2-3 sentences.
  Written as a trusted wedding planner
  speaking directly to this couple.
  Must start with "At [X] guests and a
  [budget_range] budget, ...".
  States what to prioritise and why,
  grounded in their specific atmosphere
  must-protects. Never generic. Never
  mentions AI or Curato by name.
  Sounds like an experienced human advisor
  who has personally reviewed their images.
- personalised_budget_items: exactly 4-5 items

EVERY NUMBER must be specific to
${guestCount} guests.
NO GENERIC ADVICE.`

    const userPrompt =
`Style direction: ${params.option.name}

Description: ${params.option.behavioral_description}

Original budget items (recalibrate these for
${guestCount} guests and ${allocation.formatted}
budget):
${params.option.budget_items
  .map(b => `- ${b.item}: ${b.range}`)
  .join('\n')}

Atmosphere must-protect (never sacrifice these):
${params.option.atmosphere_protection
  .protect_first.join(', ')}

Can be reduced:
${params.option.atmosphere_protection
  .reduce_first.join(', ')}

Existing savings opportunities:
${params.option.savings_opportunities
  .map(s => `- Replace ${s.expensive_element}
    with ${s.lower_cost_alternative}
    (save ${s.estimated_saving},
    ${s.atmosphere_impact} impact)`)
  .join('\n')}

Produce personalised budget for
${guestCount} guests within
${allocation.formatted} for
${params.categoryName}.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: userPrompt
      }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: PERSONALISATION_SCHEMA
        }
      }
    })

    if (response.stop_reason === 'max_tokens') {
      return {
        success: false,
        error: 'Personalisation failed — please try again'
      }
    }

    const textBlock = response.content
      .find(b => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return {
        success: false,
        error: 'Personalisation failed — please try again'
      }
    }

    const result = JSON.parse(
      textBlock.text
    ) as PersonalisedResult

    // SAVE to personalised_results JSONB
    const existing =
      ownerCheck.personalised_results ?? {}
    const updated = { ...existing, [cacheKey]: result }

    await supabase
      .from('analyses')
      .update({ personalised_results: updated })
      .eq('id', params.analysisId)
      .eq('user_id', user.id)

    return { success: true, data: result }

  } catch {
    return {
      success: false,
      error: 'Personalisation failed — please try again'
    }
  }
}
