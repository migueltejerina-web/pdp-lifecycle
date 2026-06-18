import "server-only";

import { BUYER_TYPE_SELECT_OPTIONS } from "@/lib/poder-notarial/buyer-type";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY } from "./constants";

interface HubSpotObjectResponse {
  properties: Record<string, string | null | undefined>;
}

export function getBuyerTypeSelectOptions() {
  return [...BUYER_TYPE_SELECT_OPTIONS];
}

export async function getDealBuyerType(dealId: string): Promise<string | undefined> {
  if (!isHubSpotConfigured()) return undefined;

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY}`
  );

  return deal.properties[HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY]?.trim() || undefined;
}

/** @deprecated Use getBuyerTypeSelectOptions — kept for API compatibility. */
export async function getBuyerTypeDropdownOptions(): Promise<string[]> {
  return getBuyerTypeSelectOptions().map((option) => option.value);
}
