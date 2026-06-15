/**
 * Placeholder for the generated Supabase types.
 *
 * The current supply app generates its own `lib/supabase/types.ts`. When we wire
 * `supabase gen types typescript` into the monorepo, the output should land here and
 * apps will consume it via `import type { Database } from '@vistral/db'`.
 *
 * Until that is wired, apps can declare their own narrow types locally; the shared
 * alias keeps imports stable across the codebase.
 */
export type Database = {
  public: {
    Tables: Record<string, unknown>
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
  }
}
