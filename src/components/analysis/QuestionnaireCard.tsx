'use client'

import { Button } from '@/components/ui/button'

export type QuestionAnswer = {
  wedding_month: string | null
  wedding_year: string | null
  guest_count: string | null
  budget_range: string | null
}

export type Question = {
  id: keyof QuestionAnswer
  title: string
  subtitle: string
  type: 'month_year' | 'tap_options'
  options?: string[]
}

interface QuestionnaireCardProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  currentAnswers: QuestionAnswer
  onAnswer: (
    field: keyof QuestionAnswer,
    value: string
  ) => void
  onNext: () => void
  isLast: boolean
  isExiting: boolean
}

export default function QuestionnaireCard({
  question,
  questionNumber,
  totalQuestions,
  currentAnswers,
  onAnswer,
  onNext,
  isLast,
  isExiting,
}: QuestionnaireCardProps) {
  return (
    <div
      className={`
        transition-all duration-300 ease-in-out
        ${isExiting
          ? '-translate-x-full opacity-0'
          : 'translate-x-0 opacity-100'
        }
      `}
    >
      <div className="bg-[#FDFAF7] rounded-2xl
      border border-border/40 shadow-sm p-6
      space-y-5">

        {/* Progress */}
        <p className="text-xs text-muted-foreground
        text-right font-medium">
          {questionNumber}/{totalQuestions}
        </p>

        {/* Question */}
        <div>
          <h3 className="text-lg font-semibold
          text-foreground leading-snug mb-1">
            {question.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            {question.subtitle}
          </p>
        </div>

        {/* Month + Year dropdowns */}
        {question.type === 'month_year' && (
          <div className="flex gap-3">
            <select
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={
                currentAnswers.wedding_month ?? ''
              }
              onChange={(e) =>
                onAnswer('wedding_month', e.target.value)
              }
            >
              <option value="">Month</option>
              {[
                'January','February','March',
                'April','May','June','July',
                'August','September','October',
                'November','December'
              ].map(month => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              value={
                currentAnswers.wedding_year ?? ''
              }
              onChange={(e) =>
                onAnswer('wedding_year', e.target.value)
              }
            >
              <option value="">Year</option>
              {[2026,2027,2028,2029,2030].map(year => (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Tap options */}
        {question.type === 'tap_options' &&
          question.options && (
          <div className="flex flex-wrap gap-2">
            {question.options.map(option => {
              const field = question.id
              const isSelected =
                currentAnswers[field] === option
              return (
                <button
                  key={option}
                  onClick={() => onAnswer(field, option)}
                  className={`
                    px-4 py-2 rounded-full text-sm
                    border transition-all duration-150
                    min-h-[44px]
                    ${isSelected
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground/50'
                    }
                  `}
                >
                  {option}
                </button>
              )
            })}
          </div>
        )}

        {/* Next / Done button */}
        <Button
          className="w-full h-11"
          onClick={onNext}
        >
          {isLast ? 'Done →' : 'Next →'}
        </Button>

      </div>
    </div>
  )
}
