export type PaletteColor = {
  hex: string
  name: string
}

export type BudgetItem = {
  item: string
  range: string
  note: string
}

export type StyleOption = {
  id: number
  name: string
  confidence: 'high' | 'medium' | 'low'
  signal_evidence: string
  behavioral_description: string
  why_your_style: string
  palette: PaletteColor[]
  do_not_list: string[]
  vendor_keywords: string[]
  avoid_keywords: string[]
  budget_items: BudgetItem[]
}

export type CategoryAnalysis = {
  category: string
  options: StyleOption[]
}

export type AnalysisResult = {
  success: boolean
  data?: CategoryAnalysis
  error?: string
}

export type CategoryResults = {
  [categoryKey: string]: CategoryAnalysis
}

export type AnalysisRow = {
  id: string
  user_id: string
  image_urls: string[]
  category_results: CategoryResults | null
  updated_at: string | null
  created_at: string
}
