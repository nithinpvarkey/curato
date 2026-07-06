'use server'

import 'server-only'
import { createClient } from '@/lib/supabase/server'

export async function saveChosenMaster(
  analysisId: string,
  optionId: number
): Promise<{ success: boolean; error?: string }> {
  if (!Number.isInteger(optionId)) {
    return { success: false, error: 'Invalid option id' }
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('analyses')
    .update({ chosen_master_option_id: optionId })
    .eq('id', analysisId)
    .eq('user_id', user.id)

  return error
    ? { success: false, error: error.message }
    : { success: true }
}
