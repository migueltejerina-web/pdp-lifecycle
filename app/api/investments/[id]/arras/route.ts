import { NextResponse } from "next/server";

import {
  getExchangeFeeAmountForDeal,
  getPaymentAmountsForDeal,
  getPaymentAmountsForListing,
} from "@/lib/hubspot/arras";
import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";

function emptyPaymentResponse(extra?: Record<string, unknown>) {
  return {
    arrasAmount: null,
    senalAmount: null,
    exchangeFeeAmount: null,
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
    let result: Awaited<ReturnType<typeof getPaymentAmountsForDeal>> = null;

    if (refs.hubspotListingId) {
      result = await getPaymentAmountsForListing(refs.hubspotListingId);
    }

    if (!result && refs.hubspotDealId) {
      result = await getPaymentAmountsForDeal(refs.hubspotDealId);
    }

    const exchangeFeeAmount =
      result?.exchangeFeeAmount ??
      (refs.hubspotDealId ? await getExchangeFeeAmountForDeal(refs.hubspotDealId) : null);

    if (result || exchangeFeeAmount != null) {
      return NextResponse.json({
        ...(result ?? { source: "deal_rollup" as const }),
        ...(exchangeFeeAmount != null ? { exchangeFeeAmount } : {}),
        configured: true,
        ...(refs.hubspotDealId ? { dealId: refs.hubspotDealId } : {}),
        ...(refs.hubspotListingId ? { listingId: refs.hubspotListingId } : {}),
      });
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
