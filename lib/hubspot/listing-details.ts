import "server-only";

import {
  HUBSPOT_DEAL_OPPORTUNITY_COLLECTION_DATE_PROPERTY,
  HUBSPOT_DEAL_OPPORTUNITY_INITIAL_INVESTMENT_PROPERTY,
  HUBSPOT_DEAL_OPPORTUNITY_PRICE_PROPERTY,
  HUBSPOT_DEAL_OPPORTUNITY_YIELD_PROPERTY,
  HUBSPOT_DEAL_SUMMARY_PROPERTIES,
  HUBSPOT_LISTING_COLLECTION_DATE_PROPERTY,
  HUBSPOT_LISTING_DETAIL_PROPERTIES,
  HUBSPOT_LISTING_FINAL_TOTAL_PRICE_PROPERTY,
  HUBSPOT_LISTING_INITIAL_INVESTMENT_PROPERTY,
  HUBSPOT_LISTING_RENT_PER_MONTH_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_PRICE_PROPERTY,
  HUBSPOT_LISTING_SUMMARY_PROPERTIES,
  HUBSPOT_LISTING_YIELD_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { getPaymentAmountsForDeal } from "./arras";
import { getReservedListingIdForDeal } from "./listing-associations";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

interface AssociationsResponse {
  results?: Array<{ toObjectId: string | number }>;
}

export interface ListingPropertyDetails {
  address?: string;
  city?: string;
  country?: string;
  name?: string;
  purchasePrice?: number;
  initialInvestment?: number;
  totalInvestment?: number;
  estimatedMonthlyRent?: number;
  summaryNetYield?: number;
  escriturasEstimadas?: string;
  listingId?: string;
  dealId?: string;
  source: "listing" | "mock";
}

function parseAmount(raw: string | null | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const normalized = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function parseYieldPercent(raw: string | null | undefined): number | null {
  const value = parseAmount(raw);
  if (value == null) return null;
  if (value > 0 && value <= 1) return value * 100;
  return value;
}

function formatSpanishDate(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined;

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function parseListingLocation(
  properties: Record<string, string | null | undefined>
): Pick<ListingPropertyDetails, "address" | "city" | "country" | "name"> {
  const address = properties.hs_address_1?.trim() || undefined;
  const city = properties.hs_city?.trim() || properties.hs_state_province?.trim() || undefined;
  const country = properties.hs_country?.trim() || undefined;
  const name = properties.hs_name?.trim() || undefined;

  return { address, city, country, name };
}

function parseListingSummaryMetrics(
  properties: Record<string, string | null | undefined>
): Pick<
  ListingPropertyDetails,
  "purchasePrice" | "initialInvestment" | "totalInvestment" | "estimatedMonthlyRent" | "summaryNetYield" | "escriturasEstimadas"
> {
  const purchasePrice = parseAmount(properties[HUBSPOT_LISTING_PRICE_PROPERTY]);
  const initialInvestment = parseAmount(properties[HUBSPOT_LISTING_INITIAL_INVESTMENT_PROPERTY]);
  const totalInvestment = parseAmount(properties[HUBSPOT_LISTING_FINAL_TOTAL_PRICE_PROPERTY]);
  const estimatedMonthlyRent = parseAmount(properties[HUBSPOT_LISTING_RENT_PER_MONTH_PROPERTY]);
  const summaryNetYield = parseYieldPercent(properties[HUBSPOT_LISTING_YIELD_PROPERTY]);
  const escriturasEstimadas = formatSpanishDate(
    properties[HUBSPOT_LISTING_COLLECTION_DATE_PROPERTY]
  );

  return {
    ...(purchasePrice != null ? { purchasePrice } : {}),
    ...(initialInvestment != null ? { initialInvestment } : {}),
    ...(totalInvestment != null ? { totalInvestment } : {}),
    ...(estimatedMonthlyRent != null ? { estimatedMonthlyRent } : {}),
    ...(summaryNetYield != null ? { summaryNetYield } : {}),
    ...(escriturasEstimadas ? { escriturasEstimadas } : {}),
  };
}

function parseDealSummaryMetrics(
  properties: Record<string, string | null | undefined>
): Pick<
  ListingPropertyDetails,
  "purchasePrice" | "initialInvestment" | "totalInvestment" | "estimatedMonthlyRent" | "summaryNetYield" | "escriturasEstimadas"
> {
  const purchasePrice =
    parseAmount(properties[HUBSPOT_DEAL_OPPORTUNITY_PRICE_PROPERTY]) ??
    parseAmount(properties.price__from_properties_);
  const initialInvestment = parseAmount(
    properties[HUBSPOT_DEAL_OPPORTUNITY_INITIAL_INVESTMENT_PROPERTY]
  );
  const totalInvestment = parseAmount(properties.final_total_price__from_properties_);
  const estimatedMonthlyRent = parseAmount(properties.rent__from_properties_);
  const summaryNetYield =
    parseYieldPercent(properties[HUBSPOT_DEAL_OPPORTUNITY_YIELD_PROPERTY]) ??
    parseYieldPercent(properties.yield__from_properties_);
  const escriturasEstimadas = formatSpanishDate(
    properties[HUBSPOT_DEAL_OPPORTUNITY_COLLECTION_DATE_PROPERTY]
  );

  return {
    ...(purchasePrice != null ? { purchasePrice } : {}),
    ...(initialInvestment != null ? { initialInvestment } : {}),
    ...(totalInvestment != null ? { totalInvestment } : {}),
    ...(estimatedMonthlyRent != null ? { estimatedMonthlyRent } : {}),
    ...(summaryNetYield != null ? { summaryNetYield } : {}),
    ...(escriturasEstimadas ? { escriturasEstimadas } : {}),
  };
}

function mergeSummaryMetrics(
  listingMetrics: Pick<
    ListingPropertyDetails,
    "purchasePrice" | "initialInvestment" | "totalInvestment" | "estimatedMonthlyRent" | "summaryNetYield" | "escriturasEstimadas"
  >,
  dealMetrics: Pick<
    ListingPropertyDetails,
    "purchasePrice" | "initialInvestment" | "totalInvestment" | "estimatedMonthlyRent" | "summaryNetYield" | "escriturasEstimadas"
  >
): Pick<
  ListingPropertyDetails,
  "purchasePrice" | "initialInvestment" | "totalInvestment" | "estimatedMonthlyRent" | "summaryNetYield" | "escriturasEstimadas"
> {
  return {
    purchasePrice: dealMetrics.purchasePrice ?? listingMetrics.purchasePrice,
    initialInvestment: dealMetrics.initialInvestment ?? listingMetrics.initialInvestment,
    totalInvestment: dealMetrics.totalInvestment ?? listingMetrics.totalInvestment,
    estimatedMonthlyRent: dealMetrics.estimatedMonthlyRent ?? listingMetrics.estimatedMonthlyRent,
    summaryNetYield: dealMetrics.summaryNetYield ?? listingMetrics.summaryNetYield,
    escriturasEstimadas: dealMetrics.escriturasEstimadas ?? listingMetrics.escriturasEstimadas,
  };
}

function hasAnyInvestmentDetail(details: ListingPropertyDetails): boolean {
  return Boolean(
    details.address ||
      details.city ||
      details.name ||
      details.purchasePrice != null ||
      details.initialInvestment != null ||
      details.totalInvestment != null ||
      details.estimatedMonthlyRent != null ||
      details.summaryNetYield != null ||
      details.escriturasEstimadas
  );
}

async function getAssociatedListingIdsForDeal(dealId: string): Promise<string[]> {
  const associations = await hubSpotFetch<AssociationsResponse>(
    `/crm/v4/objects/deals/${dealId}/associations/${HUBSPOT_LISTING_OBJECT_TYPE}`
  );
  return (associations.results ?? []).map((row) => String(row.toObjectId));
}

async function getDealSummaryMetrics(
  dealId: string
): Promise<
  Pick<
    ListingPropertyDetails,
    "purchasePrice" | "initialInvestment" | "totalInvestment" | "estimatedMonthlyRent" | "summaryNetYield" | "escriturasEstimadas"
  >
> {
  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_SUMMARY_PROPERTIES}`
  );
  return parseDealSummaryMetrics(deal.properties);
}

async function getListingInvestmentDetails(
  listingId: string
): Promise<Omit<ListingPropertyDetails, "dealId">> {
  const listing = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}?properties=${HUBSPOT_LISTING_DETAIL_PROPERTIES},${HUBSPOT_LISTING_SUMMARY_PROPERTIES}`
  );

  return {
    ...parseListingLocation(listing.properties),
    ...parseListingSummaryMetrics(listing.properties),
    listingId,
    source: "listing",
  };
}

async function resolveListingIdForDeal(dealId: string, preferredListingId?: string): Promise<string | null> {
  if (preferredListingId) return preferredListingId;

  const reservedListingId = await getReservedListingIdForDeal(dealId);
  if (reservedListingId) return reservedListingId;

  const associatedListingIds = await getAssociatedListingIdsForDeal(dealId);
  return associatedListingIds[0] ?? null;
}

async function getListingPropertyDetails(listingId: string): Promise<ListingPropertyDetails | null> {
  const details = await getListingInvestmentDetails(listingId);
  if (!hasAnyInvestmentDetail(details)) return null;
  return details;
}

export async function getListingPropertyDetailsForDeal(
  dealId: string,
  preferredListingId?: string
): Promise<ListingPropertyDetails | null> {
  if (!isHubSpotConfigured()) return null;

  const listingId = await resolveListingIdForDeal(dealId, preferredListingId);
  if (!listingId) return null;

  const [listingDetails, dealMetrics] = await Promise.all([
    getListingInvestmentDetails(listingId),
    getDealSummaryMetrics(dealId),
  ]);

  const details: ListingPropertyDetails = {
    ...listingDetails,
    ...mergeSummaryMetrics(listingDetails, dealMetrics),
    dealId,
  };

  if (!hasAnyInvestmentDetail(details)) return null;
  return details;
}

export async function getListingPropertyDetailsForListing(
  listingId: string
): Promise<ListingPropertyDetails | null> {
  if (!isHubSpotConfigured()) return null;

  const details = await getListingPropertyDetails(listingId);
  if (!details) return null;

  return details;
}

export async function getListingPropertyDetailsForInvestment(
  dealId?: string,
  listingId?: string
): Promise<ListingPropertyDetails | null> {
  if (!isHubSpotConfigured()) return null;

  if (listingId) {
    return getListingPropertyDetailsForListing(listingId);
  }

  if (dealId) {
    const paymentListingId = (await getPaymentAmountsForDeal(dealId))?.listingId;
    return getListingPropertyDetailsForDeal(dealId, paymentListingId);
  }

  return null;
}
