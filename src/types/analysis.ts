import type { StyleOption } from
  '@/components/analysis/StyleOptionCard'

// ─── Re-exports ───────────────────────────
export type { StyleOption }

// ─── Quiz / Questionnaire ─────────────────
export type QuizAnswers = {
  wedding_month: string | null
  wedding_year: string | null
  guest_count: string | null
  budget_range: string | null
}

// ─── Personalised Budget ──────────────────
export type PersonalisedBudgetItem = {
  item: string
  adjusted_range: string
  achievable: boolean
  note: string
}

export type PersonalisedResult = {
  personalised_budget_items:
    PersonalisedBudgetItem[]
  budget_gap_summary: string
  top_priority_cuts: {
    cut_this: string
    keep_this: string
    saving: string
    atmosphere_impact:
      'low' | 'medium' | 'high'
  }[]
  booking_dates: {
    action: string
    target_date: string
    months_away: number
  }[]
  achievability_score:
    'full' | 'partial' | 'stretch'
  curato_advice: string
}

// ─── Action Results ───────────────────────
export type AnalysisResult = {
  success: boolean
  data?: CategoryAnalysis
  error?: string
}

// ─── Category Brief ───────────────────────
// A fully-generated per-category output
// derived from the chosen master style.
// Uses the same shape as StyleOption so
// all existing sub-tab UI works unchanged.
export type CategoryAnalysis = {
  category: string
  options: StyleOption[]
}

// ─── Image Category Map ───────────────────
export type ImageCategoryEntry = {
  image_index: number
  categories: string[]
}

// ─── Master Vision ────────────────────────

// Per-category preview shown on master
// style cards before selection.
// Palette shows how the master style
// translates to that vendor category.
export type CategoryPreview = {
  label: string
  palette: {
    hex: string
    name: string
  }[]
}

// One master style option — represents
// a unified direction for the entire
// wedding derived from all uploaded images.
export type MasterStyleOption = {
  id: number
  name: string
  tagline: string
  confidence: number
  signal_evidence: string
  behavioral_description: string
  why_your_style: string
  master_palette: {
    hex: string
    name: string
  }[]
  // Flexible Record — new categories work
  // automatically without type changes
  category_previews: Record<
    string,
    CategoryPreview
  >
}

// Top-level master results stored in
// analyses.master_results JSONB column
export type MasterResults = {
  options: MasterStyleOption[]
  image_category_map: ImageCategoryEntry[]
}

// ─── Analysis Row ─────────────────────────
// Reflects current analyses table schema:
// master_results + category_briefs replace
// the old category_results column
export type AnalysisRow = {
  id: string
  user_id: string
  image_urls: string[]
  master_results: MasterResults | null
  // Keyed by "{master_option_id}_{category_key}"
  // e.g. "1_flowers_d_cor"
  category_briefs: Record<
    string,
    CategoryAnalysis
  > | null
  personalised_results: Record<
    string,
    PersonalisedResult
  > | null
  chosen_master_option_id: number | null
  created_at: string
  updated_at: string
}
