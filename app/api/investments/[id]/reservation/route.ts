import { NextResponse } from "next/server";

import { getReservedListingIdForDeal } from "@/lib/hubspot/listing-associations";
import {
  blockListingForInvestor,
  getMockReservationStatus,
  getReservationStatusForDeal,
  getReservationStatusForListing,
} from "@/lib/hubspot/reservation";
import { isHubSpotConfigured } from "@/lib/hubspot/client";
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

  if (!isHubSpotConfigured() || (!refs.hubspotDealId && !refs.hubspotListingId)) {
    return NextResponse.json({ ...getMockReservationStatus(), configured: false });
  }

  try {
    const status = refs.hubspotDealId
      ? await getReservationStatusForDeal(refs.hubspotDealId)
      : refs.hubspotListingId
        ? await getReservationStatusForListing(refs.hubspotListingId)
        : null;

    if (!status) {
      return NextResponse.json({ ...getMockReservationStatus(), configured: true });
    }

    return NextResponse.json({ ...status, configured: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot reservation read failed";
    return NextResponse.json(
      { ...getMockReservationStatus(), configured: true, error: message },
      { status: 200 }
    );
  }
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const refs = getInvestmentHubSpotRefs(id);

  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  if (!isHubSpotConfigured() || (!refs.hubspotDealId && !refs.hubspotListingId)) {
    const mock = getMockReservationStatus();
    return NextResponse.json({
      ...mock,
      uiStatus: "blocked" as const,
      isClickable: false,
      docusignStatus: "Blocked" as const,
      blockedForInvestor: new Date().toISOString().slice(0, 10),
      blockExpiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      blockHoursRemaining: 48,
      configured: false,
      source: "mock" as const,
    });
  }

  try {
    const listingId =
      refs.hubspotListingId ??
      (refs.hubspotDealId ? await getReservedListingIdForDeal(refs.hubspotDealId) : null);

    if (!listingId) {
      return NextResponse.json({ error: "No reserved listing found for deal" }, { status: 404 });
    }

    const status = await blockListingForInvestor(listingId, refs.hubspotDealId);
    return NextResponse.json({ ...status, configured: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot reservation block failed";
    console.error("[api/investments/reservation]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
