import { NextResponse } from "next/server";

import { isDocumentViewKind } from "@/lib/investments/document-view.types";
import { resolveDocumentSourceUrl } from "@/lib/hubspot/document-sources";
import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";
import { fetchRemoteDocument } from "@/lib/portfolio/fetch-document";

const FILENAME_BY_KIND: Record<string, string> = {
  "arras-contract": "contrato-arras.pdf",
  "arras-receipt": "comprobante-arras.pdf",
  "exchange-fee-receipt": "comprobante-tarifa-prophero.pdf",
  "company-deed": "poder-notarial.pdf",
  "fein-signature": "fein.pdf",
  "final-payment-proof": "comprobante-pago-final.pdf",
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; kind: string }> }
) {
  const { id, kind } = await context.params;

  if (!isDocumentViewKind(kind)) {
    return NextResponse.json({ error: "Tipo de documento inválido" }, { status: 400 });
  }

  const refs = getInvestmentHubSpotRefs(id);
  if (!refs) {
    return NextResponse.json({ error: "Investment not found" }, { status: 404 });
  }

  if (!isHubSpotConfigured() || !refs.hubspotDealId) {
    return NextResponse.json({ error: "HubSpot is not configured" }, { status: 503 });
  }

  try {
    const sourceUrl = await resolveDocumentSourceUrl(refs.hubspotDealId, kind);
    if (!sourceUrl) {
      return NextResponse.json({ error: "Documento no disponible" }, { status: 404 });
    }

    const { buffer, contentType } = await fetchRemoteDocument(sourceUrl);
    const filename = FILENAME_BY_KIND[kind] ?? "documento.pdf";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar el documento";
    console.error(`[api/investments/documents/${kind}]`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
