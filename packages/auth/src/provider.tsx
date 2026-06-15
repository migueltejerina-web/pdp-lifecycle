'use client'

import type { ReactNode } from 'react'

/**
 * Client-side provider that wraps an app so child components can access the Auth0 session
 * via `useUser()` from `@auth0/nextjs-auth0`.
 *
 * IMPORTANT: this is deliberately a thin wrapper. Anything app-specific (role resolution,
 * cached profile, remembered route) belongs in the app's own provider that nests this one.
 */
export interface VistralAuthProviderProps {
  children: ReactNode
}

export function VistralAuthProvider({ children }: VistralAuthProviderProps) {
  // The @auth0/nextjs-auth0 v4 client provider is not required for server-rendered
  // session reads. Apps that need client-side session data should nest the SDK's
  // provider from `@auth0/nextjs-auth0/client` themselves. Keeping the prop here as a
  // seam so we can add a shared wrapper later without churning every app.
  return <>{children}</>
}
