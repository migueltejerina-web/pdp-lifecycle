/** HubSpot CRM object type ID for Listings (propiedades). */
export const HUBSPOT_LISTING_OBJECT_TYPE = "0-420";

/** Listing property: "Arras to be collected" */
export const HUBSPOT_LISTING_ARRAS_PROPERTY = "arras_to_be_collected";

/** Listing property: "Senal to be collected" */
export const HUBSPOT_LISTING_SENAL_PROPERTY = "senal_to_be_collected";

/** Deal rollup from associated listing: "Arras to be collected (From listings)" */
export const HUBSPOT_DEAL_ARRAS_PROPERTY = "arras_to_be_collected__from_listings_";

/** Deal rollup from associated listing: "Senal to be collected (from listings)" */
export const HUBSPOT_DEAL_SENAL_PROPERTY = "senal_to_be_collected__cloned_";

export const HUBSPOT_LISTING_PAYMENT_PROPERTIES = [
  HUBSPOT_LISTING_ARRAS_PROPERTY,
  HUBSPOT_LISTING_SENAL_PROPERTY,
].join(",");

export const HUBSPOT_LISTING_DETAIL_PROPERTIES = [
  "hs_name",
  "hs_address_1",
  "hs_city",
  "hs_state_province",
  "hs_country",
].join(",");

/** Listing: Price (HubSpot label "Price"). */
export const HUBSPOT_LISTING_PRICE_PROPERTY = "hs_price";

/** Listing / opportunity sync: Initial Investment. */
export const HUBSPOT_LISTING_INITIAL_INVESTMENT_PROPERTY = "initial_investment";

/** Listing / opportunity sync: Yield. */
export const HUBSPOT_LISTING_YIELD_PROPERTY = "yield";

/** Listing / opportunity sync: Collection date → Escrituras estimadas. */
export const HUBSPOT_LISTING_COLLECTION_DATE_PROPERTY = "collection_date";

/** Listing: Final Total Price → Inversión total. */
export const HUBSPOT_LISTING_FINAL_TOTAL_PRICE_PROPERTY = "final_total_price";

/** Listing: Rent per month → Renta estimada. */
export const HUBSPOT_LISTING_RENT_PER_MONTH_PROPERTY = "rent_per_month";

export const HUBSPOT_LISTING_SUMMARY_PROPERTIES = [
  HUBSPOT_LISTING_PRICE_PROPERTY,
  HUBSPOT_LISTING_INITIAL_INVESTMENT_PROPERTY,
  HUBSPOT_LISTING_YIELD_PROPERTY,
  HUBSPOT_LISTING_COLLECTION_DATE_PROPERTY,
  HUBSPOT_LISTING_FINAL_TOTAL_PRICE_PROPERTY,
  HUBSPOT_LISTING_RENT_PER_MONTH_PROPERTY,
].join(",");

/** Opportunity (deal) fields — primary source when populated. */
export const HUBSPOT_DEAL_OPPORTUNITY_PRICE_PROPERTY = "price";

export const HUBSPOT_DEAL_OPPORTUNITY_INITIAL_INVESTMENT_PROPERTY = "initial_investment";

export const HUBSPOT_DEAL_OPPORTUNITY_YIELD_PROPERTY = "yield";

export const HUBSPOT_DEAL_OPPORTUNITY_COLLECTION_DATE_PROPERTY = "collection_date";

export const HUBSPOT_DEAL_SUMMARY_PROPERTIES = [
  HUBSPOT_DEAL_OPPORTUNITY_PRICE_PROPERTY,
  HUBSPOT_DEAL_OPPORTUNITY_INITIAL_INVESTMENT_PROPERTY,
  HUBSPOT_DEAL_OPPORTUNITY_YIELD_PROPERTY,
  HUBSPOT_DEAL_OPPORTUNITY_COLLECTION_DATE_PROPERTY,
  "price__from_properties_",
  "yield__from_properties_",
  "final_total_price__from_properties_",
  "rent__from_properties_",
].join(",");

export const HUBSPOT_DEAL_PAYMENT_PROPERTIES = [
  HUBSPOT_DEAL_ARRAS_PROPERTY,
  HUBSPOT_DEAL_SENAL_PROPERTY,
].join(",");

/** Listing: DocuSign arras availability — source of truth for ops (sandbox: `disponibilidad`). */
export const HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY = "disponibilidad";

/** Listing: DocuSign arras availability (production). */
export const HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY_ALT = "docusign_status_2";

/** Deal: triggers HubSpot/DocuSign workflow to send the arras contract template. */
export const HUBSPOT_DEAL_DOCUSIGN_TRIGGER_PROPERTY = "docusign_trigger";

/** Listing: datetime when the property was blocked for the investor (48h countdown anchor). */
export const HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY = "blocked_for_investor";

export const HUBSPOT_LISTING_RESERVATION_PROPERTIES = [
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY,
  HUBSPOT_LISTING_DOCUSIGN_STATUS_PROPERTY_ALT,
  HUBSPOT_LISTING_BLOCKED_FOR_INVESTOR_PROPERTY,
  "last_envelope_docusign__from_deals_",
].join(",");

export const HUBSPOT_DEAL_DOCUSIGN_PROPERTIES = [
  "last_envelope_docusign_status_update_sync",
  "last_envelope_docusign_status_update",
  "docusign_trigger",
].join(",");

/** Deal: signed arras contract file (HubSpot file property). */
export const HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY = "contract_attachment";

/** Deal: arras payment receipt file (HubSpot file property). */
export const HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY = "arras_receipt";

export const HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTIES = [
  HUBSPOT_DEAL_ARRAS_RECEIPT_PROPERTY,
  "arras_receipt_url",
  "tech_arras_receipt_urls",
].join(",");

/** Deal: PropHero exchange fee receipt file (HubSpot file property). */
export const HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY = "exchange_fee_receipt";

/** Deal: date when the PropHero exchange fee payment receipt was uploaded. */
export const HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY = "payment_date_exchange";

export const HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTIES = [
  HUBSPOT_DEAL_EXCHANGE_FEE_RECEIPT_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY,
].join(",");

export const HUBSPOT_DEAL_ARRAS_CONTRACT_PROPERTIES = [
  "arras_contract_envelope_status",
  "arras_contract_envelope_id",
  "last_envelope_docusign_status_update_sync",
  "last_envelope_docusign_status_update",
  "last_docusign_update_sync",
  "date_contract_sent",
  HUBSPOT_DEAL_CONTRACT_ATTACHMENT_PROPERTY,
  "tech_contract_attachment_urls",
].join(",");

/** Hours the investor has to sign after the listing DocuSign status becomes Blocked. */
export const SIGNING_DEADLINE_HOURS = 48;

export type HubSpotDocuSignListingStatus =
  | "Available"
  | "Blocked"
  | "Signed"
  | "Blocked by PH"
  | "Coming Soon";

export const RESERVATION_BLOCK_HOURS = 48;
