'use client'

import { useRef } from 'react'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

type Props = {
  images: string[]
  categoryName: string
}

export function CategoryImageStrip({
  images,
  categoryName,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)

  if (!images || images.length === 0) {
    return null
  }

  const handleScrollRight = () => {
    const container = scrollRef.current
    if (!container) return
    container.scrollBy({
      left: 810,
      behavior: 'smooth',
    })
  }

  const showScrollButton = images.length > 5

  return (
    <div className="relative w-full">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto
        scrollbar-hide scroll-smooth
        snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none' }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="relative flex-shrink-0
            aspect-[3/4] h-[150px]
            rounded-2xl overflow-hidden snap-start
            shadow-sm"
          >
            <Image
              src={src}
              alt={`${categoryName} inspiration ${i + 1}`}
              fill
              className="object-cover"
              sizes="113px"
            />

            {/* Overlay on first image only */}
            {i === 0 && (
              <>
                {/* Dark gradient at bottom for legibility */}
                <div
                  className="absolute inset-x-0
                  bottom-0 h-[72px]"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.65) 100%)',
                  }}
                />
                {/* Overlay text */}
                <p className="absolute bottom-2
                left-2 text-white text-[10px]
                font-medium leading-snug">
                  {images.length} Saved Inspirations
                </p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Right chevron button — shows only if 5+ images */}
      {showScrollButton && (
        <button
          type="button"
          onClick={handleScrollRight}
          aria-label="Scroll for more inspiration images"
          className="absolute right-2 top-1/2
          -translate-y-1/2 w-10 h-10 rounded-full
          bg-white shadow-md flex items-center
          justify-center hover:bg-white
          hover:shadow-lg transition-shadow
          border border-[rgba(0,0,0,0.06)]
          z-10"
        >
          <ChevronRight
            className="w-5 h-5
            text-[#1F1B17]"
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  )
}
