import 'server-only'

import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import type { UserRole } from '@vistral/types'
import { getServerSession } from './session'

export interface RequireAuthProps {
  /** If set, only users with at least one of these roles may render children. */
  roles?: UserRole[]
  /** Where to send unauthenticated users. Defaults to the Auth0 login route. */
  loginPath?: string
  /** Where to send authenticated users who lack the required role. */
  forbiddenPath?: string
  children: ReactNode
}

/**
 * Server Component guard that redirects unauthenticated users to Auth0 login, and
 * role-forbidden users to `forbiddenPath`. Use on layouts or pages that require auth.
 *
 * Example:
 *   <RequireAuth roles={['investment_pm']}>
 *     <InvestmentDashboard />
 *   </RequireAuth>
 */
export async function RequireAuth({
  roles,
  loginPath = '/api/auth/login',
  forbiddenPath = '/',
  children,
}: RequireAuthProps) {
  const session = await getServerSession()

  if (!session) {
    redirect(loginPath)
  }

  if (roles && roles.length > 0) {
    const hasRole = session.roles.some((r) => roles.includes(r))
    if (!hasRole) {
      redirect(forbiddenPath)
    }
  }

  return <>{children}</>
}
