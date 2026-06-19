import type { DocumentViewKind } from "./document-view.types";

const PROTECTED_HOST_SUFFIX = ".prophero.com";

/** URLs on PropHero infrastructure that require HTTP Basic auth (Portfolio API, etc.). */
export function requiresProtectedDocumentAuth(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith(PROTECTED_HOST_SUFFIX);
  } catch {
    return false;
  }
}

export function buildDocumentViewUrl(investmentId: string, kind: DocumentViewKind): string {
  return `/api/investments/${encodeURIComponent(investmentId)}/documents/${kind}`;
}

/** Returns a same-origin proxy URL when the remote file needs server-side auth. */
export function toViewableDocumentUrl(
  investmentId: string | undefined,
  rawUrl: string | null | undefined,
  kind: DocumentViewKind
): string | null {
  if (!rawUrl?.trim()) return null;
  const trimmed = rawUrl.trim();
  if (!investmentId || !requiresProtectedDocumentAuth(trimmed)) return trimmed;
  return buildDocumentViewUrl(investmentId, kind);
}
