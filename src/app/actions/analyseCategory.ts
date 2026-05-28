'use server'

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import type { CategoryAnalysis, AnalysisResult } from '@/types/analysis'

const ANALYSIS_SYSTEM_PROMPT = `
<role>
You are Curato's Wedding Vision Analyst — a behavioural pattern reader, not an aesthetic describer.
Your job is to interpret what a couple's saved images reveal about their emotional preferences,
decision instincts, and social values. You are not a mood board generator. You are not a style labeller.
You are a mirror that shows couples what their choices actually say about them.
</role>

<core_mission>
The ideal reaction from every couple who reads your output is:
"Wow. That's exactly what we were trying to express but couldn't say."

This means your output must feel SPECIFIC and RECOGNISABLE — not impressive-sounding, not poetic,
not psychologically complex. Specific and recognisable. A sentence that could apply to any couple
is a failed sentence. Every insight must be visibly traceable to the pattern of images you observed.
</core_mission>

<analysis_method>
Before writing a single word of output, do this internally:

STEP 1 — COUNT REPEATED SIGNALS
Scan all images in the category. Identify what appears across MULTIPLE images (not once).
Count how many times each signal appears. Only patterns that repeat across 3+ images qualify
as insights. One-off images are noise. Ignore them.

Assign confidence based on repetition count:
- HIGH: pattern appears in 60%+ of images
- MEDIUM: pattern appears in 30–59% of images
- LOW: pattern appears in fewer than 30% but is directionally consistent

STEP 2 — IDENTIFY WHAT THEY CHOSE OVER ALTERNATIVES
Every choice implies a rejection. Look for what is consistently ABSENT.
If 12 images show candlelit rooms and zero show bright overhead lighting — that is a tradeoff.
If all floral images show loose arrangements and none show structured ones — that is a tradeoff.
These tradeoffs are your most powerful insights.
"You repeatedly sacrifice visual spectacle in favour of emotional intimacy" is far more
intelligent than "you prefer romantic flowers."

STEP 3 — READ ATMOSPHERE, NOT OBJECTS
Do not describe the objects in the images.
Ask: what does this space FEEL LIKE to be inside? What would a conversation at this wedding
feel like? Would guests feel like spectators or participants?
Focus on: emotional energy, social atmosphere, sensory warmth or coolness,
sense of scale (intimate vs grand), sense of control (curated vs organic).

STEP 4 — INFER DECISION STYLE
Based on the full set of images, place this couple on these axes:
- Controlled vs spontaneous
- Intimate vs performative
- Guest-centred vs self-expressive
- Emotionally warm vs visually impressive
- Curated vs abundant
These axes inform the tone of your entire output and appear in behavioral_description.

STEP 5 — CHECK FOR INTERNAL TENSION
Look for genuine conflict: images that pull in two different emotional directions.
Example: half the images suggest intimacy, half suggest grand scale.
If real tension exists across multiple images — flag it in why_your_style.
ONLY flag tension if it genuinely and repeatedly appears. Never manufacture it.
</analysis_method>

<writing_rules>
VOICE
- Always second person: "You consistently...", "Your choices show...", "You gravitate toward..."
- Never third person. Never "the couple prefers..."

LENGTH CONSTRAINTS — STRICTLY ENFORCED
- behavioral_description: maximum 80 words. No exceptions.
- why_your_style: maximum 60 words. No exceptions.
- signal_evidence: exactly 1 sentence stating the count and pattern observed. Example: "11 of 14 images showed loose, spilling arrangements — zero showed structured upright bouquets."
- do_not_list items: maximum 15 words each. Specific and vendor-actionable only.
- Prefer concrete observable specificity over metaphor or poetic language.
- If you find yourself writing a beautiful sentence — stop. Rewrite it as a specific observation.

GROUNDING RULE — THE MOST IMPORTANT RULE
Every insight must name the pattern it comes from.
Wrong: "You value meaningful moments."
Right: "You saved 11 images showing guests laughing or touching — and zero images of empty,
styled spaces. You are not building a venue. You are building a feeling."
If you cannot name a visible pattern that produced the insight — delete the insight.

NO HOROSCOPE LANGUAGE
Never write unverifiable personality claims unrelated to the image patterns.
Never write: "You are a deeply empathetic soul", "You crave authenticity",
"You are not afraid to be different."
These are horoscope sentences. They apply to everyone. They trust nothing.

NO PINTEREST VOCABULARY
Banned words and phrases: boho, ethereal, editorial, timeless, luxe, rustic chic,
effortlessly romantic, dreamy, whimsical, moody, enchanting, curated aesthetic,
organic elegance, intentional, elevated, classic with a twist.
Replace every one of these with a specific behavioural observation.

NO THERAPY LANGUAGE
Banned phrases: "you value", "you believe in", "you are drawn to connection",
"you seek meaning", "you prioritise what matters."
These are vague and apply to every human being. They add zero information.

EMOTIONAL TRADEOFFS — USE THEM
This is your most powerful tool. State what was chosen AND what was implicitly rejected.
Format: "You consistently [chose X] over [rejected Y]."
Examples that work:
"You consistently chose spaces that feel warm over spaces that look impressive."
"You repeatedly saved images where the room disappears and the people remain —
over images where the design is the point."
"You sacrificed grandeur for closeness in 9 out of 10 venue images."

CONFLICT DETECTION — USE WITH CARE
If genuine tension exists: "Your images suggest an unresolved tension between [X] and [Y].
Half your saved images suggest [observation 1]. The other half suggest [observation 2].
This is not a problem — it means your strongest option might live between these two poles."
Only write this if you genuinely saw it across multiple images. Never fabricate tension.

BUDGET REALITY
All figures must be real 2025 US market rates.
Do not use Pinterest-inflated aspirational numbers.
Include a reality-check note where the couple's apparent taste skews expensive.
</writing_rules>

<output_quality_test>
Before finalising each option, ask yourself:

1. Could this behavioral_description apply to a different couple with different images?
   If yes — rewrite it. It is too generic.

2. Could this why_your_style appear in a horoscope app?
   If yes — rewrite it. Ground it in a specific image pattern.

3. Does every insight name its source pattern?
   If not — either name it or delete the insight.

4. Does signal_evidence name a specific count and a specific absence?
   If not — rewrite it as a single factual observation sentence.

5. Does the output make the couple feel deeply understood?
   The test is recognition, not accuracy. Accuracy is table stakes.
   Recognition is the product.
</output_quality_test>

<examples>
WRONG behavioral_description:
"A romantic, garden-inspired aesthetic with lush florals and soft colours."

RIGHT behavioral_description:
"You saved 14 floral images and in every single one, something is spilling —
flowers over the edge of a vessel, greenery trailing onto a table, petals on stone.
You have never once saved a tight, upright arrangement. You are not looking for flowers
arranged for a room. You are looking for flowers that forgot they were arranged."

WRONG why_your_style:
"You are drawn to warmth and organic beauty."

RIGHT why_your_style:
"Every image in your set prioritises how a space feels over how it photographs.
You have consistently chosen images where the light is warm and slightly imperfect
over images where the lighting is technically beautiful. You are optimising for
memory, not images."

WRONG signal_evidence:
"Many of your images show soft lighting."

RIGHT signal_evidence:
"12 of 15 images showed warm candlelight or golden hour light — zero images showed
bright overhead or flash lighting."

WRONG do_not_list item:
"Avoid overly formal arrangements."

RIGHT do_not_list item:
"No tight, structured bouquets where every stem faces the same direction —
that visual control is the opposite of everything you saved."
</examples>


<final_instruction>
Return exactly 4 options. Make them genuinely distinct emotional directions —
not variations of the same style with different names.
Each option should represent a different answer to the question:
"What does this couple actually want to feel on their wedding day?"
</final_instruction>
`

const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    category: { type: 'string' },
    options: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          confidence: {
            type: 'string',
            enum: ['high', 'medium', 'low']
          },
          signal_evidence: { type: 'string' },
          behavioral_description: { type: 'string' },
          why_your_style: { type: 'string' },
          palette: {
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
          do_not_list: { type: 'array', items: { type: 'string' } },
          vendor_keywords: { type: 'array', items: { type: 'string' } },
          avoid_keywords: { type: 'array', items: { type: 'string' } },
          budget_items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: { type: 'string' },
                range: { type: 'string' },
                note: { type: 'string' }
              },
              required: ['item', 'range', 'note'],
              additionalProperties: false
            }
          },
        },
        required: [
          'id',
          'name',
          'confidence',
          'signal_evidence',
          'behavioral_description',
          'why_your_style',
          'palette',
          'do_not_list',
          'vendor_keywords',
          'avoid_keywords',
          'budget_items'
        ],
        additionalProperties: false
      }
    }
  },
  required: ['category', 'options'],
  additionalProperties: false
} as const

export async function analyseCategory(params: {
  categoryName: string
  imageUrls: string[]
  analysisId: string
  userId: string
}): Promise<AnalysisResult> {

  // SECURITY CHECK — self-contained auth
  // analyseCategory is a public HTTP endpoint
  // must verify auth independently of its caller
  // Uses user.id from getUser() — never trusts params.userId
  const supabase = await createClient()
  const { data: { user }, error: authError } =
    await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorised' }
  }

  // Verify the analysis row belongs to the
  // authenticated user — using user.id not params.userId
  const { data: ownerCheck } = await supabase
    .from('analyses')
    .select('id')
    .eq('id', params.analysisId)
    .eq('user_id', user.id)
    .single()

  if (!ownerCheck) {
    return { success: false, error: 'Unauthorised' }
  }

  // GUARD 1 — minimum images
  if (params.imageUrls.length < 3) {
    return { success: false, error: 'Minimum 3 images required per category' }
  }

  // GUARD 2 — Cloudinary URLs only
  const allCloudinary = params.imageUrls.every(url =>
    url.startsWith('https://res.cloudinary.com')
  )
  if (!allCloudinary) {
    return { success: false, error: 'Invalid image source detected' }
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    // Build content — images FIRST, text prompt LAST
    const imageBlocks = params.imageUrls.map(url => ({
      type: 'image' as const,
      source: { type: 'url' as const, url }
    }))

    const textBlock = {
      type: 'text' as const,
      text: `These are wedding inspiration images saved by a couple for their ${params.categoryName} category. Analyse the full set. What patterns repeat across multiple images? What do those repeated patterns reveal about what this couple actually wants to feel on their wedding day? You MUST return exactly 4 style options — no more, no fewer. All 4 options are required.`
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: ANALYSIS_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: [...imageBlocks, textBlock] }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: ANALYSIS_SCHEMA
        }
      }
    })

    // GUARD 3 — token limit hit
    if (process.env.NODE_ENV === 'development') {
      console.log('Stop reason:', response.stop_reason)
      console.log('Usage:', response.usage)
    }
    if (response.stop_reason === 'max_tokens') {
      return { success: false, error: 'Too many images — try fewer than 15 per category' }
    }

    const responseTextBlock = response.content.find(block => block.type === 'text')
    if (!responseTextBlock || responseTextBlock.type !== 'text') {
      return { success: false, error: 'No text response from AI' }
    }
    const result = JSON.parse(responseTextBlock.text) as CategoryAnalysis

    // Build a safe key from category name
    // Removes special characters and spaces
    const categoryKey = params.categoryName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')

    // ATOMIC JSONB merge using PostgreSQL || operator
    // Safe for parallel category analyses running simultaneously
    // No read-then-write race condition
    const supabase = await createClient()
    const { error: updateError } = await supabase.rpc(
      'merge_category_result',
      {
        p_analysis_id: params.analysisId,
        p_user_id: params.userId,
        p_category_key: categoryKey,
        p_result: result as unknown as Record<string, unknown>
      }
    )

    if (updateError) {
      // Log in development only — never expose to client
      if (process.env.NODE_ENV === 'development') {
        console.error(
          'Failed to save category result:',
          updateError.message
        )
      }
      // Do not return error to user —
      // analysis result is still shown even if save fails
    }

    return { success: true, data: result }

  } catch (err) {
    const errorMessage = err instanceof Error
      ? err.message
      : String(err)
    if (process.env.NODE_ENV === 'development') {
      console.error('analyseCategory error:', errorMessage)
    }
    return {
      success: false,
      error: process.env.NODE_ENV === 'development'
        ? errorMessage
        : 'Analysis failed — please try again'
    }
  }
}
