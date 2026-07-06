import { getBestButtonColour } from '@/lib/colour-utils'
import StyleOptionTabs from './StyleOptionTabs'
import type { StyleOption } from './StyleOptionCard'
import type {
  QuizAnswers,
  PersonalisedResult,
} from '@/types/analysis'

type CategoryDetailContentProps = {
  option: StyleOption
  categoryParam: string
  quizAnswers: QuizAnswers
  personalisedResult: PersonalisedResult | null
}

export default function CategoryDetailContent({
  option,
  categoryParam,
  quizAnswers,
  personalisedResult,
}: CategoryDetailContentProps) {
  const accentHex = getBestButtonColour(option.palette)

  return (
    <StyleOptionTabs
      option={option}
      accentHex={accentHex}
      quizAnswers={quizAnswers}
      personalisedResult={personalisedResult}
      isPersonalising={false}
      categoryKey={categoryParam}
    />
  )
}
