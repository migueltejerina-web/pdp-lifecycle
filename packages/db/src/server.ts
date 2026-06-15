import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getClientEnv, getServerEnv, isDemoMode } from '@vistral/config'
import type { Database } from './types'

type CookieStore = {
  get(name: string): { value: string } | undefined
  set(name: string, value: string, options?: CookieOptions): void
}

/**
 * Creates the Supabase client used in Server Components, route handlers, and middleware.
 *
 * SECURITY: inside API routes, always call `supabase.auth.getUser()` (not getSession).
 * See `.cursor/rules/00-core.mdc` — getSession trusts the client cookie and can be
 * spoofed; getUser validates against the Supabase Auth server.
 *
 * Pass in the cookie store from next/headers so session persistence works.
 */
export function createSupabaseServerClient(cookies: CookieStore) {
  if (isDemoMode()) {
    // Server-side demo mode: return a shape that mirrors the browser mock.
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }),
      }),
    } as unknown as ReturnType<typeof createServerClient<Database>>
  }

  const { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } = getClientEnv()
  if (!NEXT_PUBLIC_SUPABASE_URL || !NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error('[@vistral/db] Missing Supabase public URL or anon key on server.')
  }

  return createServerClient<Database>(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => {
        try {
          cookies.set(name, value, options)
        } catch {
          // Route handlers called from a Server Component swallow cookie writes — fine.
        }
      },
      remove: (name, options) => {
        try {
          cookies.set(name, '', { ...options, maxAge: 0 })
        } catch {
          // ignore
        }
      },
    },
  })
}

/**
 * Returns true when this runtime has the service role key. Use ONLY inside API routes
 * and never expose it to client code. When false, callers should fall back to the
 * anon client via `createSupabaseServerClient`.
 */
export function hasServiceRole(): boolean {
  return Boolean(getServerEnv().SUPABASE_SERVICE_ROLE_KEY)
}
