import "server-only";

import { getArrasContractForDeal } from "./arras-contract";
import { getArrasReceiptForDeal } from "./arras-receipt";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import {
  HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY,
  HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY,
  HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY,
  HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY,
  HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY,
  HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY,
} from "./constants";
import { getExchangeFeeReceiptForDeal } from "./exchange-fee-receipt";
import { resolveDealFileUrl } from "./resolve-deal-file-url";
import { DocumentViewKind, type DocumentViewKind as DocumentViewKindType } from "@/lib/investments/document-view.types";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

export async function resolveDocumentSourceUrl(
  dealId: string,
  kind: DocumentViewKindType
): Promise<string | null> {
  if (!isHubSpotConfigured()) return null;

  switch (kind) {
    case DocumentViewKind.ArrasContract: {
      const contract = await getArrasContractForDeal(dealId);
      return contract?.contractUrl ?? null;
    }
    case DocumentViewKind.ArrasReceipt: {
      const receipt = await getArrasReceiptForDeal(dealId);
      return receipt?.receiptUrl ?? null;
    }
    case DocumentViewKind.ExchangeFeeReceipt: {
      const receipt = await getExchangeFeeReceiptForDeal(dealId);
      return receipt?.receiptUrl ?? null;
    }
    case DocumentViewKind.CompanyDeed: {
      const deal = await hubSpotFetch<HubSpotObjectResponse>(
        `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY},${HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY},${HUBSPOT_DEAL_COMPANY_DEED_PROPERTY},${HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY}`
      );
      const techPoaUrls = deal.properties[HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY];
      if (techPoaUrls?.trim()) {
        const first = techPoaUrls
          .split(/[\n,;]+/)
          .map((part) => part.trim())
          .find((part) => part.startsWith("http"));
        if (first) return first;
      }
      const fromPoa = await resolveDealFileUrl(
        deal.properties[HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY],
        null,
        deal.properties[HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY]
      );
      if (fromPoa) return fromPoa;
      return resolveDealFileUrl(
        deal.properties[HUBSPOT_DEAL_COMPANY_DEED_PROPERTY],
        null,
        deal.properties[HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY]
      );
    }
    case DocumentViewKind.FeinSignature: {
      const deal = await hubSpotFetch<HubSpotObjectResponse>(
        `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY},${HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY}`
      );
      return resolveDealFileUrl(
        deal.properties[HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY],
        null,
        deal.properties[HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY]
      );
    }
    case DocumentViewKind.FinalPaymentProof: {
      const deal = await hubSpotFetch<HubSpotObjectResponse>(
        `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY}`
      );
      return resolveDealFileUrl(
        deal.properties[HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY],
        null,
        null
      );
    }
    default:
      return null;
  }
}
