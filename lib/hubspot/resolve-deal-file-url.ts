import "server-only";

import { resolveHubSpotFileUrl } from "./files";

export function parseDirectUrl(
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
  if (attachment?.trim()?.startsWith("http")) return attachment.trim();
  return null;
}

export async function resolveDealFileUrl(
  fileId: string | null | undefined,
  urlField: string | null | undefined,
  techUrls: string | null | undefined
): Promise<string | null> {
  const directUrl = parseDirectUrl(techUrls, urlField);
  if (directUrl) return directUrl;
  if (!fileId?.trim()) return null;
  if (fileId.trim().startsWith("http")) return fileId.trim();
  return resolveHubSpotFileUrl(fileId);
}
