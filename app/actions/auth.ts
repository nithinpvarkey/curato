'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type AuthState = { error: string | null }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function signUp(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = ((formData.get('email') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''
  const confirmPassword = (formData.get('confirmPassword') as string | null) ?? ''

  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' }
  }

  if (password.length < 8) {
    return { error: 'Password must be at least 8 characters.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    // Never expose internal Supabase error details to the client.
    return { error: 'Something went wrong. Please try again.' }
  }

  if (data.session) {
    redirect('/dashboard')
  }

  redirect('/verify-email')
}

export async function signIn(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = ((formData.get('email') as string | null) ?? '').trim()
  const password = (formData.get('password') as string | null) ?? ''

  // Use the same message for all failure cases to prevent user enumeration.
  if (!email || !password || !isValidEmail(email)) {
    return { error: 'Invalid email or password.' }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Invalid email or password.' }
  }

  redirect('/dashboard')
}

export async function signOut(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
