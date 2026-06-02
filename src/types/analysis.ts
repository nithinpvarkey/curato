import type { StyleOption } from
  '@/components/analysis/StyleOptionCard'

export type { StyleOption }

export type CategoryAnalysis = {
  category: string
  options: StyleOption[]
}

export type AnalysisResult = {
  success: boolean
  data?: CategoryAnalysis
  error?: string
}

export type CategoryResults =
  Record<string, CategoryAnalysis>

export type QuizAnswers = {
  wedding_month: string | null
  wedding_year: string | null
  guest_count: string | null
  budget_range: string | null
}

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
    atmosphere_impact: 'low' | 'medium' | 'high'
  }[]
  booking_dates: {
    action: string
    target_date: string
    months_away: number
  }[]
  achievability_score: 'full' | 'partial' | 'stretch'
  curato_advice: string
}

export type AnalysisRow = {
  id: string
  user_id: string
  image_urls: string[]
  category_results: CategoryResults | null
  personalised_results:
    Record<string, PersonalisedResult> | null
  created_at: string
  updated_at: string
}
