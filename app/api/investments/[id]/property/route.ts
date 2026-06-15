import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getListingPropertyDetailsForInvestment } from "@/lib/hubspot/listing-details";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";

function emptyPropertyResponse(extra?: Record<string, unknown>) {
  return {
    address: null,
    city: null,
    country: null,
    purchasePrice: null,
    initialInvestment: null,
    totalInvestment: null,
    estimatedMonthlyRent: null,
    summaryNetYield: null,
    escriturasEstimadas: null,
    source: "empty" as const,
    configured: false,
    ...extra,
  };
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const refs = getInvestmentHubSpotRefs(id);

  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  if (!isHubSpotConfigured()) {
    return NextResponse.json(emptyPropertyResponse());
  }

  try {
    const details = await getListingPropertyDetailsForInvestment(
      refs.hubspotDealId,
      refs.hubspotListingId
    );

    if (!details) {
      return NextResponse.json(
        emptyPropertyResponse({
          source: "empty",
          configured: true,
        })
      );
    }

    return NextResponse.json({
      address: details.address ?? null,
      city: details.city ?? null,
      country: details.country ?? null,
      name: details.name ?? null,
      purchasePrice: details.purchasePrice ?? null,
      initialInvestment: details.initialInvestment ?? null,
      totalInvestment: details.totalInvestment ?? null,
      estimatedMonthlyRent: details.estimatedMonthlyRent ?? null,
      summaryNetYield: details.summaryNetYield ?? null,
      escriturasEstimadas: details.escriturasEstimadas ?? null,
      listingId: details.listingId ?? null,
      dealId: details.dealId ?? null,
      source: details.source,
      configured: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot property read failed";
    console.error("[api/investments/property]", message);

    return NextResponse.json(
      emptyPropertyResponse({
        source: "empty",
        configured: true,
        error: message,
      }),
      { status: 200 }
    );
  }
}
