import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white shadow-md rounded-lg px-8 py-10 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to Curato
        </h1>
        <p className="text-gray-500 text-sm mb-8">{user.email}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  )
}
