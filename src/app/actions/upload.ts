'use server'

import { createClient } from '@/lib/supabase/server'

const CLOUDINARY_ORIGIN = 'https://res.cloudinary.com/'

export async function saveImages(urls: string[]): Promise<string> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Unauthorized')
  }

  if (!Array.isArray(urls) || urls.length === 0) {
    throw new Error('At least one image URL is required.')
  }

  if (urls.length > 10) {
    throw new Error('Maximum 10 images allowed.')
  }

  for (const url of urls) {
    if (typeof url !== 'string' || !url.startsWith(CLOUDINARY_ORIGIN)) {
      throw new Error('Invalid image URL.')
    }
  }

  const { data, error } = await supabase
    .from('analyses')
    .insert({
      user_id: user.id,
      image_urls: urls,
      source_type: 'upload',
      is_watermarked: true,
    })
    .select('id')
    .single()

  if (error) {
throw new Error('Failed to save images.')
  }

  return data.id as string
}
