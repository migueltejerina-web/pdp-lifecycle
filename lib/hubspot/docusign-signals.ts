import "server-only";

import { hubSpotFetch } from "./client";

const ENVELOPE_SENT_MARKERS = [
  "envelope-sent",
  "envelope sent",
  "envelope-delivered",
  "envelope delivered",
  "envelope-completed",
  "envelope completed",
];

const ARRAS_ENVELOPE_TYPE_PATTERN = /arras|reservation|contrato|reserva/i;
const NON_ARRAS_ENVELOPE_TYPE_PATTERN = /engagement|subscription|irlanda|ireland/i;

export type ContractSentSource =
  | "deal_envelope"
  | "listing_rollup"
  | "contact_envelope"
  | "deal_date_sent"
  | "coach_upload"
  | null;

export interface ContractSentSignal {
  sent: boolean;
  sentAt: string | null;
  source: ContractSentSource;
  envelopeStatus: string | null;
}

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

interface AssociationsResponse {
  results?: Array<{ toObjectId: string | number }>;
}

function normalizeStatus(status: string | null | undefined): string {
  return status?.trim().toLowerCase() ?? "";
}

export function isEnvelopeSent(status: string | null | undefined): boolean {
  const normalized = normalizeStatus(status);
  if (!normalized) return false;
  // Deal field `last_envelope_docusign_status_update` is set to "sent" when the coach sends the contract.
  if (normalized === "sent") return true;
  return ENVELOPE_SENT_MARKERS.some((marker) => normalized.includes(marker));
}

function isArrasEnvelopeType(envelopeType: string | null | undefined): boolean {
  if (!envelopeType?.trim()) return false;
  if (NON_ARRAS_ENVELOPE_TYPE_PATTERN.test(envelopeType)) return false;
  return ARRAS_ENVELOPE_TYPE_PATTERN.test(envelopeType);
}

function parseHubSpotDate(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

export function computeSigningExpiresAt(
  sentAt: string | null,
  deadlineHours: number
): string | null {
  if (!sentAt) return null;
  const sent = new Date(sentAt);
  if (Number.isNaN(sent.getTime())) return null;
  return new Date(sent.getTime() + deadlineHours * 60 * 60 * 1000).toISOString();
}

export function resolveContractSentSignal(params: {
  listingEnvelopeStatus?: string | null;
  dealEnvelopeStatus?: string | null;
  arrasContractEnvelopeStatus?: string | null;
  dealDateContractSent?: string | null;
  dealLastDocusignUpdateSync?: string | null;
  contactEnvelopeStatus?: string | null;
  contactLastDocusignUpdate?: string | null;
  contactEnvelopeType?: string | null;
  coachUploadedContract?: boolean;
}): ContractSentSignal {
  if (params.coachUploadedContract) {
    return {
      sent: true,
      sentAt: null,
      source: "coach_upload",
      envelopeStatus: null,
    };
  }

  const dealDateSent = parseHubSpotDate(params.dealDateContractSent);
  if (dealDateSent) {
    return {
      sent: true,
      sentAt: dealDateSent,
      source: "deal_date_sent",
      envelopeStatus: params.dealEnvelopeStatus ?? null,
    };
  }

  const dealCandidates: Array<{ status: string | null | undefined; at: string | null }> = [
    {
      status: params.arrasContractEnvelopeStatus,
      at: parseHubSpotDate(params.dealLastDocusignUpdateSync),
    },
    { status: params.dealEnvelopeStatus, at: parseHubSpotDate(params.dealLastDocusignUpdateSync) },
  ];

  for (const candidate of dealCandidates) {
    if (isEnvelopeSent(candidate.status)) {
      return {
        sent: true,
        sentAt: candidate.at,
        source: "deal_envelope",
        envelopeStatus: candidate.status ?? null,
      };
    }
  }

  if (isEnvelopeSent(params.listingEnvelopeStatus)) {
    return {
      sent: true,
      sentAt: null,
      source: "listing_rollup",
      envelopeStatus: params.listingEnvelopeStatus ?? null,
    };
  }

  if (
    isEnvelopeSent(params.contactEnvelopeStatus) &&
    isArrasEnvelopeType(params.contactEnvelopeType)
  ) {
    return {
      sent: true,
      sentAt: parseHubSpotDate(params.contactLastDocusignUpdate),
      source: "contact_envelope",
      envelopeStatus: params.contactEnvelopeStatus ?? null,
    };
  }

  return {
    sent: false,
    sentAt: null,
    source: null,
    envelopeStatus: null,
  };
}

export async function getContactDocuSignContext(
  dealId: string
): Promise<{
  envelopeStatus: string | null;
  lastDocusignUpdate: string | null;
  envelopeType: string | null;
} | null> {
  const associations = await hubSpotFetch<AssociationsResponse>(
    `/crm/v4/objects/deals/${dealId}/associations/contacts`
  );

  const contactId = associations.results?.[0]?.toObjectId;
  if (!contactId) return null;

  const contact = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/contacts/${contactId}?properties=glue_last_envelope_docusign_status_update,glue_last_docusign_update,docusign___envelope_type`
  );

  return {
    envelopeStatus: contact.properties.glue_last_envelope_docusign_status_update ?? null,
    lastDocusignUpdate: contact.properties.glue_last_docusign_update ?? null,
    envelopeType: contact.properties.docusign___envelope_type ?? null,
  };
}
