'use client'

import { createBrowserClient } from '@supabase/ssr'
import { getClientEnv, isDemoMode } from '@vistral/config'
import type { Database } from './types'

/**
 * Creates the Supabase client used inside `"use client"` components of apps spawned
 * under `apps/<slug>/`. Safe to call repeatedly — the @supabase/ssr helpers memoize
 * the underlying client.
 *
 * In demo mode (no `NEXT_PUBLIC_SUPABASE_URL` set) this returns a minimal mock so
 * screens render without throwing. Callers still must not rely on data in that mode.
 */
export function createSupabaseBrowserClient() {
  if (isDemoMode()) {
    return createDemoClient()
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getClientEnv()

  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error(
      '[@vistral/db] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Set them in the app env (Vercel project) or enable demo mode by leaving them unset.',
    )
  }

  return createBrowserClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })
}

function createDemoClient() {
  const mockQuery = {
    select: () => mockQuery,
    eq: () => mockQuery,
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: null, error: null }),
  }
  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => mockQuery,
  } as unknown as ReturnType<typeof createBrowserClient<Database>>
}
