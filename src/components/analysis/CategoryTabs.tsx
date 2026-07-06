'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

interface CategoryTab {
  key: string
  name: string
  emoji: string
  content: ReactNode
}

interface CategoryTabsProps {
  categories: CategoryTab[]
}

export default function CategoryTabs({
  categories,
}: CategoryTabsProps) {

  const [activeKey, setActiveKey] =
    useState(
      categories[0]?.key ?? ''
    )

  // Single category — no tab row needed
  // Just render the content directly
  if (categories.length <= 1) {
    return (
      <div>
        {categories[0]?.content}
      </div>
    )
  }

  // Multiple categories — show tab row
  return (
    <div>

      {/* Scrollable tab row */}
      <div
        className="overflow-x-auto
        scrollbar-none -mx-4 px-4 mb-6"
      >
        <div
          className="flex w-max
          min-w-full border-b
          border-border/30"
        >
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() =>
                setActiveKey(cat.key)
              }
              className={`
                flex items-center gap-2
                px-4 py-3 text-sm
                font-medium whitespace-nowrap
                border-b-2 -mb-px
                transition-colors duration-150
                ${activeKey === cat.key
                  ? 'border-foreground ' +
                    'text-foreground'
                  : 'border-transparent ' +
                    'text-muted-foreground ' +
                    'hover:text-foreground/70'
                }
              `}
            >
              <span
                className="text-base
                leading-none"
              >
                {cat.emoji}
              </span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content panels */}
      {/* Use hidden/block NOT
          conditional rendering —
          preserves streaming state
          and style selection per tab */}
      {categories.map((cat) => (
        <div
          key={cat.key}
          className={
            activeKey === cat.key
              ? 'block'
              : 'hidden'
          }
        >
          {cat.content}
        </div>
      ))}

    </div>
  )
}
