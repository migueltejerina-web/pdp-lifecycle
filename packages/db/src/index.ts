/**
 * @vistral/db — thin Supabase client wrappers for apps spawned under apps/<slug>.
 *
 * NOTE: the CURRENT supply app at the repo root has its own custom Supabase client
 * (see lib/supabase/*.ts) with a CORS-dev proxy. We intentionally do NOT re-export that
 * here — new apps don't need it and we want them to start from a clean, simple client.
 *
 * The dev Supabase project is shared across apps (tied to the `dev` branch). Each new
 * app either:
 *   - uses the shared tables (with RLS policies that check the caller's role), or
 *   - creates its own Postgres schema (e.g. `investment.*`) and owns migrations there.
 *
 * See `.cursor/rules/02-supabase.mdc` for schema ownership conventions.
 */

export { createSupabaseBrowserClient } from './browser'
export { createSupabaseServerClient } from './server'
export type { Database } from './types'
