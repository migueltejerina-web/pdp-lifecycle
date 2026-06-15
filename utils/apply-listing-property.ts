import type { PropertyMock } from "@/app/investments/[id]/mock/property.mock";
import type { SummaryCard } from "@/types/lifecycle";

export interface HubSpotPropertyDetails {
  address?: string;
  city?: string;
  country?: string;
  name?: string;
  purchasePrice?: number;
  initialInvestment?: number;
  totalInvestment?: number;
  estimatedMonthlyRent?: number;
  summaryNetYield?: number;
  escriturasEstimadas?: string;
}

export function applyListingPropertyDetails(
  property: PropertyMock,
  summaryCard: SummaryCard,
  details: HubSpotPropertyDetails
): { property: PropertyMock; summaryCard: SummaryCard } {
  return {
    property: {
      ...property,
      ...(details.address ? { address: details.address } : {}),
      ...(details.city ? { city: details.city } : {}),
      ...(details.country ? { country: details.country } : {}),
      ...(details.purchasePrice != null ? { purchasePrice: details.purchasePrice } : {}),
      ...(details.initialInvestment != null ? { initialInvestment: details.initialInvestment } : {}),
      ...(details.totalInvestment != null ? { totalInvestment: details.totalInvestment } : {}),
      ...(details.estimatedMonthlyRent != null
        ? { estimatedMonthlyRent: details.estimatedMonthlyRent }
        : {}),
      ...(details.summaryNetYield != null
        ? { summaryNetYield: details.summaryNetYield, expectedNetYield: details.summaryNetYield }
        : {}),
    },
    summaryCard: {
      ...summaryCard,
      ...(details.escriturasEstimadas ? { escriturasEstimadas: details.escriturasEstimadas } : {}),
    },
  };
}
