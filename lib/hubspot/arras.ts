import "server-only";

import {
  HUBSPOT_DEAL_ARRAS_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_PROPERTIES,
  HUBSPOT_DEAL_SENAL_PROPERTY,
  HUBSPOT_LISTING_ARRAS_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_PAYMENT_PROPERTIES,
  HUBSPOT_LISTING_SENAL_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

interface AssociationsResponse {
  results?: Array<{ toObjectId: string | number }>;
}

function parseAmount(raw: string | null | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const normalized = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseListingPayments(
  properties: Record<string, string | null | undefined>
): { arrasAmount: number | null; senalAmount: number | null } {
  return {
    arrasAmount: parseAmount(properties[HUBSPOT_LISTING_ARRAS_PROPERTY]),
    senalAmount: parseAmount(properties[HUBSPOT_LISTING_SENAL_PROPERTY]),
  };
}

function parseDealPayments(
  properties: Record<string, string | null | undefined>
): { arrasAmount: number | null; senalAmount: number | null } {
  return {
    arrasAmount: parseAmount(properties[HUBSPOT_DEAL_ARRAS_PROPERTY]),
    senalAmount: parseAmount(properties[HUBSPOT_DEAL_SENAL_PROPERTY]),
  };
}

function hasAnyPaymentAmount(amounts: {
  arrasAmount: number | null;
  senalAmount: number | null;
}): boolean {
  return amounts.arrasAmount != null || amounts.senalAmount != null;
}

async function getListingPayments(listingId: string) {
  const listing = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}?properties=${HUBSPOT_LISTING_PAYMENT_PROPERTIES}`
  );
  return parseListingPayments(listing.properties);
}

async function getAssociatedListingIdsForDeal(dealId: string): Promise<string[]> {
  const associations = await hubSpotFetch<AssociationsResponse>(
    `/crm/v4/objects/deals/${dealId}/associations/${HUBSPOT_LISTING_OBJECT_TYPE}`
  );
  return (associations.results ?? []).map((row) => String(row.toObjectId));
}

async function resolveListingPaymentsForDeal(dealId: string): Promise<{
  listingId?: string;
  amounts: { arrasAmount: number | null; senalAmount: number | null };
}> {
  const listingIds = await getAssociatedListingIdsForDeal(dealId);
  if (!listingIds.length) {
    return { amounts: { arrasAmount: null, senalAmount: null } };
  }

  let fallbackListingId = listingIds[0];
  let fallbackAmounts: { arrasAmount: number | null; senalAmount: number | null } = {
    arrasAmount: null,
    senalAmount: null,
  };

  for (const listingId of listingIds) {
    const amounts = await getListingPayments(listingId);
    if (hasAnyPaymentAmount(amounts)) {
      return { listingId, amounts };
    }
    if (fallbackAmounts.arrasAmount == null && fallbackAmounts.senalAmount == null) {
      fallbackListingId = listingId;
      fallbackAmounts = amounts;
    }
  }

  return { listingId: fallbackListingId, amounts: fallbackAmounts };
}

async function getDealPaymentRollups(dealId: string) {
  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_PAYMENT_PROPERTIES}`
  );
  return parseDealPayments(deal.properties);
}

export interface PaymentAmountsResult {
  arrasAmount?: number;
  senalAmount?: number;
  source: "listing" | "deal_rollup";
  listingId?: string;
  dealId?: string;
}

function toPaymentAmountsResult(
  amounts: { arrasAmount: number | null; senalAmount: number | null },
  source: PaymentAmountsResult["source"],
  ids: { listingId?: string; dealId?: string }
): PaymentAmountsResult | null {
  if (!hasAnyPaymentAmount(amounts)) return null;

  return {
    ...(amounts.arrasAmount != null ? { arrasAmount: amounts.arrasAmount } : {}),
    ...(amounts.senalAmount != null ? { senalAmount: amounts.senalAmount } : {}),
    source,
    ...ids,
  };
}

/**
 * Resolves payment amounts for an investor opportunity (deal):
 * 1. Listing associated to the deal → `senal_to_be_collected` + `arras_to_be_collected`
 * 2. Fallback → deal rollups from listings
 */
export async function getPaymentAmountsForDeal(
  dealId: string
): Promise<PaymentAmountsResult | null> {
  if (!isHubSpotConfigured()) return null;

  const { listingId, amounts: fromListing } = await resolveListingPaymentsForDeal(dealId);
  const listingResult = toPaymentAmountsResult(fromListing, "listing", {
    listingId,
    dealId,
  });
  if (listingResult) return listingResult;

  const fromDeal = await getDealPaymentRollups(dealId);
  return toPaymentAmountsResult(fromDeal, "deal_rollup", {
    listingId,
    dealId,
  });
}

export async function getPaymentAmountsForListing(
  listingId: string
): Promise<PaymentAmountsResult | null> {
  if (!isHubSpotConfigured()) return null;

  const amounts = await getListingPayments(listingId);
  return toPaymentAmountsResult(amounts, "listing", { listingId });
}

/** @deprecated Use getPaymentAmountsForDeal */
export async function getArrasToBeCollectedForDeal(dealId: string) {
  const result = await getPaymentAmountsForDeal(dealId);
  if (!result?.arrasAmount) return null;
  return {
    arrasAmount: result.arrasAmount,
    source: result.source,
    listingId: result.listingId,
    dealId: result.dealId,
  };
}

/** @deprecated Use getPaymentAmountsForListing */
export async function getArrasToBeCollectedForListing(listingId: string) {
  const result = await getPaymentAmountsForListing(listingId);
  if (!result?.arrasAmount) return null;
  return {
    arrasAmount: result.arrasAmount,
    source: result.source,
    listingId: result.listingId,
  };
}
