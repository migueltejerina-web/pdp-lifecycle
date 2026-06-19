import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";
import { markPoaNotNeededForDeal } from "@/lib/hubspot/poder-notarial-decline";
import { HUBSPOT_POA_STATUS_NOT_REQUIRED } from "@/lib/hubspot/constants";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const refs = getInvestmentHubSpotRefs(id);

  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  if (!isHubSpotConfigured() || !refs.hubspotDealId) {
    return NextResponse.json({ error: "HubSpot is not configured" }, { status: 503 });
  }

  try {
    await markPoaNotNeededForDeal(refs.hubspotDealId);

    return NextResponse.json({
      configured: true,
      dealId: refs.hubspotDealId,
      poaStatus: HUBSPOT_POA_STATUS_NOT_REQUIRED,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo registrar tu preferencia";
    console.error("[api/investments/poder-notarial-decline]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
