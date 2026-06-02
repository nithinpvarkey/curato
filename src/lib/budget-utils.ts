// Wedding budget allocation utilities
// Based on real US market averages 2025

const CATEGORY_BUDGET_PERCENTAGES:
  Record<string, { min: number; max: number }> = {
  'flowers': { min: 0.08, max: 0.15 },
  'flowers_d_cor': { min: 0.08, max: 0.15 },
  'venue': { min: 0.28, max: 0.40 },
  'venue_atmosphere': { min: 0.28, max: 0.40 },
  'photography': { min: 0.10, max: 0.14 },
  'photography_lighting': { min: 0.10, max: 0.14 },
  'attire': { min: 0.08, max: 0.12 },
  'attire_styling': { min: 0.08, max: 0.12 },
}

const DEFAULT_PERCENTAGE = { min: 0.08, max: 0.12 }

// Parse budget range string to numeric midpoint
export function parseBudgetRange(
  budgetRange: string | null
): number {
  if (!budgetRange) return 25000
  const clean = budgetRange
    .replace(/\$|,/g, '')
    .toLowerCase()
  if (clean.startsWith('under')) {
    const val = parseFloat(
      clean.replace('under', '').trim()
        .replace('k', '')
    )
    return val * 1000 * 0.8
  }
  if (clean.endsWith('+')) {
    const val = parseFloat(
      clean.replace('k+', '').replace('+', '')
    )
    return val * 1000 * 1.2
  }
  const parts = clean.split(/[–\-]/).map(p => p.trim())
  if (parts.length === 2) {
    const lo = parseFloat(parts[0].replace('k', ''))
      * (parts[0].includes('k') ? 1000 : 1)
    const hi = parseFloat(parts[1].replace('k', ''))
      * (parts[1].includes('k') ? 1000 : 1)
    return (lo + hi) / 2
  }
  return 25000
}

// Parse guest count string to number
export function parseGuestCount(
  guestCount: string | null
): number {
  if (!guestCount) return 80
  const clean = guestCount.toLowerCase().trim()
  if (clean.startsWith('under')) {
    // "Under 20" → 15, "Under 50" → 40
    const val = parseInt(
      clean.replace('under', '').trim()
    )
    return Math.round(val * 0.75)
  }
  if (clean.endsWith('+')) {
    // "150+" → 165, "200+" → 220
    const val = parseInt(
      clean.replace('+', '').trim()
    )
    return Math.round(val * 1.1)
  }
  const parts = clean
    .split(/[–\-]/)
    .map(p => p.trim())
  if (parts.length === 2) {
    return Math.round(
      (parseInt(parts[0]) + parseInt(parts[1])) / 2
    )
  }
  return parseInt(clean) || 80
}

// Get realistic budget allocation for a category
export function getCategoryBudgetAllocation(
  totalBudget: number,
  categoryKey: string
): {
  min: number
  max: number
  formatted: string
  percentage: string
} {
  const pct = CATEGORY_BUDGET_PERCENTAGES[
    categoryKey.toLowerCase()
  ] ?? DEFAULT_PERCENTAGE
  const min = Math.round(totalBudget * pct.min)
  const max = Math.round(totalBudget * pct.max)
  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US')
  return {
    min,
    max,
    formatted: `${fmt(min)}–${fmt(max)}`,
    percentage: `${Math.round(pct.min * 100)}–${
      Math.round(pct.max * 100)}%`
  }
}

// Calculate actual booking target date
export function calculateBookingDate(
  bookingWindow: string,
  weddingMonth: string | null,
  weddingYear: string | null
): string | null {
  if (!weddingMonth || !weddingYear) return null
  const match = bookingWindow.match(/(\d+)/)
  if (!match) return null
  const monthsOut = parseInt(match[1])
  const monthNames = [
    'January','February','March','April',
    'May','June','July','August',
    'September','October','November','December'
  ]
  const weddingMonthIndex =
    monthNames.indexOf(weddingMonth)
  if (weddingMonthIndex === -1) return null
  const weddingDate = new Date(
    parseInt(weddingYear), weddingMonthIndex, 1
  )
  const bookingDate = new Date(weddingDate)
  bookingDate.setMonth(
    bookingDate.getMonth() - monthsOut
  )
  return `by ${monthNames[bookingDate.getMonth()]}
    ${bookingDate.getFullYear()}`
}

export type BookingStatus = {
  genericText: string
  calculatedMessage: string | null
  urgency: 'normal' | 'soon' | 'urgent' | 'overdue' | 'emergency'
}

export function getBookingStatus(
  bookingWindow: string,
  weddingMonth: string | null,
  weddingYear: string | null
): BookingStatus | null {
  if (!weddingMonth || !weddingYear) return null

  const monthNames = [
    'January','February','March','April',
    'May','June','July','August',
    'September','October','November','December'
  ]

  const weddingMonthIndex =
    monthNames.indexOf(weddingMonth)
  if (weddingMonthIndex === -1) return null

  const today = new Date()
  const weddingDate = new Date(
    parseInt(weddingYear), weddingMonthIndex, 1
  )

  // Wedding already happened
  if (weddingDate < today) return null

  // Months until wedding
  const monthsUntilWedding =
    (weddingDate.getFullYear() -
      today.getFullYear()) * 12 +
    (weddingDate.getMonth() - today.getMonth())

  // Wedding is less than 6 months away
  if (monthsUntilWedding < 6) {
    return {
      genericText: 'Book immediately',
      calculatedMessage:
        `Your wedding is ${monthsUntilWedding} ` +
        `month${monthsUntilWedding === 1 ? '' : 's'} ` +
        `away — some vendors may not be available. ` +
        `Move quickly and be upfront about your date.`,
      urgency: 'emergency'
    }
  }

  // Extract months from booking window
  // e.g. "12–16 months before your wedding"
  const match = bookingWindow.match(/(\d+)/)
  if (!match) return null
  const monthsOut = parseInt(match[1])

  // Calculate ideal booking date
  const bookingDate = new Date(weddingDate)
  bookingDate.setMonth(
    bookingDate.getMonth() - monthsOut
  )

  // Months until/since ideal booking date
  const monthsUntilBooking =
    (bookingDate.getFullYear() -
      today.getFullYear()) * 12 +
    (bookingDate.getMonth() - today.getMonth())

  const bookingMonthName =
    monthNames[bookingDate.getMonth()]
  const bookingYear = bookingDate.getFullYear()
  const weddingDisplay =
    `${weddingMonth} ${weddingYear}`

  // Booking window already passed
  if (monthsUntilBooking < 0) {
    return {
      genericText: 'Book immediately',
      calculatedMessage:
        `Ideal window was ${bookingMonthName} ` +
        `${bookingYear}. Book now and mention your ` +
        `date upfront — some vendors may still ` +
        `have availability for ${weddingDisplay}.`,
      urgency: 'overdue'
    }
  }

  // Booking window is this month
  if (monthsUntilBooking === 0) {
    return {
      genericText: bookingWindow,
      calculatedMessage:
        `This month — your booking window ` +
        `is closing for your ${weddingDisplay} ` +
        `wedding.`,
      urgency: 'urgent'
    }
  }

  // Booking window is 1-2 months away
  if (monthsUntilBooking <= 2) {
    return {
      genericText: bookingWindow,
      calculatedMessage:
        `by ${bookingMonthName} ${bookingYear} ` +
        `— only ${monthsUntilBooking} month` +
        `${monthsUntilBooking === 1 ? '' : 's'} ` +
        `away for your ${weddingDisplay} wedding.`,
      urgency: 'soon'
    }
  }

  // Normal future booking date
  return {
    genericText: bookingWindow,
    calculatedMessage:
      `by ${bookingMonthName} ${bookingYear} ` +
      `for your ${weddingDisplay} wedding`,
    urgency: 'normal'
  }
}
