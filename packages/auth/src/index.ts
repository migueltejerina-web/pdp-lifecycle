/**
 * @vistral/auth — Auth0 primitives for every app spawned under app/(apps)/<slug>.
 *
 * Auth0 is the source of truth for identity. This package wraps @auth0/nextjs-auth0 so that:
 *   - apps get the same session provider with zero config
 *   - guards can be shared across apps
 *   - the hub can mint short-lived SSO tokens to hand off to external apps (Fase E)
 *
 * The CURRENT supply app at the repo root still has its own AppAuthProvider that maps
 * Supabase sessions to roles. That system stays untouched; new apps use this package.
 */

export { VistralAuthProvider } from './provider'
export { RequireAuth } from './guard'
export { getServerSession, type VistralSession } from './session'
export {
  createSsoToken,
  verifySsoToken,
  type SsoClaims,
  type SsoTokenOptions,
  type VerifiedSsoToken,
} from './sso'
export {
  buildExternalRedirectUrl,
  EXTERNAL_APP_ORIGINS,
  type ExternalRedirectOptions,
} from './external-redirect'
