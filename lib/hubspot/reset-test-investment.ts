import "server-only";

import {
  HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY,
  HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
  HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY,
  HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY,
  HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_PROPERTY,
  HUBSPOT_DEAL_IR_FINAL_CONTRACT_SIGNED_PROPERTY,
  HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY,
  HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_FUNDS_PROVISION_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY,
  HUBSPOT_DEAL_POA_STATUS_PROPERTY,
  HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY,
  HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY,
  HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY,
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY,
  HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";

export type ResetTestInvestmentTarget = "arras_firma_contrato" | "arras_reservado";

export interface ResetTestInvestmentInput {
  dealId: string;
  listingId: string;
  target?: ResetTestInvestmentTarget;
}

export interface ResetTestInvestmentResult {
  dealId: string;
  listingId: string;
  target: ResetTestInvestmentTarget;
  clearedDealProperties: string[];
  clearedListingProperties: string[];
}

/** Uploaded files + TECH URL fields on the deal (cleared on every reset). */
const DEAL_FILE_CLEAR_PROPERTIES: Record<string, string> = {
  [HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY]: "",
  tech_contract_attachment_urls: "",
  [HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY]: "",
  arras_receipt_url: "",
  tech_arras_receipt_urls: "",
  [HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY]: "",
  [HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY]: "",
  [HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY]: "",
  [HUBSPOT_DEAL_COMPANY_DEED_PROPERTY]: "",
  [HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY]: "",
  [HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY]: "",
  [HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY]: "",
  [HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY]: "",
  [HUBSPOT_DEAL_IR_FINAL_CONTRACT_SIGNED_PROPERTY]: "",
};

/** Escritura workflow fields reset so a new E2E run starts clean after arras. */
const DEAL_WORKFLOW_RESET_PROPERTIES: Record<string, string> = {
  [HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY]: "",
  [HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY]: "pending",
  [HUBSPOT_DEAL_PAYMENT_STATUS_FUNDS_PROVISION_PROPERTY]: "pending",
  [HUBSPOT_DEAL_PAYMENT_STATUS_EXCHANGE_PROPERTY]: "pending",
  payment_status_appraisal: "pending",
  valuation: "Not done",
  [HUBSPOT_DEAL_FEIN_SIGNATURE_PROPERTY]: "",
  [HUBSPOT_DEAL_POA_STATUS_PROPERTY]: "",
  real_settlement_date: "",
  notary_appointment: "",
  notary_name: "",
  ir_signature_of_final_contract_proof_of_final_payments: "",
};

const LISTING_FILE_CLEAR_PROPERTIES: Record<string, string> = {
  [HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY]: "",
  [HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY]: "",
};

const ARRAS_RESERVADO_LISTING_PROPERTIES: Record<string, string> = {
  [HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY]: "Available",
  [HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY]: "",
};

const ARRAS_RESERVADO_DEAL_PROPERTIES: Record<string, string> = {
  last_envelope_docusign_status_update: "",
  date_contract_sent: "",
  docusign_trigger: "",
};

function buildArrasFirmaContratoProperties(now: Date): {
  deal: Record<string, string>;
  listing: Record<string, string>;
} {
  return {
    deal: {
      date_contract_sent: now.toISOString(),
      last_envelope_docusign_status_update: "envelope-sent",
      docusign_trigger: "",
    },
    listing: {
      [HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY]: "Blocked",
      [HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY]: String(now.getTime()),
    },
  };
}

function buildResetProperties(target: ResetTestInvestmentTarget): {
  deal: Record<string, string>;
  listing: Record<string, string>;
} {
  const now = new Date();

  const deal = {
    ...DEAL_FILE_CLEAR_PROPERTIES,
    ...DEAL_WORKFLOW_RESET_PROPERTIES,
    ...(target === "arras_reservado" ? ARRAS_RESERVADO_DEAL_PROPERTIES : {}),
    ...(target === "arras_firma_contrato" ? buildArrasFirmaContratoProperties(now).deal : {}),
  };

  const listing = {
    ...LISTING_FILE_CLEAR_PROPERTIES,
    ...(target === "arras_reservado" ? ARRAS_RESERVADO_LISTING_PROPERTIES : {}),
    ...(target === "arras_firma_contrato" ? buildArrasFirmaContratoProperties(now).listing : {}),
  };

  return { deal, listing };
}

export async function resetTestInvestmentHubSpot(
  input: ResetTestInvestmentInput
): Promise<ResetTestInvestmentResult> {
  if (!isHubSpotConfigured()) {
    throw new Error("HUBSPOT_PRIVATE_APP_TOKEN is not configured");
  }

  const target = input.target ?? "arras_firma_contrato";
  const { deal, listing } = buildResetProperties(target);

  await hubSpotFetch(`/crm/v3/objects/deals/${input.dealId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: deal }),
  });

  await hubSpotFetch(`/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${input.listingId}`, {
    method: "PATCH",
    body: JSON.stringify({ properties: listing }),
  });

  return {
    dealId: input.dealId,
    listingId: input.listingId,
    target,
    clearedDealProperties: Object.keys(deal),
    clearedListingProperties: Object.keys(listing),
  };
}
