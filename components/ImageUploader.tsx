'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { CldUploadWidget } from 'next-cloudinary'
import { saveImages } from '@/app/actions/upload'

interface ImageUploaderProps {
  onImagesReady?: (urls: string[]) => void
}

export default function ImageUploader({ onImagesReady }: ImageUploaderProps) {
  // useRef tracks the authoritative list so the onSuccess closure never goes stale
  const urlsRef = useRef<string[]>([])
  const [urls, setUrls] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()

  const handleSuccess = (result: unknown) => {
    const info = (result as { info?: { secure_url?: string } } | null)?.info
    if (!info || typeof info !== 'object' || !info.secure_url) return

    const next = [...urlsRef.current, info.secure_url]
    urlsRef.current = next
    setUrls(next)
    onImagesReady?.(next)
  }

  const handleAnalyse = () => {
    startTransition(async () => {
      await saveImages(urlsRef.current)
    })
  }

  return (
    <div className="space-y-6">
      <CldUploadWidget
        signatureEndpoint="/api/sign-cloudinary-params"
        uploadPreset="curato_wedding_images"
        options={{
          multiple: true,
          maxFiles: 10,
          resourceType: 'image',
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
          maxFileSize: 10485760,
        }}
        onSuccess={handleSuccess}
      >
        {({ open }) => (
          <button
            type="button"
            onClick={() => open?.()}
            className="inline-flex items-center gap-2 rounded-lg border-2 border-dashed border-gray-300 bg-white px-6 py-4 text-sm font-medium text-gray-600 hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            Choose Images
          </button>
        )}
      </CldUploadWidget>

      {urls.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700">
            {urls.length} image{urls.length !== 1 ? 's' : ''} selected
          </p>

          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
            {urls.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-lg bg-gray-100"
              >
                <Image
                  src={url}
                  alt={`Uploaded image ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover"
                />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={handleAnalyse}
            disabled={isPending}
            className="w-full rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? 'Analysing…' : 'Analyse My Vision'}
          </button>
        </div>
      )}
    </div>
  )
}
