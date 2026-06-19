/** HubSpot CRM object type ID for Listings (propiedades). */
export const HUBSPOT_LISTING_OBJECT_TYPE = "0-420";

/** Contact: Client National ID (DNI/NIE). */
export const HUBSPOT_CONTACT_CLIENT_NATIONAL_ID_PROPERTY = "client_national_id";

/** Contact: Job title / profession. */
export const HUBSPOT_CONTACT_JOBTITLE_PROPERTY = "jobtitle";

/** Contact: Buyer Type (Dropdown) — legacy on contact; prefer deal field. */
export const HUBSPOT_CONTACT_BUYER_TYPE_DROPDOWN_PROPERTY = "who_is_buying__dropdown_";

/** Deal: Buyer Type (Dropdown) — `main_contact_buyer_type__dropdown_`. */
export const HUBSPOT_DEAL_BUYER_TYPE_DROPDOWN_PROPERTY = "main_contact_buyer_type__dropdown_";

/** Listing property: "Arras to be collected" */
export const HUBSPOT_LISTING_ARRAS_PROPERTY = "arras_to_be_collected";

/** Listing property: "Senal to be collected" */
export const HUBSPOT_LISTING_SENAL_PROPERTY = "senal_to_be_collected";

/** Deal rollup from associated listing: "Arras to be collected (From listings)" */
export const HUBSPOT_DEAL_ARRAS_PROPERTY = "arras_to_be_collected__from_listings_";

/** Deal rollup from associated listing: "Senal to be collected (from listings)" */
export const HUBSPOT_DEAL_SENAL_PROPERTY = "senal_to_be_collected__cloned_";

/** Deal: PropHero exchange fee — arras tariff and escritura fee (`exchange_fee_amount`). */
export const HUBSPOT_DEAL_EXCHANGE_FEE_AMOUNT_PROPERTY = "exchange_fee_amount";

/** Default when deal `exchange_fee_amount` is empty (arras PropHero tariff). */
export const PROPHERO_ARRAS_EXCHANGE_FEE_DEFAULT_EUR = 3000;

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
  HUBSPOT_DEAL_EXCHANGE_FEE_AMOUNT_PROPERTY,
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

/** Deal: nota simple — rollup from listing / Airtable (TECH - Land registry doc URLs). */
export const HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY =
  "land_registry_doc__from_properties_";

/** Listing: nota simple file upload (Land registry doc DD). */
export const HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY = "land_registry_doc__dd_";

/** Listing: TECH - Land registry doc (DD) (URLs) — may contain multiple links. */
export const HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY =
  "tech__land_registry_doc_dd_urls";

/** Deal: legacy nota simple (Contract Simple Copy) — fallback only. */
export const HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY = "contract_simple_copy";

/** Deal: poder notarial online (Company deed) — investor upload fallback. */
export const HUBSPOT_DEAL_COMPANY_DEED_PROPERTY = "company_deed";

export const HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY = "tech_company_deed_urls";

/** Deal: PoA attachment (PropHero / ops upload). */
export const HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY = "poa_attachment";

export const HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY = "tech__poa_attachment_urls";

/** Listing: Real Estate Agent fee → REAF step amount. */
export const HUBSPOT_LISTING_REAL_ESTATE_AGENT_FEE_PROPERTY = "real_estate_agent_fee";

/** Listing / deal: remaining amount due at notary for escritura. */
export const HUBSPOT_LISTING_REMAINING_NOTARY_PAYMENT_PROPERTY = "remaining_notary_payment";

export const HUBSPOT_DEAL_REMAINING_NOTARY_PAYMENT_PROPERTY = "remaining_notary_payment";

export const HUBSPOT_LISTING_ESCRITURAS_CONTEXT_PROPERTIES = [
  HUBSPOT_LISTING_TECH_LAND_REGISTRY_DOC_DD_URLS_PROPERTY,
  HUBSPOT_LISTING_LAND_REGISTRY_DOC_DD_PROPERTY,
  HUBSPOT_LISTING_REAL_ESTATE_AGENT_FEE_PROPERTY,
  HUBSPOT_LISTING_PRICE_PROPERTY,
  HUBSPOT_LISTING_ARRAS_PROPERTY,
  HUBSPOT_LISTING_SENAL_PROPERTY,
  HUBSPOT_LISTING_REMAINING_NOTARY_PAYMENT_PROPERTY,
].join(",");

/** Deal: Power of Attorney (PoA) Status — HubSpot internal name `poa_status`. */
export const HUBSPOT_DEAL_POA_STATUS_PROPERTY = "poa_status";

/**
 * Sandbox/staging: investor opts out of online PoA (`poa_status` dropdown).
 * Production may add a separate field later — wire that when prod HubSpot is connected.
 */
export const HUBSPOT_POA_STATUS_NOT_REQUIRED = "Not required";

/** Dropdown value when the investor resumes the PoA process. */
export const HUBSPOT_POA_STATUS_TO_BE_DRAFTED = "To be drafted";

/** Set on deal after the investor submits the online poder notarial form. */
export const HUBSPOT_POA_STATUS_NOTARY_TO_BE_SCHEDULED = "Notary to be scheduled";

/** Deal: tasación — valuation workflow status. */
export const HUBSPOT_DEAL_VALUATION_PROPERTY = "valuation";

export const HUBSPOT_DEAL_APPRAISAL_DATE_PROPERTY = "appraisal_date";

export const HUBSPOT_DEAL_PAYMENT_STATUS_APPRAISAL_PROPERTY = "payment_status_appraisal";

/** Deal: ficha hipotecaria (FEIN). */
export const HUBSPOT_DEAL_FEIN_SIGNATURE_PROPERTY = "fein_signature";

export const HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY = "fein_signature_doc";

export const HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY = "tech__fein_signature_doc_urls";

export const HUBSPOT_DEAL_FEIN_DEADLINE_DATE_PROPERTY = "fein_deadline_date";

/** Deal: pago REAF (honorarios agencia). */
export const HUBSPOT_DEAL_REAF_AMOUNT_PROPERTY = "reaf_amount";

/** Deal: honorarios agencia — Real estate agent fee (display amount for REAF step). */
export const HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_PROPERTY = "real_estate_agent_fee";

export const HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY = "payment_status__reaf";

export const HUBSPOT_DEAL_PAYMENT_LINK_REAF_PROPERTY = "payment_link_reaf";

export const HUBSPOT_DEAL_PAYMENT_LINK_FUNDS_PROVISION_PROPERTY = "payment_link_funds_provision";

export const HUBSPOT_DEAL_PAYMENT_LINK_EXCHANGE_PROPERTY = "payment_link_exchange";

/** Deal: provisión de fondos (gestionado por el banco). */
export const HUBSPOT_DEAL_FUNDS_PROVISION_AMOUNT_PROPERTY = "funds_provision_amount";

export const HUBSPOT_DEAL_PAYMENT_STATUS_FUNDS_PROVISION_PROPERTY =
  "payment_status_funds_provision";

/** Deal: fecha real de firma ante notario (completa el paso Fecha final de firma). */
export const HUBSPOT_DEAL_REAL_SETTLEMENT_DATE_PROPERTY = "real_settlement_date";

/** Deal: fecha final de firma ante notario. */
export const HUBSPOT_DEAL_NOTARY_APPOINTMENT_PROPERTY = "notary_appointment";

export const HUBSPOT_DEAL_NOTARY_APPOINTMENT_SELECT_PROPERTY = "notary_appointment__select_";

export const HUBSPOT_DEAL_NOTARY_NAME_PROPERTY = "notary_name";

export const HUBSPOT_DEAL_NOTARY_SELECTION_PROPERTY = "notary_selection";

export const HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY = "solicitor_notary";

/** Deal: client notary — shown when PoA is sent to the notary. */
export const HUBSPOT_DEAL_CLIENT_NOTARY_PROPERTY = "client_notary";

export const HUBSPOT_DEAL_PAYMENT_STATUS_EXCHANGE_PROPERTY = "payment_status_exchange";

/** Deal: tarifa PropHero escrituras — Settlement Fee Amount. */
export const HUBSPOT_DEAL_SETTLEMENT_FEE_AMOUNT_PROPERTY = "settlement_fee_amount";

/** Deal: pago final de la propiedad. */
export const HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY = "ir_proof_of_final_payments";

export const HUBSPOT_DEAL_IR_FINAL_CONTRACT_SIGNED_PROPERTY = "ir_final_contract_signed";

export const HUBSPOT_DEAL_IR_SIGNATURE_FINAL_PROPERTY =
  "ir_signature_of_final_contract_proof_of_final_payments";

export const HUBSPOT_DEAL_ESCRITURAS_PROPERTIES = [
  HUBSPOT_DEAL_LAND_REGISTRY_DOC_FROM_PROPERTIES_PROPERTY,
  HUBSPOT_DEAL_CONTRACT_SIMPLE_COPY_PROPERTY,
  HUBSPOT_DEAL_COMPANY_DEED_PROPERTY,
  HUBSPOT_DEAL_TECH_COMPANY_DEED_URLS_PROPERTY,
  HUBSPOT_DEAL_POA_ATTACHMENT_PROPERTY,
  HUBSPOT_DEAL_TECH_POA_ATTACHMENT_URLS_PROPERTY,
  HUBSPOT_DEAL_POA_STATUS_PROPERTY,
  HUBSPOT_DEAL_VALUATION_PROPERTY,
  HUBSPOT_DEAL_APPRAISAL_DATE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_APPRAISAL_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_PROPERTY,
  HUBSPOT_DEAL_FEIN_SIGNATURE_DOC_PROPERTY,
  HUBSPOT_DEAL_TECH_FEIN_SIGNATURE_DOC_URLS_PROPERTY,
  HUBSPOT_DEAL_FEIN_DEADLINE_DATE_PROPERTY,
  HUBSPOT_DEAL_REAL_ESTATE_AGENT_FEE_PROPERTY,
  HUBSPOT_DEAL_REMAINING_NOTARY_PAYMENT_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_REAF_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_LINK_REAF_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_LINK_FUNDS_PROVISION_PROPERTY,
  HUBSPOT_DEAL_FUNDS_PROVISION_AMOUNT_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_FUNDS_PROVISION_PROPERTY,
  HUBSPOT_DEAL_REAL_SETTLEMENT_DATE_PROPERTY,
  HUBSPOT_DEAL_NOTARY_APPOINTMENT_PROPERTY,
  HUBSPOT_DEAL_NOTARY_APPOINTMENT_SELECT_PROPERTY,
  HUBSPOT_DEAL_NOTARY_NAME_PROPERTY,
  HUBSPOT_DEAL_NOTARY_SELECTION_PROPERTY,
  HUBSPOT_DEAL_SOLICITOR_NOTARY_PROPERTY,
  HUBSPOT_DEAL_CLIENT_NOTARY_PROPERTY,
  HUBSPOT_DEAL_EXCHANGE_FEE_AMOUNT_PROPERTY,
  HUBSPOT_DEAL_SETTLEMENT_FEE_AMOUNT_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_STATUS_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_LINK_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_PAYMENT_DATE_EXCHANGE_PROPERTY,
  HUBSPOT_DEAL_IR_PROOF_FINAL_PAYMENTS_PROPERTY,
  HUBSPOT_DEAL_IR_FINAL_CONTRACT_SIGNED_PROPERTY,
  HUBSPOT_DEAL_IR_SIGNATURE_FINAL_PROPERTY,
  "final_total_price__from_properties_",
].join(",");
