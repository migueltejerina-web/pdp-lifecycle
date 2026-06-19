import "server-only";

import { config, hasPortfolioApiCredentials } from "@/lib/config/environment";
import { requiresProtectedDocumentAuth } from "@/lib/investments/document-view-url";

export function isPortfolioApiUrl(url: string): boolean {
  return requiresProtectedDocumentAuth(url);
}

function buildPortfolioAuthHeader(): string | null {
  if (!hasPortfolioApiCredentials()) return null;
  const credentials = `${config.portfolio.username}:${config.portfolio.password}`;
  return `Basic ${Buffer.from(credentials).toString("base64")}`;
}

export interface RemoteDocumentPayload {
  buffer: ArrayBuffer;
  contentType: string;
}

export async function fetchRemoteDocument(url: string): Promise<RemoteDocumentPayload> {
  const headers: Record<string, string> = {};

  if (isPortfolioApiUrl(url)) {
    const auth = buildPortfolioAuthHeader();
    if (!auth) {
      throw new Error("Portfolio API credentials are not configured");
    }
    headers.Authorization = auth;
  }

  const response = await fetch(url, { headers, cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Document fetch failed (${response.status})`);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") ?? "application/pdf";

  return { buffer, contentType };
}
