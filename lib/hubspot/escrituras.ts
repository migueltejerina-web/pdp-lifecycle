import "server-only";

import {
  HUBSPOT_DEAL_APPRAISAL_DATE_PROPERTY,
  HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
  HUBSPOT_DEAL_ESCRITURAS_PROPERTIES,
  HUBSPOT_DEAL_FEIN_DEADLINE_DATE_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_PROPERTY,
  HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY,
  HUBSPOT_DEAL_FUNDS_PROVISION_AMOUNT_PROPERTY,
  HUBSPOT_DEAL_IR_FINAL_CONTRACT_SIGNED_PROPERTY,
  HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY,
  HUBSPOT_DEAL_IR_SIGNATURE_FINAL_PROPERTY,
  HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY,
  HUBSPOT_DEAL_REAL_SETTLEMENT_DATE_PROPERTY,
  HUBSPOT_DEAL_SETTLEMENT_FEE_AMOUNT_PROPERTY,
  HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY,
  HUBSPOT_DEAL_NOTARY_APPOINTMENT_PROPERTY,
  HUBSPOT_DEAL_NOTARY_APPOINTMENT_SELECT_PROPERTY,
  HUBSPOT_DEAL_NOTARY_NAME_PROPERTY,
  HUBSPOT_DEAL_NOTARY_SELECTION_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_LINK_REAF_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_LINK_FUNDS_PROVISION_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_LINK_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_APPRAISAL_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_FUNDS_PROVISION_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY,
  HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_PROPERTY,
  HUBSPOT_DEAL_REAF_AMOUNT_PROPERTY,
  HUBSPOT_DEAL_REMAINING_NOTARY_PAYMENT_PROPERTY,
  HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY,
  HUBSPOT_DEAL_CLIENT_NOTARY_PROPERTY,
  HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY,
  HUBSPOT_DEAL_POA_STATUS_PROPERTY,
  HUBSPOT_DEAL_VALUATION_PROPERTY,
  HUBSPOT_LISTING_ESCRITURAS_CONTEXT_PROPERTIES,
  HUBSPOT_LISTING_REAL_ESTATE_AGENT_FEE_PROPERTY,
  HUBSPOT_LISTING_ARRAS_PROPERTY,
  HUBSPOT_LISTING_SENAL_PROPERTY,
  HUBSPOT_LISTING_PRICE_PROPERTY,
  HUBSPOT_LISTING_REMAINING_NOTARY_PAYMENT_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
} from "./constants";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import { buildPoderNotarialFormUrl } from "./poder-notarial-prefill";
import {
  isPoaDeclinedByInvestor,
  isPoaFormSubmittedAwaitingContact,
} from "./poder-notarial-decline";
import { PODER_NOTARIAL_DECLINED_DYNAMIC_VALUE } from "./poder-notarial-prefill.types";
import {
  buildNotaSimpleProxyUrls,
  resolveNotaSimpleTechUrlsForStep,
} from "./nota-simple";
import { getReservedListingIdForDeal } from "./listing-associations";
import { parseUrlListFromField } from "./parse-url-list";
import { resolveDealFileUrl } from "./resolve-deal-file-url";
import { DocumentViewKind } from "@/lib/investments/document-view.types";
import { toViewableDocumentUrl } from "@/lib/investments/document-view-url";
import {
  ESCRITURAS_STEP_ORDER,
  type EscriturasStepId,
  type EscriturasStepState,
  type HubSpotEscriturasInfo,
} from "./escrituras.types";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

function parseAmount(raw: string | null | undefined): number | null {
  if (raw == null || raw.trim() === "") return null;
  const normalized = raw.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function formatEuroAmount(raw: string | null | undefined): string | undefined {
  const value = parseAmount(raw);
  if (value == null) return undefined;
  return formatEuroFromNumber(value);
}

function formatEuroFromNumber(value: number | null | undefined): string | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatSpanishDate(raw: string | null | undefined): string | undefined {
  if (!raw?.trim()) return undefined;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function hasText(raw: string | null | undefined): boolean {
  return Boolean(raw?.trim());
}

function isHubSpotPaid(raw: string | null | undefined): boolean {
  return raw?.trim().toLowerCase() === "paid";
}

function isHubSpotTruthyCheckbox(raw: string | null | undefined): boolean {
  const normalized = raw?.trim().toLowerCase();
  return normalized === "true" || normalized === "yes" || normalized === "1";
}

function isValuationComplete(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized.startsWith("done") || normalized.includes("valuation completed");
}

function isFeinComplete(raw: string | null | undefined): boolean {
  if (!raw?.trim()) return false;
  const normalized = raw.trim().toLowerCase();
  return normalized === "done" || normalized === "not needed";
}

function parseDirectUrl(
  attachmentUrls: string | null | undefined,
  attachment: string | null | undefined
): string | null {
  if (attachmentUrls?.trim()) {
    const first = attachmentUrls
      .split(/[\n,;]+/)
      .map((part) => part.trim())
      .find((part) => part.startsWith("http"));
    if (first) return first;
  }
  if (attachment?.trim()?.startsWith("http")) return attachment.trim();
  return null;
}

function mapViewableUrl(
  investmentId: string | undefined,
  rawUrl: string | null,
  kind: (typeof DocumentViewKind)[keyof typeof DocumentViewKind]
): string | null {
  if (!rawUrl) return null;
  return toViewableDocumentUrl(investmentId, rawUrl, kind) ?? rawUrl;
}

function resolvePoaClientNotary(
  properties: Record<string, string | null | undefined>
): string | undefined {
  return (
    properties[HUBSPOT_DEAL_CLIENT_NOTARY_PROPERTY]?.trim() ||
    properties[HUBSPOT_DEAL_NOTARY_NAME_PROPERTY]?.trim() ||
    properties[HUBSPOT_DEAL_NOTARY_SELECTION_PROPERTY]?.trim() ||
    properties[HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY]?.trim() ||
    undefined
  );
}

function formatFechaFirmaNotaryCopy(
  properties: Record<string, string | null | undefined>
): string | undefined {
  const clientNotary = resolvePoaClientNotary(properties);
  return clientNotary ? `En notaría ${clientNotary}` : undefined;
}

function hasPoaDocument(properties: Record<string, string | null | undefined>): boolean {
  if (hasText(properties[HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY])) return true;
  if (hasText(properties[HUBSPOT_DEAL_COMPANY_DEED_PROPERTY])) return true;
  if (parseUrlListFromField(properties[HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY]).length > 0) {
    return true;
  }
  if (parseUrlListFromField(properties[HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY]).length > 0) {
    return true;
  }
  return false;
}

async function resolvePoaDocumentRaw(
  properties: Record<string, string | null | undefined>
): Promise<string | null> {
  const techPoaUrls = parseUrlListFromField(
    properties[HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY]
  );
  if (techPoaUrls.length > 0) return techPoaUrls[0];

  const fromPoaAttachment = await resolveDealFileUrl(
    properties[HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY],
    null,
    properties[HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY]
  );
  if (fromPoaAttachment) return fromPoaAttachment;

  return resolveDealFileUrl(
    properties[HUBSPOT_DEAL_COMPANY_DEED_PROPERTY],
    null,
    properties[HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY]
  );
}

function resolveRealEstateAgentFee(
  dealProperties: Record<string, string | null | undefined>,
  listingProperties?: Record<string, string | null | undefined> | null
): string | undefined {
  return formatEuroAmount(
    listingProperties?.[HUBSPOT_LISTING_REAL_ESTATE_AGENT_FEE_PROPERTY] ??
      dealProperties[HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_PROPERTY] ??
      dealProperties[HUBSPOT_DEAL_REAF_AMOUNT_PROPERTY]
  );
}

function resolveFinalEscrituraPaymentAmount(
  dealProperties: Record<string, string | null | undefined>,
  listingProperties?: Record<string, string | null | undefined> | null
): string | undefined {
  const fromField = formatEuroAmount(
    listingProperties?.[HUBSPOT_LISTING_REMAINING_NOTARY_PAYMENT_PROPERTY] ??
      dealProperties[HUBSPOT_DEAL_REMAINING_NOTARY_PAYMENT_PROPERTY]
  );
  if (fromField) return fromField;

  const price = parseAmount(listingProperties?.[HUBSPOT_LISTING_PRICE_PROPERTY]);
  if (price == null) return undefined;

  const arras = parseAmount(listingProperties?.[HUBSPOT_LISTING_ARRAS_PROPERTY]) ?? 0;
  const senal = parseAmount(listingProperties?.[HUBSPOT_LISTING_SENAL_PROPERTY]) ?? 0;
  return formatEuroFromNumber(price - arras - senal);
}

interface RawStepCompletion {
  completed: boolean;
  date?: string;
  dynamicValue?: string;
  documentUrl?: string | null;
  documentUrls?: string[];
  poaDeclined?: boolean;
  poaFormSubmitted?: boolean;
  requiresFeinUpload?: boolean;
  paymentLink?: string;
}

async function resolveRawStepCompletions(
  properties: Record<string, string | null | undefined>,
  options?: {
    investmentId?: string;
    listingProperties?: Record<string, string | null | undefined> | null;
  }
): Promise<Record<EscriturasStepId, RawStepCompletion>> {
  const notaSimpleTechUrls = resolveNotaSimpleTechUrlsForStep({
    dealProperties: properties,
    listingProperties: options?.listingProperties,
  });

  const notaSimpleProxyUrls = options?.investmentId
    ? buildNotaSimpleProxyUrls(options.investmentId, notaSimpleTechUrls.length)
    : [];

  const [poaDocRaw, feinDocRaw, finalPaymentRaw] = await Promise.all([
    resolvePoaDocumentRaw(properties),
    resolveDealFileUrl(
      properties[HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY],
      null,
      properties[HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY]
    ),
    resolveDealFileUrl(properties[HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY], null, null),
  ]);

  const poaDocUrl = mapViewableUrl(
    options?.investmentId,
    poaDocRaw,
    DocumentViewKind.CompanyDeed
  );
  const feinDocUrl = mapViewableUrl(
    options?.investmentId,
    feinDocRaw,
    DocumentViewKind.FeinSignature
  );
  const finalPaymentUrl = mapViewableUrl(
    options?.investmentId,
    finalPaymentRaw,
    DocumentViewKind.FinalPaymentProof
  );

  const realSettlementDate = formatSpanishDate(
    properties[HUBSPOT_DEAL_REAL_SETTLEMENT_DATE_PROPERTY]
  );
  const fechaFirmaNotaryCopy = formatFechaFirmaNotaryCopy(properties);
  const finalEscrituraPayment = resolveFinalEscrituraPaymentAmount(
    properties,
    options?.listingProperties
  );

  return {
    nota_simple: {
      completed: notaSimpleTechUrls.length > 0,
      documentUrl: notaSimpleProxyUrls[0] ?? null,
      documentUrls: notaSimpleProxyUrls.length > 0 ? notaSimpleProxyUrls : undefined,
    },
    poder_notarial: (() => {
      const poaDeclined = isPoaDeclinedByInvestor(properties);
      const hasPoa = hasPoaDocument(properties);
      const poaFormSubmitted = isPoaFormSubmittedAwaitingContact(properties);

      return {
        completed: hasPoa || poaDeclined,
        poaDeclined: poaDeclined && !hasPoa,
        poaFormSubmitted,
        documentUrl: poaDocUrl,
        dynamicValue: poaDeclined
          ? PODER_NOTARIAL_DECLINED_DYNAMIC_VALUE
          : hasPoa
            ? resolvePoaClientNotary(properties)
            : undefined,
      };
    })(),
    tasacion: {
      completed:
        isValuationComplete(properties[HUBSPOT_DEAL_VALUATION_PROPERTY]) ||
        isHubSpotPaid(properties[HUBSPOT_DEAL_PAYMENT_STATUS_APPRAISAL_PROPERTY]),
      date: formatSpanishDate(properties[HUBSPOT_DEAL_APPRAISAL_DATE_PROPERTY]),
    },
    ficha_hipoteca: (() => {
      const techFeinUrls = properties[HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY];
      const hasTechFeinUrls = parseUrlListFromField(techFeinUrls).length > 0;
      const hasFeinSignatureDoc = hasText(
        properties[HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY]
      );
      const feinSignatureComplete = isFeinComplete(
        properties[HUBSPOT_DEAL_FEIN_SIGNATURE_PROPERTY]
      );
      const hasFeinDocument = Boolean(feinDocUrl) || hasFeinSignatureDoc;

      return {
        completed: feinSignatureComplete || hasFeinDocument,
        date: formatSpanishDate(properties[HUBSPOT_DEAL_FEIN_DEADLINE_DATE_PROPERTY]),
        documentUrl: feinDocUrl,
        requiresFeinUpload:
          !hasTechFeinUrls && !hasFeinSignatureDoc && !feinSignatureComplete,
      };
    })(),
    pago_reaf: {
      completed: isHubSpotPaid(properties[HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY]),
      dynamicValue: resolveRealEstateAgentFee(properties, options?.listingProperties),
      paymentLink: properties[HUBSPOT_DEAL_PAYMENT_LINK_REAF_PROPERTY]?.trim() || undefined,
    },
    pago_provision_fondos: {
      completed: isHubSpotPaid(
        properties[HUBSPOT_DEAL_PAYMENT_STATUS_FUNDS_PROVISION_PROPERTY]
      ),
      dynamicValue: formatEuroAmount(properties[HUBSPOT_DEAL_FUNDS_PROVISION_AMOUNT_PROPERTY]),
      paymentLink:
        properties[HUBSPOT_DEAL_PAYMENT_LINK_FUNDS_PROVISION_PROPERTY]?.trim() || undefined,
    },
    fecha_firma: {
      completed: Boolean(realSettlementDate),
      date: realSettlementDate,
      dynamicValue: fechaFirmaNotaryCopy,
    },
    pago_fee_escrituras: {
      completed: isHubSpotPaid(properties[HUBSPOT_DEAL_PAYMENT_STATUS_EXCHANGE_PROPERTY]),
      date: formatSpanishDate(properties[HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY]),
      dynamicValue: formatEuroAmount(properties[HUBSPOT_DEAL_SETTLEMENT_FEE_AMOUNT_PROPERTY]),
      paymentLink:
        properties[HUBSPOT_DEAL_PAYMENT_LINK_EXCHANGE_PROPERTY]?.trim() || undefined,
    },
    pago_final_propiedad: {
      completed:
        hasText(properties[HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY]) ||
        hasText(properties[HUBSPOT_DEAL_IR_FINAL_CONTRACT_SIGNED_PROPERTY]) ||
        isHubSpotTruthyCheckbox(properties[HUBSPOT_DEAL_IR_SIGNATURE_FINAL_PROPERTY]),
      documentUrl: finalPaymentUrl,
      dynamicValue: finalEscrituraPayment,
    },
  };
}

function buildParallelEscriturasSteps(
  rawSteps: Record<EscriturasStepId, RawStepCompletion>
): { steps: Record<EscriturasStepId, EscriturasStepState>; currentStep: EscriturasStepId } {
  const steps = {} as Record<EscriturasStepId, EscriturasStepState>;

  for (const stepId of ESCRITURAS_STEP_ORDER) {
    const raw = rawSteps[stepId];
    if (raw.completed) {
      steps[stepId] = {
        status: "completed",
        ...(raw.date ? { date: raw.date } : {}),
        ...(raw.dynamicValue ? { dynamicValue: raw.dynamicValue } : {}),
        ...(raw.documentUrl ? { documentUrl: raw.documentUrl } : {}),
        ...(raw.documentUrls?.length ? { documentUrls: raw.documentUrls } : {}),
        ...(raw.poaDeclined ? { poaDeclined: true } : {}),
      };
      continue;
    }

    steps[stepId] = {
      status: "in_progress",
      ...(raw.dynamicValue ? { dynamicValue: raw.dynamicValue } : {}),
      ...(raw.paymentLink ? { paymentLink: raw.paymentLink } : {}),
      ...(raw.documentUrl ? { documentUrl: raw.documentUrl } : {}),
      ...(raw.poaFormSubmitted ? { poaFormSubmitted: true } : {}),
      ...(raw.requiresFeinUpload ? { requiresFeinUpload: true } : {}),
    };
  }

  const firstIncomplete =
    ESCRITURAS_STEP_ORDER.find((stepId) => steps[stepId].status !== "completed") ??
    ESCRITURAS_STEP_ORDER[ESCRITURAS_STEP_ORDER.length - 1];

  return { steps, currentStep: firstIncomplete };
}

function resolveStageStatus(steps: Record<EscriturasStepId, EscriturasStepState>) {
  const statuses = ESCRITURAS_STEP_ORDER.map((id) => steps[id].status);
  if (statuses.every((status) => status === "completed")) return "completed" as const;
  if (statuses.some((status) => status !== "pending")) return "in_progress" as const;
  return "pending" as const;
}

export async function getEscriturasForDeal(
  dealId: string,
  options?: { investmentId?: string; listingId?: string | null }
): Promise<HubSpotEscriturasInfo | null> {
  if (!isHubSpotConfigured()) return null;

  const deal = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_ESCRITURAS_PROPERTIES}`
  );

  const resolvedListingId =
    options?.listingId ?? (await getReservedListingIdForDeal(dealId));

  let listingProperties: Record<string, string | null | undefined> | null = null;
  if (resolvedListingId) {
    const listing = await hubSpotFetch<HubSpotObjectResponse>(
      `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${resolvedListingId}?properties=${HUBSPOT_LISTING_ESCRITURAS_CONTEXT_PROPERTIES}`
    );
    listingProperties = listing.properties;
  }

  const rawSteps = await resolveRawStepCompletions(deal.properties, {
    investmentId: options?.investmentId,
    listingProperties,
  });
  const { steps, currentStep } = buildParallelEscriturasSteps(rawSteps);

  if (steps.poder_notarial.status === "in_progress" && !steps.poder_notarial.poaFormSubmitted) {
    const formUrl = await buildPoderNotarialFormUrl(dealId, resolvedListingId);
    if (formUrl) {
      steps.poder_notarial = { ...steps.poder_notarial, formUrl };
    }
  }

  return {
    source: "hubspot",
    stageStatus: resolveStageStatus(steps),
    currentStep,
    steps,
  };
}

export function getMockEscriturasInfo(): HubSpotEscriturasInfo {
  const steps = {} as Record<EscriturasStepId, EscriturasStepState>;
  for (const stepId of ESCRITURAS_STEP_ORDER) {
    steps[stepId] = { status: "pending" };
  }

  return {
    source: "mock",
    stageStatus: "pending",
    currentStep: "nota_simple",
    steps,
  };
}
