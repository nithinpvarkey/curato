import 'server-only'

import { createClient } from "@supabase/supabase-js";

// WARNING: This client bypasses ALL RLS policies
// Only use for server-side admin operations
// Never expose results directly to users without
// additional authorization checks
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
