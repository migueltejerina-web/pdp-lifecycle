/** PDP Lifecycle — extend as domains are added. */

export type AppRole = string;

export function isDemoRole(_userRole: AppRole | null): boolean {
  return false;
}

export function hasAppAccess(userRole: AppRole | null): boolean {
  return Boolean(userRole);
}
