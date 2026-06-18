import "server-only";

import {
  HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY,
  HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY,
  HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { resolveHubSpotFileUrl } from "./files";
import { getReservedListingIdForDeal } from "./listing-associations";
import { parseUrlListFromField } from "./parse-url-list";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

const LISTING_NOTA_SIMPLE_PROPERTIES = [
  HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY,
  HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY,
].join(",");

export function buildNotaSimpleProxyUrl(investmentId: string, index: number): string {
  return `/api/investments/${encodeURIComponent(investmentId)}/nota-simple?index=${index}`;
}

export function buildNotaSimpleProxyUrls(
  investmentId: string,
  documentCount: number
): string[] {
  return Array.from({ length: documentCount }, (_, index) =>
    buildNotaSimpleProxyUrl(investmentId, index)
  );
}

async function resolveHubSpotFileReference(
  raw: string | null | undefined
): Promise<string | null> {
  if (!raw?.trim()) return null;
  if (raw.trim().startsWith("http")) return raw.trim();
  return resolveHubSpotFileUrl(raw.trim());
}

export async function resolveNotaSimpleSourceUrls(params: {
  dealProperties: Record<string, string | null | undefined>;
  listingProperties?: Record<string, string | null | undefined> | null;
}): Promise<string[]> {
  const fromDeal = parseUrlListFromField(
    params.dealProperties[HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY]
  );

  const fromListingTech = parseUrlListFromField(
    params.listingProperties?.[HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY]
  );

  const combined = [...fromDeal, ...fromListingTech];
  const unique = [...new Set(combined)];

  if (unique.length > 0) return unique;

  const listingFileUrl = await resolveHubSpotFileReference(
    params.listingProperties?.[HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY]
  );
  if (listingFileUrl) return [listingFileUrl];

  const legacyUrl = await resolveHubSpotFileReference(
    params.dealProperties[HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY]
  );
  if (legacyUrl) return [legacyUrl];

  return [];
}

/**
 * Lifecycle step completion + "Ver nota simple" — TECH URLs only (listing + deal rollup).
 * Does not use Land registry doc (DD) file upload nor deal contract_simple_copy.
 */
export function resolveNotaSimpleTechUrlsForStep(params: {
  dealProperties: Record<string, string | null | undefined>;
  listingProperties?: Record<string, string | null | undefined> | null;
}): string[] {
  const fromDeal = parseUrlListFromField(
    params.dealProperties[HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY]
  );

  const fromListingTech = parseUrlListFromField(
    params.listingProperties?.[HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY]
  );

  return [...new Set([...fromDeal, ...fromListingTech])];
}

export async function getNotaSimpleTechUrlsForDeal(
  dealId: string,
  listingId?: string | null
): Promise<string[]> {
  if (!isHubSpotConfigured()) return [];

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY}`
  );

  const listingProperties = await getListingPropertiesForDeal(dealId, listingId);

  return resolveNotaSimpleTechUrlsForStep({
    dealProperties: deal.properties,
    listingProperties,
  });
}

async function getListingPropertiesForDeal(
  dealId: string,
  listingId?: string | null
): Promise<Record<string, string | null | undefined> | null> {
  const resolvedListingId = listingId ?? (await getReservedListingIdForDeal(dealId));
  if (!resolvedListingId) return null;

  const listing = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${resolvedListingId}?properties=${LISTING_NOTA_SIMPLE_PROPERTIES}`
  );

  return listing.properties;
}

export async function getNotaSimpleSourceUrlsForDeal(
  dealId: string,
  listingId?: string | null
): Promise<string[]> {
  if (!isHubSpotConfigured()) return [];

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY},${HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY}`
  );

  const listingProperties = await getListingPropertiesForDeal(dealId, listingId);

  return resolveNotaSimpleSourceUrls({
    dealProperties: deal.properties,
    listingProperties,
  });
}

export async function getNotaSimpleSourceUrlAtIndex(
  dealId: string,
  index: number,
  listingId?: string | null
): Promise<string | null> {
  const urls = await getNotaSimpleSourceUrlsForDeal(dealId, listingId);
  return urls[index] ?? null;
}

export async function getNotaSimpleTechUrlAtIndex(
  dealId: string,
  index: number,
  listingId?: string | null
): Promise<string | null> {
  const urls = await getNotaSimpleTechUrlsForDeal(dealId, listingId);
  return urls[index] ?? null;
}

export interface NotaSimpleAvailability {
  available: boolean;
  documentCount: number;
  /** Same-origin proxy URLs for viewing (when investmentId is provided). */
  viewUrls: string[];
}

export async function getNotaSimpleAvailabilityForDeal(
  dealId: string,
  options?: { listingId?: string | null; investmentId?: string }
): Promise<NotaSimpleAvailability> {
  const sourceUrls = await getNotaSimpleSourceUrlsForDeal(
    dealId,
    options?.listingId
  );

  const viewUrls =
    options?.investmentId && sourceUrls.length > 0
      ? buildNotaSimpleProxyUrls(options.investmentId, sourceUrls.length)
      : [];

  return {
    available: sourceUrls.length > 0,
    documentCount: sourceUrls.length,
    viewUrls,
  };
}
