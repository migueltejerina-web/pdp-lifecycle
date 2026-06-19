export const PODER_NOTARIAL_DECLINED_DYNAMIC_VALUE = "No solicitado";

/** Shown on the poder notarial step after the investor submits the online form. */
export const PODER_NOTARIAL_REQUEST_PROCESSING_COPY =
  "Solicitud procesada. Serás contactado.";

/** Shown on poder notarial while nota simple is not yet available in HubSpot. */
export const PODER_NOTARIAL_WITHOUT_NOTA_SIMPLE_COPY =
  "Autoriza a PropHero para gestionar la compra en tu nombre";

export interface PoderNotarialPrefillValues {
  fullName?: string;
  email?: string;
  phone?: string;
  nif?: string;
  profession?: string;
  buyerType?: string;
  iban?: string;
  contactAddress?: string;
  contactCity?: string;
  propertyAddress?: string;
  propertyCity?: string;
  propertyCountry?: string;
  propertyName?: string;
  purchasePrice?: string;
  notaryName?: string;
  hubspotDealId?: string;
  hubspotListingId?: string;
  taxlandNumber?: string;
}
