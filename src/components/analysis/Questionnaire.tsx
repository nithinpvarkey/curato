'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import QuestionnaireCard, {
  type QuestionAnswer,
  type Question
} from './QuestionnaireCard'

interface QuestionnaireProps {
  analysisId: string
  userId: string
}

export default function Questionnaire({
  analysisId,
  userId
}: QuestionnaireProps) {

  const QUESTIONS: Question[] = [
    {
      id: 'wedding_month',
      title: 'When is your wedding?',
      subtitle: 'Helps us personalise your ' +
        'planning timeline.',
      type: 'month_year',
    },
    {
      id: 'guest_count',
      title: 'How many guests are you expecting?',
      subtitle: 'Helps us give you realistic ' +
        'budget ranges.',
      type: 'tap_options',
      options: [
        'Under 20',
        '20–50',
        '50–100',
        '100–150',
        '150+',
      ],
    },
    {
      id: 'budget_range',
      title: 'What is your total wedding budget?',
      subtitle: 'We use real US market rates — ' +
        'no judgement.',
      type: 'tap_options',
      options: [
        'Under $5k',
        '$5k–$10k',
        '$10k–$15k',
        '$15k–$25k',
        '$25k–$40k',
        '$40k+',
      ],
    },
  ]

  type Phase =
    'hidden' | 'banner' |
    'questionnaire' | 'done'

  const [phase, setPhase] =
    useState<Phase>('hidden')
  const [currentIndex, setCurrentIndex] =
    useState(0)
  const [isExiting, setIsExiting] =
    useState(false)
  const [answers, setAnswers] =
    useState<QuestionAnswer>({
      wedding_month: null,
      wedding_year: null,
      guest_count: null,
      budget_range: null,
    })
  const [completed, setCompleted] =
    useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setPhase('banner')
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  const handleAnswer = (
    field: keyof QuestionAnswer,
    value: string
  ) => {
    setAnswers(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    const isLast =
      currentIndex === QUESTIONS.length - 1

    setIsExiting(true)

    setTimeout(async () => {
      if (isLast) {
        await saveAnswers()
        setCompleted(true)
        setPhase('done')
      } else {
        setCurrentIndex(prev => prev + 1)
        setIsExiting(false)
      }
    }, 300)
  }

  const handleSkip = () => {
    setCompleted(false)
    setPhase('done')
  }

  const saveAnswers = async () => {
    try {
      const supabase = createClient()
      await supabase
        .from('quiz_responses')
        .insert({
          analysis_id: analysisId,
          user_id: userId,
          respondent: 'partner_a',
          answers: answers,
        })
    } catch {
      // Silent fail — questionnaire is
      // non-critical, never blocks the user
    }
  }

  return (
    <div className="mb-6">

      {/* BANNER */}
      {phase === 'banner' && (
        <div className="animate-in
        slide-in-from-bottom-2 duration-300
        bg-muted/40 rounded-2xl border
        border-border/40 px-5 py-4 mb-4">
          <p className="text-sm font-medium
          text-foreground mb-1">
            While we analyse your images…
          </p>
          <p className="text-xs
          text-muted-foreground mb-4">
            Answer 3 quick questions to personalise
            your planning timeline and budget reality.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() =>
                setPhase('questionnaire')
              }
              className="flex-1 rounded-xl
              bg-foreground text-background
              text-sm font-medium py-2.5
              min-h-[44px] transition-opacity
              hover:opacity-80"
            >
              Let's do it
            </button>
            <button
              onClick={handleSkip}
              className="flex-1 rounded-xl border
              border-border text-sm
              text-muted-foreground py-2.5
              min-h-[44px] transition-colors
              hover:text-foreground"
            >
              Skip for now
            </button>
          </div>
        </div>
      )}

      {/* QUESTIONNAIRE */}
      {phase === 'questionnaire' && (
        <div className="mb-4 overflow-hidden">
          <QuestionnaireCard
            question={QUESTIONS[currentIndex]}
            questionNumber={currentIndex + 1}
            totalQuestions={QUESTIONS.length}
            currentAnswers={answers}
            onAnswer={handleAnswer}
            onNext={handleNext}
            isLast={
              currentIndex === QUESTIONS.length - 1
            }
            isExiting={isExiting}
          />
        </div>
      )}

      {/* DONE — confirmation if completed */}
      {phase === 'done' && completed && (
        <div className="animate-in
        fade-in duration-300
        flex items-center gap-2 px-1 mb-4">
          <div className="w-4 h-4 rounded-full
          bg-foreground flex items-center
          justify-center flex-shrink-0">
            <svg
              width="8" height="8"
              viewBox="0 0 8 8"
              fill="none"
            >
              <path
                d="M1.5 4l2 2L6.5 2"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-xs
          text-muted-foreground">
            Details saved — your planner
            is personalised
          </p>
        </div>
      )}

    </div>
  )
}
