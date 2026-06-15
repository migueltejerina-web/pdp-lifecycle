import "server-only";

import {
  HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTIES,
  HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import {
  HUBSPOT_EXCHANGE_FEE_RECEIPT_UPLOAD_FOLDER,
  resolveHubSpotFileUrl,
  uploadFileToHubSpot,
} from "./files";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export interface ExchangeFeeReceiptInfo {
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

export async function getExchangeFeeReceiptForDeal(
  dealId: string
): Promise<ExchangeFeeReceiptInfo | null> {
  if (!isHubSpotConfigured()) return null;

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTIES}`
  );

  const receiptFileId = deal.properties[HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY] ?? null;
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

export function getMockExchangeFeeReceiptInfo(): ExchangeFeeReceiptInfo {
  return {
    uploaded: false,
    receiptUrl: null,
    receiptFileId: null,
    source: "mock",
  };
}

export async function uploadExchangeFeeReceiptForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<ExchangeFeeReceiptInfo> {
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
    folderPath: HUBSPOT_EXCHANGE_FEE_RECEIPT_UPLOAD_FOLDER,
  });

  const paymentDateExchange = new Date().toISOString().slice(0, 10);

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY]: uploaded.id,
        [HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY]: paymentDateExchange,
      },
    }),
  });

  const receipt = await getExchangeFeeReceiptForDeal(dealId);
  if (!receipt) {
    throw new Error("Failed to read exchange fee receipt after upload");
  }

  return receipt;
}
