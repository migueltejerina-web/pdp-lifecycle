import { z } from 'zod'

/**
 * Typed environment loader for every app spawned under `app/(apps)/<slug>/`.
 *
 * This is the ONLY place where process.env is read directly. Everything else must import
 * from here. That lets us (1) fail fast at boot if a required var is missing, and
 * (2) keep a single audit point for which vars exist per environment.
 *
 * Convention: only expose non-secret vars to the browser via NEXT_PUBLIC_*. Anything
 * secret (tokens, shared secrets, service keys) must stay unprefixed.
 */

const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Auth0 — required for the hub and any app that uses @vistral/auth
  AUTH0_DOMAIN: z.string().min(1).optional(),
  AUTH0_CLIENT_ID: z.string().min(1).optional(),
  AUTH0_CLIENT_SECRET: z.string().min(1).optional(),
  AUTH0_BASE_URL: z.string().url().optional(),
  AUTH0_SECRET: z.string().min(32).optional(),

  // Optional — used only by the Auth0 -> external-app SSO bridge (Fase E).
  AUTH0_SSO_SHARED_SECRET: z.string().min(32).optional(),

  // Supabase server-side (service role lives only in app/api or server code)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
})

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_SLUG: z.string().min(1).optional(),
})

type ServerEnv = z.infer<typeof serverSchema>
type ClientEnv = z.infer<typeof clientSchema>

let cachedServer: ServerEnv | undefined
let cachedClient: ClientEnv | undefined

export function getServerEnv(): ServerEnv {
  if (cachedServer) return cachedServer
  const parsed = serverSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(
      `[@vistral/config] invalid server env:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    )
  }
  cachedServer = parsed.data
  return cachedServer
}

export function getClientEnv(): ClientEnv {
  if (cachedClient) return cachedClient
  const raw = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_APP_SLUG: process.env.NEXT_PUBLIC_APP_SLUG,
  }
  const parsed = clientSchema.safeParse(raw)
  if (!parsed.success) {
    throw new Error(
      `[@vistral/config] invalid client env:\n${parsed.error.issues
        .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
        .join('\n')}`,
    )
  }
  cachedClient = parsed.data
  return cachedClient
}

/**
 * Returns true when the app is running without Supabase credentials (demo mode).
 * Callers must skip any Supabase call in this state.
 */
export function isDemoMode(): boolean {
  const { NEXT_PUBLIC_SUPABASE_URL } = getClientEnv()
  return !NEXT_PUBLIC_SUPABASE_URL
}
