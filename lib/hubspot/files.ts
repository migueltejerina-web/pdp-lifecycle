import "server-only";

const HUBSPOT_API_BASE = "https://api.hubapi.com";
const HUBSPOT_CONTRACT_UPLOAD_FOLDER = "/pdp-lifecycle/contracts";
const HUBSPOT_RECEIPT_UPLOAD_FOLDER = "/pdp-lifecycle/receipts";
const HUBSPOT_EXCHANGE_FEE_RECEIPT_UPLOAD_FOLDER = "/pdp-lifecycle/receipts/exchange-fee";

function getAccessToken(): string {
  const token = process.env.HUBSPOT_PRIVATE_APP_TOKEN?.trim();
  if (!token) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }
  return token;
}

interface HubSpotFileResponse {
  id: string;
  url?: string;
  defaultHostingUrl?: string;
  name?: string;
}

export async function uploadFileToHubSpot(params: {
  file: Blob;
  fileName: string;
  folderPath?: string;
}): Promise<HubSpotFileResponse> {
  const body = new FormData();
  body.append("file", params.file, params.fileName);
  body.append("options", JSON.stringify({ access: "PRIVATE" }));
  body.append(
    "folderPath",
    params.folderPath ?? HUBSPOT_CONTRACT_UPLOAD_FOLDER
  );
  body.append("fileName", params.fileName);

  const response = await fetch(`${HUBSPOT_API_BASE}/files/v3/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body,
    cache: "no-store",
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HubSpot file upload ${response.status}: ${errorBody}`);
  }

  return response.json() as Promise<HubSpotFileResponse>;
}

export {
  HUBSPOT_CONTRACT_UPLOAD_FOLDER,
  HUBSPOT_RECEIPT_UPLOAD_FOLDER,
  HUBSPOT_EXCHANGE_FEE_RECEIPT_UPLOAD_FOLDER,
};

export async function resolveHubSpotFileUrl(fileId: string): Promise<string | null> {
  const trimmed = fileId.trim();
  if (!trimmed || trimmed.startsWith("http")) return trimmed || null;

  const response = await fetch(`${HUBSPOT_API_BASE}/files/v3/files/${trimmed}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const file = (await response.json()) as HubSpotFileResponse;
  return file.url ?? file.defaultHostingUrl ?? null;
}
