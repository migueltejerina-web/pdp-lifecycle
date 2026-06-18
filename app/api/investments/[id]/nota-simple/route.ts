import { NextResponse } from "next/server";

import { isHubSpotConfigured } from "@/lib/hubspot/client";
import { getInvestmentHubSpotRefs } from "@/lib/hubspot/investment-registry";
import {
  buildNotaSimpleProxyUrl,
  getNotaSimpleTechUrlAtIndex,
  getNotaSimpleTechUrlsForDeal,
} from "@/lib/hubspot/nota-simple";
import { fetchRemoteDocument } from "@/lib/portfolio/fetch-document";

export async function GET(
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

  const { searchParams } = new URL(request.url);
  const indexParam = searchParams.get("index");

  try {
    if (indexParam == null) {
      const sourceUrls = await getNotaSimpleTechUrlsForDeal(
        refs.hubspotDealId,
        refs.hubspotListingId
      );

      return NextResponse.json({
        configured: true,
        count: sourceUrls.length,
        documents: sourceUrls.map((_, index) => ({
          index,
          label:
            sourceUrls.length > 1 ? `Nota simple ${index + 1}` : "Nota simple",
          proxyUrl: buildNotaSimpleProxyUrl(id, index),
        })),
      });
    }

    const index = Number(indexParam);
    if (!Number.isInteger(index) || index < 0) {
      return NextResponse.json({ error: "Índice de documento inválido" }, { status: 400 });
    }

    const sourceUrl = await getNotaSimpleTechUrlAtIndex(
      refs.hubspotDealId,
      index,
      refs.hubspotListingId
    );

    if (!sourceUrl) {
      return NextResponse.json({ error: "Documento no disponible" }, { status: 404 });
    }

    const { buffer, contentType } = await fetchRemoteDocument(sourceUrl);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="nota-simple-${index + 1}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "No se pudo cargar la nota simple";
    console.error("[api/investments/nota-simple]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
