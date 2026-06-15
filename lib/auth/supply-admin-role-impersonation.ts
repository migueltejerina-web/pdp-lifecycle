/**
 * Supply admins can preview the app UI as another role (client-side only).
 * Server routes still enforce permissions from the real `user_roles` row.
 */

export const SUPPLY_ADMIN_ROLE_IMPERSONATION_STORAGE_KEY = "vistral_supply_admin_role_preview_v1";

/** Roles that can be selected in the "view as" menu (excludes supply_admin — clear preview = default admin). */
export const SUPPLY_ADMIN_IMPERSONATABLE_ROLES = [
  "supply_partner",
  "supply_analyst",
  "supply_lead",
  "scouter",
  "supply_project_analyst",
  "supply_project_lead",
  "renovator_analyst",
  "reno_lead",
  "legal",
  "settlement_analyst",
  "settlement_lead",
] as const;

export type SupplyAdminImpersonatableRole = (typeof SUPPLY_ADMIN_IMPERSONATABLE_ROLES)[number];

export function isSupplyAdminImpersonatableRole(value: string | null | undefined): value is SupplyAdminImpersonatableRole {
  if (!value) return false;
  return (SUPPLY_ADMIN_IMPERSONATABLE_ROLES as readonly string[]).includes(value);
}
