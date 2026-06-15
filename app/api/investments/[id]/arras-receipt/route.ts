import { NextResponse } from "next/server";

import {
  getArrasReceiptForDeal,
  getMockArrasReceiptInfo,
  uploadArrasReceiptForDeal,
} from "@/lib/hubspot/arras-receipt";
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

  if (!isHubSpotConfigured() || !refs.hubspotDealId) {
    return NextResponse.json({ ...getMockArrasReceiptInfo(), configured: false });
  }

  try {
    const receipt = await getArrasReceiptForDeal(refs.hubspotDealId);
    if (!receipt) {
      return NextResponse.json({ ...getMockArrasReceiptInfo(), configured: true });
    }
    return NextResponse.json({ ...receipt, configured: true, dealId: refs.hubspotDealId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot arras receipt read failed";
    return NextResponse.json(
      { ...getMockArrasReceiptInfo(), configured: true, error: message },
      { status: 200 }
    );
  }
}

export async function POST(
  request: Request,
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
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Selecciona un archivo válido" }, { status: 400 });
    }

    const receipt = await uploadArrasReceiptForDeal(
      refs.hubspotDealId,
      file,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      ...receipt,
      configured: true,
      dealId: refs.hubspotDealId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir el comprobante de arras";
    console.error("[api/investments/arras-receipt]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
