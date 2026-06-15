import 'server-only'

import type { UserRole } from '@vistral/types'

/**
 * Normalized Vistral session shape. Keep this minimal; apps that need richer profile
 * data should fetch it themselves keyed by `session.sub`.
 */
export interface VistralSession {
  sub: string
  email?: string
  name?: string
  picture?: string
  roles: UserRole[]
  raw: Record<string, unknown>
}

/**
 * Returns the current Auth0 session on the server, normalized to VistralSession.
 * Returns null when the caller is unauthenticated.
 *
 * Implementation note: we intentionally import @auth0/nextjs-auth0 lazily so that apps
 * that do NOT use Auth0 yet can still depend on @vistral/auth without crashing at boot.
 * When Auth0 is wired, swap this implementation to call `getSession()` from the SDK.
 */
export async function getServerSession(): Promise<VistralSession | null> {
  try {
    const mod = await import('@auth0/nextjs-auth0')
    // @ts-expect-error — getSession signature differs between v3 and v4; both return { user }.
    const session = (await mod.getSession?.()) ?? null
    if (!session?.user) return null

    const user = session.user as Record<string, unknown>
    const roles = extractRoles(user)

    return {
      sub: String(user.sub ?? ''),
      email: typeof user.email === 'string' ? user.email : undefined,
      name: typeof user.name === 'string' ? user.name : undefined,
      picture: typeof user.picture === 'string' ? user.picture : undefined,
      roles,
      raw: user,
    }
  } catch (err) {
    console.error('[@vistral/auth] getServerSession failed:', err)
    return null
  }
}

function extractRoles(user: Record<string, unknown>): UserRole[] {
  // Auth0 custom claims are namespaced. We accept either `https://vistral.io/roles` or
  // an unnamespaced `roles` claim so apps can work across Auth0 configurations.
  const candidates = [user['https://vistral.io/roles'], user.roles].filter(Boolean)
  const flat = candidates.flatMap((c) => (Array.isArray(c) ? c : [c]))
  return flat.filter((r): r is UserRole => typeof r === 'string') as UserRole[]
}
