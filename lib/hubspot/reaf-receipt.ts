import "server-only";

import {
  HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY,
  HUBSPOT_DEAL_REAF_RECEIPT_PROPERTIES,
  HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_FILE_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { resolveHubSpotFileUrl, uploadFileToHubSpot } from "./files";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export interface ReafReceiptInfo {
  uploaded: boolean;
  receiptUrl: string | null;
  receiptFileId: string | null;
  source: "hubspot" | "mock";
}

const ALLOWED_RECEIPT_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const MAX_RECEIPT_FILE_BYTES = 10 * 1024 * 1024;

const HUBSPOT_REAF_RECEIPT_UPLOAD_FOLDER = "/pdp-lifecycle/receipts/reaf";

export async function getReafReceiptForDeal(dealId: string): Promise<ReafReceiptInfo | null> {
  if (!isHubSpotConfigured()) return null;

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_REAF_RECEIPT_PROPERTIES}`
  );

  const receiptFileId = deal.properties[HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_FILE_PROPERTY] ?? null;
  const receiptUrl = receiptFileId?.trim()
    ? await resolveHubSpotFileUrl(receiptFileId)
    : null;

  return {
    uploaded: Boolean(receiptFileId?.trim() || receiptUrl),
    receiptUrl,
    receiptFileId,
    source: "hubspot",
  };
}

export function getMockReafReceiptInfo(): ReafReceiptInfo {
  return {
    uploaded: false,
    receiptUrl: null,
    receiptFileId: null,
    source: "mock",
  };
}

export async function uploadReafReceiptForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<ReafReceiptInfo> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  if (!ALLOWED_RECEIPT_MIME_TYPES.has(mimeType)) {
    throw new Error("Formato no permitido. Sube un PDF o una imagen (JPG, PNG).");
  }

  if (file.size > MAX_RECEIPT_FILE_BYTES) {
    throw new Error("El archivo supera el límite de 10 MB.");
  }

  const uploaded = await uploadFileToHubSpot({
    file,
    fileName,
    folderPath: HUBSPOT_REAF_RECEIPT_UPLOAD_FOLDER,
  });

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_FILE_PROPERTY]: uploaded.id,
        [HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY]: "paid",
      },
    }),
  });

  const receipt = await getReafReceiptForDeal(dealId);
  if (!receipt) {
    throw new Error("Failed to read REAF receipt after upload");
  }

  return receipt;
}
