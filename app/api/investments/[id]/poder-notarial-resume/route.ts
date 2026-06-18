import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";
import { resumePoaForDeal } from "@/lib/hubspot/poder-notarial-decline";
import { HUBSPOT_POA_STATUS_TO_BE_DRAFTED } from "@/lib/hubspot/constants";

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
    await resumePoaForDeal(refs.hubspotDealId);

    return NextResponse.json({
      configured: true,
      dealId: refs.hubspotDealId,
      poaStatus: HUBSPOT_POA_STATUS_TO_BE_DRAFTED,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo retomar el poder notarial";
    console.error("[api/investments/poder-notarial-resume]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
