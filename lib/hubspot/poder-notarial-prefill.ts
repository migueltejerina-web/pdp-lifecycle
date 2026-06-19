import "server-only";

import { buildGoogleFormPrefillUrl } from "@/lib/google-forms/build-prefill-url";
import {
  getPoderNotarialFormConfig,
  mapPrefillValuesToEntries,
} from "@/lib/google-forms/poder-notarial-form.config";
import { hubSpotFetch, isHubSpotConfigured } from "./client";
import {
  HUBSPOT_CONTACT_CLIENT_NATIONAL_ID_PROPERTY,
  HUBSPOT_CONTACT_JOBTITLE_PROPERTY,
  HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY,
  HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY,
  HUBSPOT_LISTING_OBJECT_TYPE,
} from "./constants";
import { getListingPropertyDetailsForDeal } from "./listing-details";
import { getReservedListingIdForDeal } from "./listing-associations";
import type { PoderNotarialPrefillValues } from "./poder-notarial-prefill.types";

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

interface AssociationsResponse {
  results?: Array<{ toObjectId: string | number }>;
}

const CONTACT_PROPERTIES = [
  "firstname",
  "lastname",
  "email",
  "phone",
  "mobilephone",
  HUBSPOT_CONTACT_CLIENT_NATIONAL_ID_PROPERTY,
  HUBSPOT_CONTACT_JOBTITLE_PROPERTY,
  "iban",
  "address",
  "city",
  "full_address",
].join(",");

const LISTING_EXTRA_PROPERTIES = ["taxland_number", "hs_name"].join(",");

function joinName(
  first: string | null | undefined,
  last: string | null | undefined
): string | undefined {
  const fullName = [first?.trim(), last?.trim()].filter(Boolean).join(" ");
  return fullName || undefined;
}

function formatEuroAmount(value: number | undefined): string | undefined {
  if (value == null) return undefined;
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

async function getPrimaryContactProperties(
  dealId: string
): Promise<Record<string, string | null | undefined> | null> {
  const associations = await hubSpotFetch<AssociationsResponse>(
    `/crm/v4/objects/deals/${dealId}/associations/contacts`
  );

  const contactId = associations.results?.[0]?.toObjectId;
  if (!contactId) return null;

  const contact = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/contacts/${contactId}?properties=${CONTACT_PROPERTIES}`
  );

  return contact.properties;
}

async function getListingExtraProperties(
  listingId: string
): Promise<Record<string, string | null | undefined>> {
  const listing = await hubSpotFetch<HubSpotObjectResponse>(
    `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}?properties=${LISTING_EXTRA_PROPERTIES}`
  );

  return listing.properties;
}

export async function getPoderNotarialPrefillValues(
  dealId: string,
  listingId?: string | null
): Promise<PoderNotarialPrefillValues | null> {
  if (!isHubSpotConfigured()) return null;

  const resolvedListingId = listingId ?? (await getReservedListingIdForDeal(dealId));

  const [contactProperties, propertyDetails, listingExtras, deal] = await Promise.all([
    getPrimaryContactProperties(dealId),
    resolvedListingId
      ? getListingPropertyDetailsForDeal(dealId, resolvedListingId)
      : getListingPropertyDetailsForDeal(dealId),
    resolvedListingId ? getListingExtraProperties(resolvedListingId) : Promise.resolve(null),
    hubSpotFetch<HubSpotObjectResponse>(
      `/crm/v3/objects/deals/${dealId}?properties=${HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY},dealname,${HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY}`
    ),
  ]);

  if (!contactProperties && !propertyDetails) return null;

  const phone =
    contactProperties?.phone?.trim() || contactProperties?.mobilephone?.trim() || undefined;

  return {
    fullName: joinName(contactProperties?.firstname, contactProperties?.lastname),
    email: contactProperties?.email?.trim() || undefined,
    phone,
    nif:
      contactProperties?.[HUBSPOT_CONTACT_CLIENT_NATIONAL_ID_PROPERTY]?.trim() || undefined,
    profession: contactProperties?.[HUBSPOT_CONTACT_JOBTITLE_PROPERTY]?.trim() || undefined,
    buyerType: deal.properties[HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY]?.trim() || undefined,
    iban: contactProperties?.iban?.trim() || undefined,
    contactAddress:
      contactProperties?.full_address?.trim() ||
      contactProperties?.address?.trim() ||
      undefined,
    contactCity: contactProperties?.city?.trim() || undefined,
    propertyAddress: propertyDetails?.address,
    propertyCity: propertyDetails?.city,
    propertyCountry: propertyDetails?.country,
    propertyName: propertyDetails?.name,
    purchasePrice: formatEuroAmount(propertyDetails?.purchasePrice),
    notaryName: deal.properties[HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY]?.trim() || undefined,
    taxlandNumber: listingExtras?.taxland_number?.trim() || undefined,
    hubspotDealId: dealId,
    hubspotListingId: resolvedListingId ?? propertyDetails?.listingId,
  };
}

export async function buildPoderNotarialFormUrl(
  dealId: string,
  listingId?: string | null
): Promise<string | null> {
  const formConfig = getPoderNotarialFormConfig();
  if (!formConfig) return null;

  const values = await getPoderNotarialPrefillValues(dealId, listingId);
  if (!values) return null;

  const entries = mapPrefillValuesToEntries(formConfig, values);
  if (Object.keys(entries).length === 0) return null;

  return buildGoogleFormPrefillUrl(formConfig.formUrl, entries);
}
