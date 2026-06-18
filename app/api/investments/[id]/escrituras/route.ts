import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getEscriturasForDeal, getMockEscriturasInfo } from "@/lib/hubspot/escrituras";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const refs = getInvestmentHubSpotRefs(id);

  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  if (!isHubSpotConfigured() || !refs.hubspotDealId) {
    return NextResponse.json({ ...getMockEscriturasInfo(), configured: false });
  }

  try {
    const escrituras = await getEscriturasForDeal(refs.hubspotDealId, {
      investmentId: id,
      listingId: refs.hubspotListingId,
    });
    if (!escrituras) {
      return NextResponse.json({ ...getMockEscriturasInfo(), configured: true });
    }
    return NextResponse.json({ ...escrituras, configured: true, dealId: refs.hubspotDealId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot escrituras read failed";
    return NextResponse.json(
      { ...getMockEscriturasInfo(), configured: true, error: message },
      { status: 200 }
    );
  }
}
