import "server-only";

import {
  HUBSPOT_DEAL_ARRAS_CONTRACT_PROPERTIES,
  HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY,
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
  SIGNING_DEADLINE_HOURS,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { resolveHubSpotFileUrl, uploadFileToHubSpot } from "./files";
import {
  computeSigningExpiresAt,
  getContactDocuSignContext,
  resolveContractSentSignal,
  type ContractSentSource,
} from "./docusign-signals";
import { getReservedListingIdForDeal } from "./listing-associations";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export type ArrasContractSignedVia =
  | "docusign_envelope"
  | "hubspot_attachment"
  | "listing_status"
  | null;

export interface ArrasContractInfo {
  signed: boolean;
  sent: boolean;
  sentAt: string | null;
  signingExpiresAt: string | null;
  sentSource: ContractSentSource;
  signedVia: ArrasContractSignedVia;
  contractUrl: string | null;
  contractAttachmentUrls: string | null;
  envelopeStatus: string | null;
  arrasContractEnvelopeStatus: string | null;
  contractAttachment: string | null;
  source: "hubspot" | "mock";
}

const ENVELOPE_COMPLETED_MARKERS = ["envelope-completed", "envelope completed"];

function isEnvelopeCompleted(status: string | null | undefined): boolean {
  if (!status?.trim()) return false;
  const normalized = status.toLowerCase();
  return ENVELOPE_COMPLETED_MARKERS.some((marker) => normalized.includes(marker));
}

function parseContractUrl(
  attachmentUrls: string | null | undefined,
  attachment: string | null | undefined
): string | null {
  if (attachmentUrls?.trim()) {
    const first = attachmentUrls
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .find((part) => part.startsWith("http"));
    if (first) return first;
  }

  if (attachment?.trim()) {
    const trimmed = attachment.trim();
    if (trimmed.startsWith("http")) return trimmed;
  }

  return null;
}

async function resolveContractAttachmentUrl(
  attachmentUrls: string | null | undefined,
  attachment: string | null | undefined
): Promise<string | null> {
  const directUrl = parseContractUrl(attachmentUrls, attachment);
  if (directUrl) return directUrl;

  if (!attachment?.trim()) return null;
  return resolveHubSpotFileUrl(attachment);
}

export function resolveArrasContractSigned(params: {
  listingDocuSignStatus?: string | null;
  listingEnvelopeStatus?: string | null;
  dealEnvelopeStatus?: string | null;
  arrasContractEnvelopeStatus?: string | null;
  contractAttachment?: string | null;
  contractAttachmentUrls?: string | null;
  contractUrl?: string | null;
}): Pick<ArrasContractInfo, "signed" | "signedVia" | "contractUrl"> {
  const contractUrl =
    params.contractUrl ??
    parseContractUrl(params.contractAttachmentUrls, params.contractAttachment);

  if (params.listingDocuSignStatus === "Signed") {
    return { signed: true, signedVia: "listing_status", contractUrl };
  }

  if (
    isEnvelopeCompleted(params.arrasContractEnvelopeStatus) ||
    isEnvelopeCompleted(params.dealEnvelopeStatus) ||
    isEnvelopeCompleted(params.listingEnvelopeStatus)
  ) {
    return { signed: true, signedVia: "docusign_envelope", contractUrl };
  }

  if (contractUrl || params.contractAttachment?.trim()) {
    return { signed: true, signedVia: "hubspot_attachment", contractUrl };
  }

  return { signed: false, signedVia: null, contractUrl };
}

export async function getArrasContractForDeal(
  dealId: string,
  listingEnvelopeStatus?: string | null
): Promise<ArrasContractInfo | null> {
  if (!isHubSpotConfigured()) return null;

  const [deal, contactContext] = await Promise.all([
    hubSpotFetch<HubSpotObjectResponse>(
      `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_ARRAS_CONTRACT_PROPERTIES}`
    ),
    getContactDocuSignContext(dealId),
  ]);

  const envelopeStatus =
    deal.properties.last_envelope_docusign_status_update_sync ??
    deal.properties.last_envelope_docusign_status_update ??
    null;

  const contractAttachmentUrls = deal.properties.tech_contract_attachment_urls ?? null;
  const contractAttachment =
    deal.properties[HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY] ?? null;
  const contractUrl = await resolveContractAttachmentUrl(
    contractAttachmentUrls,
    contractAttachment
  );
  const coachUploadedContract = Boolean(
    contractAttachmentUrls?.trim() || contractAttachment?.trim()
  );

  const signed = resolveArrasContractSigned({
    dealEnvelopeStatus: envelopeStatus,
    arrasContractEnvelopeStatus: deal.properties.arras_contract_envelope_status ?? null,
    contractAttachment,
    contractAttachmentUrls,
    listingEnvelopeStatus,
    contractUrl,
  });

  const sentSignal = resolveContractSentSignal({
    listingEnvelopeStatus,
    dealEnvelopeStatus: envelopeStatus,
    arrasContractEnvelopeStatus: deal.properties.arras_contract_envelope_status ?? null,
    dealDateContractSent: deal.properties.date_contract_sent ?? null,
    dealLastDocusignUpdateSync: deal.properties.last_docusign_update_sync ?? null,
    contactEnvelopeStatus: contactContext?.envelopeStatus ?? null,
    contactLastDocusignUpdate: contactContext?.lastDocusignUpdate ?? null,
    contactEnvelopeType: contactContext?.envelopeType ?? null,
    coachUploadedContract,
  });

  const sent = signed.signed || sentSignal.sent;
  const signingExpiresAt = computeSigningExpiresAt(
    sentSignal.sentAt,
    SIGNING_DEADLINE_HOURS
  );

  return {
    ...signed,
    contractUrl: signed.contractUrl ?? contractUrl,
    sent,
    sentAt: sentSignal.sentAt,
    signingExpiresAt,
    sentSource: sentSignal.source,
    contractAttachmentUrls,
    envelopeStatus: sentSignal.envelopeStatus ?? envelopeStatus,
    arrasContractEnvelopeStatus: deal.properties.arras_contract_envelope_status ?? null,
    contractAttachment,
    source: "hubspot",
  };
}

export function getMockArrasContractInfo(): ArrasContractInfo {
  return {
    signed: false,
    sent: false,
    sentAt: null,
    signingExpiresAt: null,
    sentSource: null,
    signedVia: null,
    contractUrl: null,
    contractAttachmentUrls: null,
    envelopeStatus: null,
    arrasContractEnvelopeStatus: null,
    contractAttachment: null,
    source: "mock",
  };
}

const ALLOWED_CONTRACT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_CONTRACT_FILE_BYTES = 10 * 1024 * 1024;

export async function uploadContractAttachmentForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<ArrasContractInfo> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  if (!ALLOWED_CONTRACT_MIME_TYPES.has(mimeType)) {
    throw new Error("Formato no permitido. Sube un PDF o una imagen (JPG, PNG).");
  }

  if (file.size > MAX_CONTRACT_FILE_BYTES) {
    throw new Error("El archivo supera el límite de 10 MB.");
  }

  const uploaded = await uploadFileToHubSpot({
    file,
    fileName,
  });

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY]: uploaded.id,
      },
    }),
  });

  const listingId = await getReservedListingIdForDeal(dealId);
  if (listingId) {
    await hubSpotFetch<HubSpotObjectResponse>(
      `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          properties: {
            [HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY]: "Signed",
          },
        }),
      }
    );
  }

  const contract = await getArrasContractForDeal(dealId);
  if (!contract) {
    throw new Error("Failed to read contract after upload");
  }

  return contract;
}
