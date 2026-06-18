import { config } from "@/lib/config/environment";
import type { PoderNotarialPrefillValues } from "@/lib/hubspot/poder-notarial-prefill.types";

export type PoderNotarialPrefillField = keyof PoderNotarialPrefillValues;

export interface PoderNotarialFormConfig {
  formUrl: string;
  entryMap: Partial<Record<PoderNotarialPrefillField, string>>;
}

function parseEntryMap(raw: string): Partial<Record<PoderNotarialPrefillField, string>> {
  if (!raw.trim()) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<Record<PoderNotarialPrefillField, string>>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

export function getPoderNotarialFormConfig(): PoderNotarialFormConfig | null {
  const formUrl = config.poderNotarialForm.url.trim();
  const entryMap = parseEntryMap(config.poderNotarialForm.entryMapJson);

  if (!formUrl || Object.keys(entryMap).length === 0) {
    return null;
  }

  return { formUrl, entryMap };
}

export function mapPrefillValuesToEntries(
  config: PoderNotarialFormConfig,
  values: PoderNotarialPrefillValues
): Record<string, string> {
  const entries: Record<string, string> = {};

  for (const [field, entryId] of Object.entries(config.entryMap) as Array<
    [PoderNotarialPrefillField, string | undefined]
  >) {
    if (!entryId?.trim()) continue;
    const value = values[field];
    if (!value?.trim()) continue;
    entries[entryId.trim()] = value.trim();
  }

  return entries;
}
