import "server-only";

import type { PoderNotarialFormValues } from "@/lib/poder-notarial/poder-notarial-form.schema";
import {
  isCompanyTrustBuyerType,
  isMyselfAndSomeoneElseBuyerType,
  mapBuyerTypeForGoogleForm,
} from "@/lib/poder-notarial/buyer-type";
import type { PoderNotarialFormConfig } from "./poder-notarial-form.config";
import {
  getPoderNotarialExtraEntryIds,
  PODER_NOTARIAL_FORM_PURPOSE_VALUE,
} from "./poder-notarial-extra-entries";

function setEntry(
  entries: Record<string, string>,
  entryId: string | undefined,
  value: string | undefined
) {
  if (!entryId?.trim() || !value?.trim()) return;
  entries[entryId.trim()] = value.trim();
}

export function mapPoderNotarialSubmissionToGoogleEntries(
  config: PoderNotarialFormConfig,
  values: PoderNotarialFormValues
): Record<string, string> {
  const extraEntryIds = getPoderNotarialExtraEntryIds();
  const entries: Record<string, string> = {};

  setEntry(entries, extraEntryIds.purpose, PODER_NOTARIAL_FORM_PURPOSE_VALUE);

  const prefillMap: Partial<Record<keyof PoderNotarialFormValues, string | undefined>> = {
    fullName: values.fullName,
    nif: values.nif,
    email: values.email,
    phone: values.phone,
    contactAddress: values.contactAddress,
    taxlandNumber: values.taxlandNumber,
  };

  for (const [field, entryId] of Object.entries(config.entryMap)) {
    const key = field as keyof typeof prefillMap;
    setEntry(entries, entryId, prefillMap[key]);
  }

  setEntry(entries, extraEntryIds.profession, values.profession);
  setEntry(entries, extraEntryIds.maritalStatus, values.maritalStatus);
  setEntry(entries, extraEntryIds.buyerType, mapBuyerTypeForGoogleForm(values.buyerType));

  if (isMyselfAndSomeoneElseBuyerType(values.buyerType)) {
    setEntry(entries, extraEntryIds.buyingAlone, values.buyingAlone);
    setEntry(entries, extraEntryIds.ownershipPercentage, values.ownershipPercentage);
  }

  if (isCompanyTrustBuyerType(values.buyerType)) {
    setEntry(entries, extraEntryIds.essentialCompanyAsset, values.essentialCompanyAsset);
  }

  if (values.economicRegime === "Otro") {
    setEntry(entries, extraEntryIds.economicRegime, "__other_option__");
    setEntry(entries, extraEntryIds.economicRegimeOther, values.economicRegimeOther);
  } else {
    setEntry(entries, extraEntryIds.economicRegime, values.economicRegime);
  }

  return entries;
}
