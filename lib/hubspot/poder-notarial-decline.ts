import "server-only";

import {
  HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
  HUBSPOT_DEAL_POA_STATUS_PROPERTY,
  HUBSPOT_POA_STATUS_NOTARY_TO_BE_SCHEDULED,
  HUBSPOT_POA_STATUS_NOT_REQUIRED,
  HUBSPOT_POA_STATUS_TO_BE_DRAFTED,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

/** Values that mean the investor declined online PoA (sandbox reads `poa_status` only). */
const POA_DECLINED_STATUS_MARKERS = [
  HUBSPOT_POA_STATUS_NOT_REQUIRED.toLowerCase(),
  // Legacy values from earlier PDP iterations / prod previews
  "not needed",
  "done (not needed)",
] as const;

/** HubSpot values after the investor submitted the online form (awaiting PropHero). */
const POA_FORM_SUBMITTED_STATUS_MARKERS = [
  HUBSPOT_POA_STATUS_NOTARY_TO_BE_SCHEDULED.toLowerCase(),
  "awaiting execution with notary",
  "executed poa sent to notary (or physical copy obtained)",
] as const;

function hasCompanyDeed(properties: Record<string, string | null | undefined>): boolean {
  return Boolean(properties[HUBSPOT_DEAL_COMPANY_DEED_PROPERTY]?.trim());
}

export function isPoaFormSubmittedAwaitingContact(
  properties: Record<string, string | null | undefined>
): boolean {
  if (isPoaDeclinedByInvestor(properties) || hasCompanyDeed(properties)) {
    return false;
  }

  const poaStatus = properties[HUBSPOT_DEAL_POA_STATUS_PROPERTY]?.trim().toLowerCase();
  if (!poaStatus) return false;

  return POA_FORM_SUBMITTED_STATUS_MARKERS.some((marker) => poaStatus === marker);
}

export function isPoaDeclinedByInvestor(
  properties: Record<string, string | null | undefined>
): boolean {
  const poaStatus = properties[HUBSPOT_DEAL_POA_STATUS_PROPERTY]?.trim().toLowerCase();
  if (!poaStatus) return false;
  return POA_DECLINED_STATUS_MARKERS.some((marker) => poaStatus === marker);
}

export { PODER_NOTARIAL_DECLINED_DYNAMIC_VALUE } from "./poder-notarial-prefill.types";

export async function markPoaNotNeededForDeal(dealId: string): Promise<void> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_POA_STATUS_PROPERTY]: HUBSPOT_POA_STATUS_NOT_REQUIRED,
      },
    }),
  });
}

export async function resumePoaForDeal(dealId: string): Promise<void> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_POA_STATUS_PROPERTY]: HUBSPOT_POA_STATUS_TO_BE_DRAFTED,
      },
    }),
  });
}

export async function markPoaFormSubmittedForDeal(dealId: string): Promise<void> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_POA_STATUS_PROPERTY]: HUBSPOT_POA_STATUS_NOTARY_TO_BE_SCHEDULED,
      },
    }),
  });
}
