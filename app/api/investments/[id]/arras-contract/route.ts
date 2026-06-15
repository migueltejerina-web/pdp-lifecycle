import { NextResponse } from "next/server";

import {
  getArrasContractForDeal,
  getMockArrasContractInfo,
  uploadContractAttachmentForDeal,
} from "@/lib/hubspot/arras-contract";
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
    return NextResponse.json({ ...getMockArrasContractInfo(), configured: false });
  }

  try {
    const contract = await getArrasContractForDeal(refs.hubspotDealId);
    if (!contract) {
      return NextResponse.json({ ...getMockArrasContractInfo(), configured: true });
    }
    return NextResponse.json({ ...contract, configured: true, dealId: refs.hubspotDealId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot arras contract read failed";
    return NextResponse.json(
      { ...getMockArrasContractInfo(), configured: true, error: message },
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

    const contract = await uploadContractAttachmentForDeal(
      refs.hubspotDealId,
      file,
      file.name,
      file.type || "application/octet-stream"
    );

    return NextResponse.json({
      ...contract,
      configured: true,
      dealId: refs.hubspotDealId,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo subir el contrato firmado";
    console.error("[api/investments/arras-contract]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
