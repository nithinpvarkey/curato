export type WaitContent = {
  tips: string[]
}

const CATEGORY_WAIT_CONTENT: Record<string, WaitContent> = {
  flowers_d_cor: {
    tips: [
      "Florists book 9–12 months out for popular dates — reach out early.",
      "Ask what's in season for your date; in-season blooms cost less and look fresher.",
      "A few large statement pieces often photograph better than many small ones.",
    ],
  },
  venue_atmosphere: {
    tips: [
      "Ask what's included — tables, chairs, linens — before comparing venue prices.",
      "Book your venue first; most other vendors' availability depends on the date.",
      "Visit at the same time of day as your event to see the real light.",
    ],
  },
  photography_lighting: {
    tips: [
      "Photographers book earliest of all vendors for peak dates — often 12+ months out.",
      "Ask to see a full wedding gallery, not just highlights, to judge consistency.",
      "Golden hour shifts by season — confirm your timeline leaves room for it.",
    ],
  },
  attire_styling: {
    tips: [
      "Order wedding attire 6–8 months ahead; alterations can take 2–3 fittings.",
      "Bridesmaid dresses in one color but different cuts usually flatter more people.",
      "Book hair and makeup trials early — good artists fill up fast.",
    ],
  },
}

export const warmLines: string[] = [
  "Taking a moment to really look at what you've chosen.",
  "The clearer your vision, the easier every vendor conversation gets.",
  "Good planning is knowing what matters most to you — we're getting there.",
]

export function getWaitContent(categoryKey: string): string[] {
  const content = CATEGORY_WAIT_CONTENT[categoryKey]
  if (!content) return [...warmLines]
  return [...content.tips, ...warmLines]
}
