/**
 * Parses one or more HTTP(S) URLs from HubSpot / Airtable text fields.
 * Supports newline, comma, and semicolon separators (same pattern as arras contract URLs).
 */
export function parseUrlListFromField(
  raw: string | null | undefined
): string[] {
  if (!raw?.trim()) return [];

  const seen = new Set<string>();
  const urls: string[] = [];

  for (const part of raw.split(/[\n,;]+/)) {
    const trimmed = part.trim();
    if (!trimmed.startsWith("http")) continue;
    if (seen.has(trimmed)) continue;
    seen.add(trimmed);
    urls.push(trimmed);
  }

  return urls;
}
