import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import {
  getFinalPaymentProofForDeal,
  getMockDealFileAttachmentInfo,
  uploadFinalPaymentProofForDeal,
} from "@/lib/hubspot/escrituras-upload";
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
    return NextResponse.json({ ...getMockDealFileAttachmentInfo(), configured: false });
  }

  try {
    const attachment = await getFinalPaymentProofForDeal(refs.hubspotDealId);
    if (!attachment) {
      return NextResponse.json({ ...getMockDealFileAttachmentInfo(), configured: true });
    }
    return NextResponse.json({ ...attachment, configured: true, dealId: refs.hubspotDealId });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "HubSpot final payment proof read failed";
    return NextResponse.json(
      { ...getMockDealFileAttachmentInfo(), configured: true, error: message },
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

    const attachment = await uploadFinalPaymentProofForDeal(
      refs.hubspotDealId,
      file,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      ...attachment,
      configured: true,
      dealId: refs.hubspotDealId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir el comprobante de pago final";
    console.error("[api/investments/final-payment-proof]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
