import "server-only";

import { mockProperty } from "@/app/investments/[id]/mock/property.mock";

export interface InvestmentHubSpotRefs {
  investmentId: string;
  hubspotDealId?: string;
  hubspotListingId?: string;
}

/**
 * Temporary registry until investments are loaded from Supabase.
 * Maps route id → HubSpot deal/listing IDs for the assigned property.
 */
export function getInvestmentHubSpotRefs(investmentId: string): InvestmentHubSpotRefs | null {
  if (mockProperty.id !== investmentId) return null;

  return {
    investmentId,
    hubspotDealId: process.env.HUBSPOT_MOCK_DEAL_ID?.trim() || mockProperty.hubspotDealId,
    hubspotListingId:
      process.env.HUBSPOT_MOCK_LISTING_ID?.trim() || mockProperty.hubspotListingId,
  };
}
