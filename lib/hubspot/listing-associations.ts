import "server-only";

import { HUBSPOT_LISTING_OBJECT_TYPE } from "./constants";
import { hubSpotFetch } from "./client";

interface AssociationType {
  category?: string;
  typeId?: number;
  label?: string | null;
}

interface AssociationsResponse {
  results?: Array<{
    toObjectId: string | number;
    associationTypes?: AssociationType[];
  }>;
}

export const RESERVED_LISTING_ASSOCIATION_LABEL = "reserved";

function isReservedAssociationLabel(label: string | null | undefined): boolean {
  return label?.trim().toLowerCase() === RESERVED_LISTING_ASSOCIATION_LABEL;
}

export async function getReservedListingIdForDeal(dealId: string): Promise<string | null> {
  const associations = await hubSpotFetch<AssociationsResponse>(
    `/crm/v4/objects/deals/${dealId}/associations/${HUBSPOT_LISTING_OBJECT_TYPE}`
  );

  for (const association of associations.results ?? []) {
    const hasReservedLabel = (association.associationTypes ?? []).some((type) =>
      isReservedAssociationLabel(type.label)
    );
    if (hasReservedLabel) {
      return String(association.toObjectId);
    }
  }

  return null;
}
