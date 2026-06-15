/**
 * High-level user roles surfaced by Auth0 and honored by the hub when filtering apps.
 *
 * The CURRENT supply app has its own finer-grained roles in `lib/auth/app-auth-provider`.
 * That system is not replaced — these roles are the superset that the hub consults first
 * to decide which apps a user can see.
 */
export const USER_ROLES = [
  'supply_pm',
  'supply_analyst',
  'reno_pm',
  'rentals_pm',
  'settlements_pm',
  'investment_pm',
  'gestoria_pm',
  'dashboard_viewer',
  'client_viewer',
  'admin',
] as const

export type UserRole = (typeof USER_ROLES)[number]
