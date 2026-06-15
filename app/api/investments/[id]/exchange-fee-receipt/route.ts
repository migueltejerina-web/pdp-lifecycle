import { NextResponse } from "next/server";

import {
  getExchangeFeeReceiptForDeal,
  getMockExchangeFeeReceiptInfo,
  uploadExchangeFeeReceiptForDeal,
} from "@/lib/hubspot/exchange-fee-receipt";
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
    return NextResponse.json({ ...getMockExchangeFeeReceiptInfo(), configured: false });
  }

  try {
    const receipt = await getExchangeFeeReceiptForDeal(refs.hubspotDealId);
    if (!receipt) {
      return NextResponse.json({ ...getMockExchangeFeeReceiptInfo(), configured: true });
    }
    return NextResponse.json({ ...receipt, configured: true, dealId: refs.hubspotDealId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "HubSpot exchange fee receipt read failed";
    return NextResponse.json(
      { ...getMockExchangeFeeReceiptInfo(), configured: true, error: message },
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

    const receipt = await uploadExchangeFeeReceiptForDeal(
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
      error instanceof Error
        ? error.message
        : "No se pudo subir el comprobante de tarifa PropHero";
    console.error("[api/investments/exchange-fee-receipt]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
