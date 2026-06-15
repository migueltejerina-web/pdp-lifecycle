/**
 * Canonical list of app slugs for spawned apps under app/(apps)/.
 *
 * External apps live in other repos but still get a slug because the hub rewrites to them.
 * Internal apps live under apps/<slug>/ and the spawner adds them here on creation.
 */

export const EXTERNAL_APP_SLUGS = ['reno', 'rentals', 'settlements'] as const
export type ExternalAppSlug = (typeof EXTERNAL_APP_SLUGS)[number]

export const CURRENT_ROOT_APP_SLUGS = ['supply'] as const
export type CurrentRootAppSlug = (typeof CURRENT_ROOT_APP_SLUGS)[number]

export const INTERNAL_APP_SLUGS = [] as const
export type InternalAppSlug = (typeof INTERNAL_APP_SLUGS)[number]

export type AppSlug = ExternalAppSlug | CurrentRootAppSlug | InternalAppSlug

export const RESERVED_SLUGS = new Set<string>([
  'hub',
  'api',
  '_template',
  'admin',
  'login',
  'health',
])

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase())
}

export const SLUG_REGEX = /^[a-z][a-z0-9-]{1,30}$/

export function isValidSlug(slug: string): boolean {
  return SLUG_REGEX.test(slug) && !isReservedSlug(slug)
}
