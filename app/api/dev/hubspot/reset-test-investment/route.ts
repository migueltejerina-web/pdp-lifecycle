import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";
import { resetTestInvestmentHubSpot } from "@/lib/hubspot/reset-test-investment";
import { mockProperty } from "@/app/investments/[id]/mock/property.mock";

function isDevResetEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev";
}

export async function POST(request: Request) {
  if (!isDevResetEnabled()) {
    return NextResponse.json({ error: "Not available outside development" }, { status: 404 });
  }

  if (!isHubSpotConfigured()) {
    return NextResponse.json(
      { error: "HUBSPOT_PRIVATE_APP_TOKEN is missing in .env.local" },
      { status: 400 }
    );
  }

  const body = (await request.json().catch(() => ({}))) as { investmentId?: string };
  const investmentId = body.investmentId?.trim() || mockProperty.id;
  const refs = getInvestmentHubSpotRefs(investmentId);

  if (!refs?.hubspotDealId || !refs.hubspotListingId) {
    return NextResponse.json({ error: "Investment HubSpot refs not found" }, { status: 404 });
  }

  try {
    const result = await resetTestInvestmentHubSpot({
      dealId: refs.hubspotDealId,
      listingId: refs.hubspotListingId,
    });

    return NextResponse.json({
      ok: true,
      investmentId,
      message:
        "Campos vaciados en HubSpot. Recarga /investments/prop_001 para ver la UI en reserva confirmada.",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot reset failed";
    console.error("[api/dev/hubspot/reset-test-investment]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
