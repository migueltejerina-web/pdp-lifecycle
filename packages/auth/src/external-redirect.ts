import 'server-only'

import { createSsoToken, type SsoClaims } from './sso'

/**
 * Known external app targets. Keep in sync with @vistral/types `EXTERNAL_APP_SLUGS`.
 *
 * Each entry is the production URL of the external app. For local / preview the
 * hub must override via env or a mapping table — out of scope for this helper.
 */
export const EXTERNAL_APP_ORIGINS: Record<string, string> = {
  reno: 'https://reno-prod.vercel.app',
  rentals: 'https://rentals-prod.vercel.app',
  settlements: 'https://settlements-prod.vercel.app',
  supply: 'https://pdp-lifecycle-prod.vercel.app',
}

export interface ExternalRedirectOptions {
  /** Target app slug — must exist in EXTERNAL_APP_ORIGINS. */
  slug: keyof typeof EXTERNAL_APP_ORIGINS | string
  /** Claims for the user being handed off (sub, email, roles). */
  claims: SsoClaims
  /**
   * Optional path to deep-link into on the target app (eg "/projects/123").
   * Defaults to "/".
   */
  targetPath?: string
  /** Token TTL in seconds. Defaults to 60. */
  ttlSeconds?: number
}

/**
 * Build a fully-qualified URL that sends the user to `https://<external-app>/sso?token=<jwt>&next=<targetPath>`.
 *
 * The external app must implement `/sso` using `verifySsoToken` from this same
 * package and then redirect to `next`.
 */
export async function buildExternalRedirectUrl(options: ExternalRedirectOptions): Promise<string> {
  const origin = EXTERNAL_APP_ORIGINS[options.slug]
  if (!origin) {
    throw new Error(
      `[@vistral/auth] Unknown external app slug "${options.slug}". Add it to EXTERNAL_APP_ORIGINS first.`,
    )
  }

  const token = await createSsoToken(options.claims, {
    audience: options.slug,
    ttlSeconds: options.ttlSeconds,
  })

  const url = new URL('/sso', origin)
  url.searchParams.set('token', token)
  if (options.targetPath) {
    url.searchParams.set('next', normalizePath(options.targetPath))
  }

  return url.toString()
}

function normalizePath(p: string): string {
  if (!p.startsWith('/')) return `/${p}`
  return p
}
