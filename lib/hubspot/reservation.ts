import "server-only";

import type { ArrasContractSignedVia } from "./arras-contract";
import type { ContractSentSource } from "./docusign-signals";
import { getArrasContractForDeal, resolveArrasContractSigned } from "./arras-contract";
import { getArrasReceiptForDeal } from "./arras-receipt";
import { getExchangeFeeReceiptForDeal } from "./exchange-fee-receipt";
import {
  HUBSPOT_DEAL_DOCUSIGN_TRIGGER_PROPERTY,
  HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY,
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY,
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY_ALT,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_RESERVATION_PROPERTIES,
  RESERVATION_BLOCK_HOURS,
  type HubSpotDocuSignListingStatus,
} from "./constants";
import { getReservedListingIdForDeal } from "./listing-associations";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { isSigningDeadlineExpired, resolveSigningExpiresAt } from "@/utils/signing-deadline";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export type ReservationUiStatus =
  | "available"
  | "blocked"
  | "signed"
  | "blocked_by_ph"
  | "coming_soon";

export interface ReservationStatusResult {
  docusignStatus: HubSpotDocuSignListingStatus | null;
  blockedForInvestor: string | null;
  blockedAt: string | null;
  envelopeStatus: string | null;
  arrasContractEnvelopeStatus: string | null;
  arrasContractUrl: string | null;
  arrasContractSent: boolean;
  arrasContractSentAt: string | null;
  arrasContractSigningExpiresAt: string | null;
  arrasContractSentSource: ContractSentSource;
  arrasContractSigned: boolean;
  arrasContractSignedVia: ArrasContractSignedVia;
  arrasReceiptUploaded: boolean;
  arrasReceiptUrl: string | null;
  exchangeFeeReceiptUploaded: boolean;
  exchangeFeeReceiptUrl: string | null;
  uiStatus: ReservationUiStatus;
  isClickable: boolean;
  blockExpiresAt: string | null;
  blockHoursRemaining: number | null;
  listingId?: string;
  dealId?: string;
  source: "hubspot" | "mock";
}

function readDocuSignStatus(
  properties: Record<string, string | null | undefined>
): HubSpotDocuSignListingStatus | null {
  const raw =
    properties[HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY] ??
    properties[HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY_ALT];
  if (!raw) return null;
  return raw as HubSpotDocuSignListingStatus;
}

function parseBlockedForInvestor(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;

  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    const fromEpoch = new Date(Number(trimmed));
    if (!Number.isNaN(fromEpoch.getTime())) {
      return fromEpoch.toISOString();
    }
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  return null;
}

function resolveBlockedAt(
  docusignStatus: HubSpotDocuSignListingStatus | null,
  blockedForInvestor: string | null | undefined
): string | null {
  if (docusignStatus !== "Blocked") return null;
  return parseBlockedForInvestor(blockedForInvestor);
}

function computeBlockExpiry(blockedAt: string | null): {
  blockExpiresAt: string | null;
  blockHoursRemaining: number | null;
} {
  if (!blockedAt) {
    return { blockExpiresAt: null, blockHoursRemaining: null };
  }

  const blocked = new Date(blockedAt);
  if (Number.isNaN(blocked.getTime())) {
    return { blockExpiresAt: null, blockHoursRemaining: null };
  }

  const expiresAt = new Date(blocked.getTime() + RESERVATION_BLOCK_HOURS * 60 * 60 * 1000);
  const remainingMs = expiresAt.getTime() - Date.now();

  return {
    blockExpiresAt: expiresAt.toISOString(),
    blockHoursRemaining: remainingMs > 0 ? Math.ceil(remainingMs / (60 * 60 * 1000)) : 0,
  };
}

function resolveEffectiveUiStatus(params: {
  docusignStatus: HubSpotDocuSignListingStatus | null;
  arrasContractSigned: boolean;
  arrasContractSent: boolean;
  signingExpiresAt: string | null;
}): ReservationUiStatus {
  if (params.arrasContractSigned || params.docusignStatus === "Signed") {
    return "signed";
  }

  // Firma phase: listing stays Blocked for 48h; if no signed contract, release to Available.
  if (
    params.arrasContractSent &&
    isSigningDeadlineExpired(params.signingExpiresAt)
  ) {
    return "available";
  }

  if (params.docusignStatus === "Blocked by PH") return "blocked_by_ph";
  if (params.docusignStatus === "Coming Soon") return "coming_soon";
  if (params.docusignStatus === "Blocked") return "blocked";
  return "available";
}

function buildReservationResult(
  listing: HubSpotObjectResponse,
  dealId?: string,
  contractContext?: Awaited<ReturnType<typeof getArrasContractForDeal>>,
  receiptContext?: Awaited<ReturnType<typeof getArrasReceiptForDeal>>,
  exchangeFeeReceiptContext?: Awaited<ReturnType<typeof getExchangeFeeReceiptForDeal>>
): ReservationStatusResult {
  const docusignStatus = readDocuSignStatus(listing.properties);
  const blockedForInvestor =
    listing.properties[HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY] ?? null;
  const blockedAt = resolveBlockedAt(docusignStatus, blockedForInvestor);
  const listingEnvelopeStatus = listing.properties.last_envelope_docusign__from_deals_ ?? null;

  const contractSigned = resolveArrasContractSigned({
    listingDocuSignStatus: docusignStatus,
    listingEnvelopeStatus,
    dealEnvelopeStatus: contractContext?.envelopeStatus ?? null,
    arrasContractEnvelopeStatus: contractContext?.arrasContractEnvelopeStatus ?? null,
    contractAttachment: contractContext?.contractAttachment ?? null,
    contractAttachmentUrls: contractContext?.contractAttachmentUrls ?? null,
  });

  const arrasContractSigned = contractSigned.signed;
  const arrasContractSent = contractContext?.sent ?? false;
  const { blockExpiresAt, blockHoursRemaining } = computeBlockExpiry(blockedAt);
  const signingExpiresAt = resolveSigningExpiresAt(
    contractContext?.signingExpiresAt ?? null,
    blockExpiresAt
  );
  const uiStatus = resolveEffectiveUiStatus({
    docusignStatus,
    arrasContractSigned,
    arrasContractSent,
    signingExpiresAt,
  });

  return {
    docusignStatus,
    blockedForInvestor,
    blockedAt,
    envelopeStatus: contractContext?.envelopeStatus ?? listingEnvelopeStatus,
    arrasContractEnvelopeStatus: contractContext?.arrasContractEnvelopeStatus ?? null,
    arrasContractUrl: contractSigned.contractUrl ?? contractContext?.contractUrl ?? null,
    arrasContractSent,
    arrasContractSentAt: contractContext?.sentAt ?? null,
    arrasContractSigningExpiresAt: signingExpiresAt,
    arrasContractSentSource: contractContext?.sentSource ?? null,
    arrasContractSigned,
    arrasContractSignedVia: contractSigned.signedVia,
    arrasReceiptUploaded: receiptContext?.uploaded ?? false,
    arrasReceiptUrl: receiptContext?.receiptUrl ?? null,
    exchangeFeeReceiptUploaded: exchangeFeeReceiptContext?.uploaded ?? false,
    exchangeFeeReceiptUrl: exchangeFeeReceiptContext?.receiptUrl ?? null,
    uiStatus,
    isClickable: uiStatus === "available",
    blockExpiresAt,
    blockHoursRemaining,
    listingId: listing.id,
    dealId,
    source: "hubspot",
  };
}

export async function getReservationStatusForDeal(
  dealId: string
): Promise<ReservationStatusResult | null> {
  if (!isHubSpotConfigured()) return null;

  const reservedListingId = await getReservedListingIdForDeal(dealId);
  if (!reservedListingId) return null;

  return getReservationStatusForListing(reservedListingId, dealId);
}

export async function getReservationStatusForListing(
  listingId: string,
  dealId?: string
): Promise<ReservationStatusResult | null> {
  if (!isHubSpotConfigured()) return null;

  const listing = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}?properties=${HUBSPOT_LISTING_RESERVATION_PROPERTIES}`
  );

  const listingEnvelopeStatus = listing.properties.last_envelope_docusign__from_deals_ ?? null;
  const [contractContext, receiptContext, exchangeFeeReceiptContext] = await Promise.all([
    dealId ? getArrasContractForDeal(dealId, listingEnvelopeStatus) : null,
    dealId ? getArrasReceiptForDeal(dealId) : null,
    dealId ? getExchangeFeeReceiptForDeal(dealId) : null,
  ]);

  return buildReservationResult(
    listing,
    dealId,
    contractContext,
    receiptContext,
    exchangeFeeReceiptContext
  );
}

async function requestArrasContractSend(dealId: string): Promise<void> {
  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_DOCUSIGN_TRIGGER_PROPERTY]: "true",
      },
    }),
  });
}

export async function blockListingForInvestor(
  listingId: string,
  dealId?: string
): Promise<ReservationStatusResult> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  const blockedAt = new Date().toISOString();

  await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        properties: {
          [HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY]: "Blocked",
          [HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY]: blockedAt,
        },
      }),
    }
  );

  if (dealId) {
    await requestArrasContractSend(dealId);
  }

  const result = await getReservationStatusForListing(listingId, dealId);
  if (!result) {
    throw new Error("Failed to read reservation status after update");
  }

  return result;
}

export function getMockReservationStatus(): ReservationStatusResult {
  return {
    docusignStatus: "Available",
    blockedForInvestor: null,
    blockedAt: null,
    envelopeStatus: null,
    arrasContractEnvelopeStatus: null,
    arrasContractUrl: null,
    arrasContractSent: false,
    arrasContractSentAt: null,
    arrasContractSigningExpiresAt: null,
    arrasContractSentSource: null,
    arrasContractSigned: false,
    arrasContractSignedVia: null,
    arrasReceiptUploaded: false,
    arrasReceiptUrl: null,
    exchangeFeeReceiptUploaded: false,
    exchangeFeeReceiptUrl: null,
    uiStatus: "available",
    isClickable: true,
    blockExpiresAt: null,
    blockHoursRemaining: null,
    source: "mock",
  };
}
