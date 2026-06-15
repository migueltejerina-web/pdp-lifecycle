import 'server-only'

import { SignJWT, jwtVerify, type JWTPayload } from 'jose'
import { getServerEnv } from '@vistral/config'
import type { UserRole } from '@vistral/types'

/**
 * Short-lived JWT used to hand off the current user to an external Vistral
 * app (Reno, Rentals, etc.) so that app can bootstrap a session without a second Auth0
 * round-trip. Fase E of the monorepo plan.
 *
 * Flow:
 *   1. User authenticates on the hub with Auth0.
 *   2. User clicks "Ir a Reno".
 *   3. Hub calls createSsoToken({ sub, email, roles }) and redirects to
 *      https://reno-prod.vercel.app/sso?token=<jwt>
 *   4. Reno's /sso endpoint calls verifySsoToken(token) and creates its own session.
 *
 * Security properties:
 *   - HS256 with AUTH0_SSO_SHARED_SECRET (32+ bytes). Rotate via Vercel env vars.
 *   - TTL defaults to 60s. Replay window kept tiny because tokens travel in query strings.
 *   - `aud` MUST match the target app slug so a token minted for Reno cannot be replayed on Rentals.
 */

const DEFAULT_TTL_SECONDS = 60

export interface SsoClaims {
  sub: string
  email?: string
  roles?: UserRole[]
}

export interface SsoTokenOptions {
  /** Target app slug — becomes the JWT `aud` claim. */
  audience: string
  /** Seconds until expiry. Default 60. Do not raise above 300 without a design review. */
  ttlSeconds?: number
}

export async function createSsoToken(claims: SsoClaims, options: SsoTokenOptions): Promise<string> {
  const secret = getSharedSecret()
  const ttl = Math.min(options.ttlSeconds ?? DEFAULT_TTL_SECONDS, 300)

  return new SignJWT({
    email: claims.email,
    roles: claims.roles ?? [],
  } satisfies JWTPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(claims.sub)
    .setAudience(options.audience)
    .setIssuer('vistral-hub')
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttl)
    .sign(secret)
}

export interface VerifiedSsoToken {
  sub: string
  email?: string
  roles: UserRole[]
  audience: string
}

export async function verifySsoToken(
  token: string,
  expectedAudience: string,
): Promise<VerifiedSsoToken> {
  const secret = getSharedSecret()
  const { payload } = await jwtVerify(token, secret, {
    issuer: 'vistral-hub',
    audience: expectedAudience,
  })

  if (!payload.sub) {
    throw new Error('[@vistral/auth] SSO token missing `sub`.')
  }

  const roles = Array.isArray(payload.roles)
    ? (payload.roles.filter((r) => typeof r === 'string') as UserRole[])
    : []

  return {
    sub: payload.sub,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    roles,
    audience: expectedAudience,
  }
}

function getSharedSecret(): Uint8Array {
  const { AUTH0_SSO_SHARED_SECRET } = getServerEnv()
  if (!AUTH0_SSO_SHARED_SECRET) {
    throw new Error(
      '[@vistral/auth] AUTH0_SSO_SHARED_SECRET is not set. Configure it in Vercel env for the hub and every external app before using createSsoToken/verifySsoToken.',
    )
  }
  return new TextEncoder().encode(AUTH0_SSO_SHARED_SECRET)
}
