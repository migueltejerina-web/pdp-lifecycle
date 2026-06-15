import { NextResponse } from "next/server";

import {
  getPaymentAmountsForDeal,
  getPaymentAmountsForListing,
} from "@/lib/hubspot/arras";
import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";

function emptyPaymentResponse(extra?: Record<string, unknown>) {
  return {
    arrasAmount: null,
    senalAmount: null,
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
    return NextResponse.json(emptyPaymentResponse({ source: "empty", configured: false }));
  }

  try {
    if (refs.hubspotListingId) {
      const result = await getPaymentAmountsForListing(refs.hubspotListingId);
      if (result) {
        return NextResponse.json({ ...result, configured: true });
      }
    }

    if (refs.hubspotDealId) {
      const result = await getPaymentAmountsForDeal(refs.hubspotDealId);
      if (result) {
        return NextResponse.json({ ...result, configured: true });
      }
    }

    return NextResponse.json(
      emptyPaymentResponse({
        source: "empty",
        configured: true,
      })
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot request failed";
    console.error("[api/investments/arras]", message);

    return NextResponse.json(
      emptyPaymentResponse({
        source: "empty",
        configured: true,
        error: message,
      }),
      { status: 200 }
    );
  }
}
