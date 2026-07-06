'use client'

import { Flower2 } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts'

export type CostBreakdownDonutItem = {
  name: string
  description: string
  priceLabel: string
  chartValue: number
  achievable: boolean
}

type Props = {
  items: CostBreakdownDonutItem[]
}

// This wedding's own palette, assigned in the
// same order the cost items already appear.
const SEGMENT_COLORS = [
  '#F5F0E8',
  '#8FAF8A',
  '#C5A55A',
  '#3D5C3A',
  '#D4CFC4',
]

export function CostBreakdownDonut({ items }: Props) {
  return (
    <div className="flex flex-col sm:flex-row
    gap-5 items-center sm:items-start">

      {/* Donut chart */}
      <div className="relative w-[180px] h-[180px]
      flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={items}
              dataKey="chartValue"
              nameKey="name"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={1}
              stroke="rgba(31, 27, 23, 0.08)"
              strokeWidth={1}
              isAnimationActive={false}
            >
              {items.map((_, i) => (
                <Cell
                  key={i}
                  fill={SEGMENT_COLORS[
                    i % SEGMENT_COLORS.length
                  ]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0
        flex items-center justify-center">
          <Flower2
            className="w-7 h-7"
            style={{ color: 'rgb(143, 175, 126)' }}
            strokeWidth={1.5}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 min-w-0 w-full
      divide-y divide-border/30">
        {items.map((item, i) => (
          <div
            key={i}
            className="py-2 first:pt-0 last:pb-0
            flex items-start gap-2.5"
          >
            <span
              className="w-2.5 h-2.5 rounded-full
              flex-shrink-0 mt-1"
              style={{
                backgroundColor: SEGMENT_COLORS[
                  i % SEGMENT_COLORS.length
                ],
              }}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start
              justify-between gap-3">
                <span className={`text-small ${
                  !item.achievable
                    ? 'text-muted-foreground/50 line-through'
                    : ''
                }`}>
                  {item.name}
                </span>
                <span className={`text-small
                font-semibold flex-shrink-0
                tabular-nums ${
                  !item.achievable
                    ? 'text-muted-foreground/50'
                    : ''
                }`}>
                  {item.priceLabel}
                </span>
              </div>
              {item.description && (
                <p className="text-[10.5px]
                text-muted-foreground
                leading-snug mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  )
}
