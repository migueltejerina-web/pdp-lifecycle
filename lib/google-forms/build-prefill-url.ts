/**
 * Builds a Google Forms pre-filled URL.
 * @see https://support.google.com/docs/answer/2839588
 */
export function buildGoogleFormPrefillUrl(
  formUrl: string,
  fields: Record<string, string | undefined | null>
): string {
  const url = new URL(formUrl);

  if (!url.searchParams.has("usp")) {
    url.searchParams.set("usp", "pp_url");
  }

  for (const [entryId, value] of Object.entries(fields)) {
    const trimmed = value?.trim();
    if (!trimmed) continue;
    url.searchParams.set(entryId, trimmed);
  }

  return url.toString();
}
