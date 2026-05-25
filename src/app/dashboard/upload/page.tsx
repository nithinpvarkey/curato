import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ImageUploader from '@/components/ImageUploader'

export default async function UploadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">
          Upload Your Inspiration Images
        </h1>
        <div className="rounded-xl bg-white p-8 shadow-md">
          <ImageUploader />
        </div>
      </div>
    </main>
  )
}
