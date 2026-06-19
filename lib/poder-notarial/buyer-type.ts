/** HubSpot / Google Form internal values (`main_contact_buyer_type__dropdown_`). */
export const BUYER_TYPE_MYSELF_VALUE = "Myself";

export const BUYER_TYPE_MYSELF_AND_SOMEONE_ELSE_VALUE = "Myself and someone else";

export const BUYER_TYPE_COMPANY_TRUST_VALUE = "A company/trust";

/** UI label for each buyer type value (Régimen de compra). */
export const BUYER_TYPE_DISPLAY_LABELS: Record<string, string> = {
  [BUYER_TYPE_MYSELF_VALUE]: "Persona física",
  [BUYER_TYPE_MYSELF_AND_SOMEONE_ELSE_VALUE]: "Copropiedad",
  [BUYER_TYPE_COMPANY_TRUST_VALUE]: "Sociedad",
};

/** Value sent to Google Forms for the régimen de compra question. */
export const BUYER_TYPE_GOOGLE_FORM_LABELS: Record<string, string> = {
  [BUYER_TYPE_MYSELF_VALUE]: "Persona física",
  [BUYER_TYPE_MYSELF_AND_SOMEONE_ELSE_VALUE]: "Copropiedad",
  [BUYER_TYPE_COMPANY_TRUST_VALUE]: "Sociedad",
};

export const BUYER_TYPE_SELECT_OPTIONS = [
  { value: BUYER_TYPE_MYSELF_VALUE, label: BUYER_TYPE_DISPLAY_LABELS[BUYER_TYPE_MYSELF_VALUE] },
  {
    value: BUYER_TYPE_MYSELF_AND_SOMEONE_ELSE_VALUE,
    label: BUYER_TYPE_DISPLAY_LABELS[BUYER_TYPE_MYSELF_AND_SOMEONE_ELSE_VALUE],
  },
  {
    value: BUYER_TYPE_COMPANY_TRUST_VALUE,
    label: BUYER_TYPE_DISPLAY_LABELS[BUYER_TYPE_COMPANY_TRUST_VALUE],
  },
] as const;

export type BuyerTypeSelectOption = (typeof BUYER_TYPE_SELECT_OPTIONS)[number];

export function getBuyerTypeDisplayLabel(value: string | undefined | null): string {
  if (!value?.trim()) return "";
  return BUYER_TYPE_DISPLAY_LABELS[value] ?? value;
}

export function mapBuyerTypeForGoogleForm(value: string | undefined | null): string | undefined {
  if (!value?.trim()) return undefined;
  return BUYER_TYPE_GOOGLE_FORM_LABELS[value] ?? value.trim();
}

export function isCompanyTrustBuyerType(value: string | undefined | null): boolean {
  return value?.trim() === BUYER_TYPE_COMPANY_TRUST_VALUE;
}

export function isMyselfAndSomeoneElseBuyerType(value: string | undefined | null): boolean {
  return value?.trim() === BUYER_TYPE_MYSELF_AND_SOMEONE_ELSE_VALUE;
}
