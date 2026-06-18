export const DocumentViewKind = {
  ArrasContract: "arras-contract",
  ArrasReceipt: "arras-receipt",
  ExchangeFeeReceipt: "exchange-fee-receipt",
  CompanyDeed: "company-deed",
  FeinSignature: "fein-signature",
  FinalPaymentProof: "final-payment-proof",
} as const;

export type DocumentViewKind = (typeof DocumentViewKind)[keyof typeof DocumentViewKind];

const DOCUMENT_VIEW_KIND_VALUES = new Set<string>(Object.values(DocumentViewKind));

export function isDocumentViewKind(value: string): value is DocumentViewKind {
  return DOCUMENT_VIEW_KIND_VALUES.has(value);
}
