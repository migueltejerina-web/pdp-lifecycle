import "server-only";

import {
  HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTIES,
  HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import {
  HUBSPOT_RECEIPT_UPLOAD_FOLDER,
  resolveHubSpotFileUrl,
  uploadFileToHubSpot,
} from "./files";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export interface ArrasReceiptInfo {
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

function parseReceiptUrl(
  receiptUrl: string | null | undefined,
  receiptUrls: string | null | undefined
): string | null {
  if (receiptUrl?.trim().startsWith("http")) {
    return receiptUrl.trim();
  }

  if (receiptUrls?.trim()) {
    const first = receiptUrls
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .find((part) => part.startsWith("http"));
    if (first) return first;
  }

  return null;
}

async function resolveReceiptUrl(
  receiptFileId: string | null | undefined,
  receiptUrl: string | null | undefined,
  receiptUrls: string | null | undefined
): Promise<string | null> {
  const directUrl = parseReceiptUrl(receiptUrl, receiptUrls);
  if (directUrl) return directUrl;

  if (!receiptFileId?.trim()) return null;
  return resolveHubSpotFileUrl(receiptFileId);
}

export async function getArrasReceiptForDeal(dealId: string): Promise<ArrasReceiptInfo | null> {
  if (!isHubSpotConfigured()) return null;

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTIES}`
  );

  const receiptFileId = deal.properties[HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY] ?? null;
  const receiptUrl = await resolveReceiptUrl(
    receiptFileId,
    deal.properties.arras_receipt_url ?? null,
    deal.properties.tech_arras_receipt_urls ?? null
  );

  return {
    uploaded: Boolean(receiptFileId?.trim() || receiptUrl),
    receiptUrl,
    receiptFileId,
    source: "hubspot",
  };
}

export function getMockArrasReceiptInfo(): ArrasReceiptInfo {
  return {
    uploaded: false,
    receiptUrl: null,
    receiptFileId: null,
    source: "mock",
  };
}

export async function uploadArrasReceiptForDeal(
  dealId: string,
  file: Blob,
  fileName: string,
  mimeType: string
): Promise<ArrasReceiptInfo> {
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
    folderPath: HUBSPOT_RECEIPT_UPLOAD_FOLDER,
  });

  await hubSpotFetch<HubSpotObjectResponse>(`/crm/v3/objects/deals/${dealId}`, {
    method: "PATCH",
    body: JSON.stringify({
      properties: {
        [HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY]: uploaded.id,
      },
    }),
  });

  const receipt = await getArrasReceiptForDeal(dealId);
  if (!receipt) {
    throw new Error("Failed to read arras receipt after upload");
  }

  return receipt;
}
