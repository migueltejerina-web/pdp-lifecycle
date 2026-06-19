import "server-only";

import {
  HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
  HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY,
  HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { resolveHubSpotFileUrl, uploadFileToHubSpot } from "./files";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export interface DealFileAttachmentInfo {
  uploaded: boolean;
  fileUrl: string | null;
  fileId: string | null;
  source: "hubspot" | "mock";
}

const ALLOWED_FILE_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_FILE_BYTES = 10 * 1024 * 1024;

async function getDealFileAttachment(
  dealId: string,
  propertyName: string
): Promise<DealFileAttachmentInfo | null> {
  if (!isHubSpotConfigured()) return null;

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${propertyName}`
  );

  const fileId = deal.properties[propertyName] ?? null;
  const fileUrl = fileId?.trim() ? await resolveHubSpotFileUrl(fileId) : null;

  return {
    uploaded: Boolean(fileId?.trim() || fileUrl),
    fileUrl,
    fileId,
    source: "hubspot",
  };
}

async function uploadDealFileAttachment(
  dealId: string,
  propertyName: string,
  folderPath: string,
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<DealFileAttachmentInfo> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  if (!ALLOWED_FILE_MIME_TYPES.has(mimeType)) {
    throw new Error("Formato no permitido. Sube un PDF o una imagen (JPG, PNG).");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("El archivo supera el límite de 10 MB.");
  }

  const uploaded = await uploadFileToHubSpot({
    file,
    fileName,
    folderPath,
  });

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [propertyName]: uploaded.id,
      },
    }),
  });

  const attachment = await getDealFileAttachment(dealId, propertyName);
  if (!attachment) {
    throw new Error(`Failed to read ${propertyName} after upload`);
  }

  return attachment;
}

export function getMockDealFileAttachmentInfo(): DealFileAttachmentInfo {
  return {
    uploaded: false,
    fileUrl: null,
    fileId: null,
    source: "mock",
  };
}

export async function getCompanyDeedForDeal(dealId: string) {
  return getDealFileAttachment(dealId, HUBSPOT_DEAL_COMPANY_DEED_PROPERTY);
}

export async function uploadCompanyDeedForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
) {
  return uploadDealFileAttachment(
    dealId,
    HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
    "/pdp-lifecycle/escrituras/company-deed",
    file,
    fileName,
    mimeType
  );
}

export async function getFinalPaymentProofForDeal(dealId: string) {
  return getDealFileAttachment(dealId, HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY);
}

export async function uploadFinalPaymentProofForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
) {
  return uploadDealFileAttachment(
    dealId,
    HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY,
    "/pdp-lifecycle/escrituras/final-payment",
    file,
    fileName,
    mimeType
  );
}

export async function getFeinSignatureDocForDeal(dealId: string) {
  return getDealFileAttachment(dealId, HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY);
}

export async function uploadFeinSignatureDocForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
) {
  return uploadDealFileAttachment(
    dealId,
    HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY,
    "/pdp-lifecycle/escrituras/fein",
    file,
    fileName,
    mimeType
  );
}

export async function uploadContractSimpleCopyForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
) {
  return uploadDealFileAttachment(
    dealId,
    HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY,
    "/pdp-lifecycle/escrituras/nota-simple",
    file,
    fileName,
    mimeType
  );
}
