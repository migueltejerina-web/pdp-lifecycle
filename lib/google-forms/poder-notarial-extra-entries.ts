import "server-only";

import { config } from "@/lib/config/environment";

/** Known entry IDs from the live Google Form. */
const DEFAULT_EXTRA_ENTRY_IDS = {
  purpose: "entry.688842630",
  profession: "entry.937127990",
  maritalStatus: "entry.1384903208",
  economicRegime: "entry.1696324008",
  economicRegimeOther: "entry.1696324008.other_option_response",
  buyingAlone: "",
  ownershipPercentage: "",
  buyerType: "entry.197513225",
  essentialCompanyAsset: "entry.466967231",
  notaSimpleFile: "",
} as const;

export type PoderNotarialExtraEntryKey = keyof typeof DEFAULT_EXTRA_ENTRY_IDS;

export const PODER_NOTARIAL_FORM_PURPOSE_VALUE = "Comprar";

function parseExtraEntryMap(raw: string): Partial<Record<PoderNotarialExtraEntryKey, string>> {
  if (!raw.trim()) return {};

  try {
    const parsed = JSON.parse(raw) as Partial<Record<PoderNotarialExtraEntryKey, string>>;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

export function getPoderNotarialExtraEntryIds(): Record<PoderNotarialExtraEntryKey, string> {
  const fromEnv = parseExtraEntryMap(config.poderNotarialForm.extraEntryMapJson);

  return {
    ...DEFAULT_EXTRA_ENTRY_IDS,
    ...fromEnv,
  };
}
