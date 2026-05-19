import { v2 as cloudinary } from 'cloudinary'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const paramsToSign = (body as Record<string, unknown> | null)?.paramsToSign

  if (
    paramsToSign === null ||
    paramsToSign === undefined ||
    typeof paramsToSign !== 'object' ||
    Array.isArray(paramsToSign)
  ) {
    return NextResponse.json(
      { error: 'Missing or invalid paramsToSign' },
      { status: 400 }
    )
  }

  const params = paramsToSign as Record<string, unknown>

  const signature = cloudinary.utils.api_sign_request(
    params,
    process.env.CLOUDINARY_API_SECRET!
  )

  // CLOUDINARY_API_SECRET is never included in the response — only the
  // public API key is returned so the widget can complete the upload.
  return NextResponse.json({
    signature,
    timestamp: params.timestamp,
    apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  })
}
