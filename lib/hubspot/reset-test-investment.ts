import "server-only";

import {
  HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY,
  HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY,
  HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY,
  HUBSPOT_LISTING_ARRAS_PROPERTY,
  HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY,
  HUBSPOT_LISTING_COLLECTION_DATE_PROPERTY,
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY,
  HUBSPOT_LISTING_FINAL_TOTAL_PRICE_PROPERTY,
  HUBSPOT_LISTING_INITIAL_INVESTMENT_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_PRICE_PROPERTY,
  HUBSPOT_LISTING_RENT_PER_MONTH_PROPERTY,
  HUBSPOT_LISTING_SENAL_PROPERTY,
  HUBSPOT_LISTING_YIELD_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";

export interface ResetTestInvestmentInput {
  dealId: string;
  listingId: string;
}

export interface ResetTestInvestmentResult {
  dealId: string;
  listingId: string;
  clearedDealProperties: string[];
  clearedListingProperties: string[];
}

const DEAL_RESET_PROPERTIES: Record<string, string> = {
  [HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY]: "",
  tech_contract_attachment_urls: "",
  [HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY]: "",
  arras_receipt_url: "",
  tech_arras_receipt_urls: "",
  [HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY]: "",
  [HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY]: "",
  last_envelope_docusign_status_update: "",
  date_contract_sent: "",
  docusign_trigger: "",
};

const LISTING_RESET_PROPERTIES: Record<string, string> = {
  [HUBSPOT_LISTING_ARRAS_PROPERTY]: "",
  [HUBSPOT_LISTING_SENAL_PROPERTY]: "",
  [HUBSPOT_LISTING_PRICE_PROPERTY]: "",
  [HUBSPOT_LISTING_INITIAL_INVESTMENT_PROPERTY]: "",
  [HUBSPOT_LISTING_YIELD_PROPERTY]: "",
  [HUBSPOT_LISTING_COLLECTION_DATE_PROPERTY]: "",
  [HUBSPOT_LISTING_FINAL_TOTAL_PRICE_PROPERTY]: "",
  [HUBSPOT_LISTING_RENT_PER_MONTH_PROPERTY]: "",
  [HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY]: "",
  [HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY]: "Available",
};

export async function resetTestInvestmentHubSpot(
  input: ResetTestInvestmentInput
): Promise<ResetTestInvestmentResult> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  await hubSpotFetch(`/crm/v3/objects/deals/${input.dealId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: DEAL_RESET_PROPERTIES }),
  });

  await hubSpotFetch(`/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${input.listingId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: LISTING_RESET_PROPERTIES }),
  });

  return {
    dealId: input.dealId,
    listingId: input.listingId,
    clearedDealProperties: Object.keys(DEAL_RESET_PROPERTIES),
    clearedListingProperties: Object.keys(LISTING_RESET_PROPERTIES),
  };
}
