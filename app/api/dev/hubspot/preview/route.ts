import { NextResponse } from "next/server";

import {
  getPaymentAmountsForDeal,
  getPaymentAmountsForListing,
} from "@/lib/hubspot/arras";
import { hubSpotFetch, isHubSpotConfigured } from "@/lib/hubspot/client";
import {
  HUBSPOT_DEAL_PAYMENT_PROPERTIES,
  HUBSPOT_LISTING_OBJECT_TYPE,
  HUBSPOT_LISTING_PAYMENT_PROPERTIES,
} from "@/lib/hubspot/constants";

const HUBSPOT_PORTAL_ID = "146997468";

function isDevPreviewEnabled(): boolean {
  return process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENV === "dev";
}

function hubSpotRecordUrl(objectType: string, recordId: string): string {
  return `https://app-eu1.hubspot.com/contacts/${HUBSPOT_PORTAL_ID}/record/${objectType}/${recordId}`;
}

interface AssociationsResponse {
  results?: Array<{ toObjectId: string | number }>;
}

interface HubSpotObjectResponse {
  id: string;
  properties: Record<string, string | null | undefined>;
}

interface SearchResponse {
  total?: number;
  results?: HubSpotObjectResponse[];
}

async function searchHubSpot(
  objectType: "deals" | typeof HUBSPOT_LISTING_OBJECT_TYPE,
  query: string,
  properties: string[]
): Promise<HubSpotObjectResponse[]> {
  const data = await hubSpotFetch<SearchResponse>(
    `/crm/v3/objects/${objectType}/search`,
    {
      method: "POST",
      body: JSON.stringify({
        query,
        properties,
        limit: 10,
      }),
    }
  );
  return data.results ?? [];
}

export async function GET(request: Request) {
  if (!isDevPreviewEnabled()) {
    return NextResponse.json({ error: "Not available outside development" }, { status: 404 });
  }

  if (!isHubSpotConfigured()) {
    return NextResponse.json(
      {
        error: "HUBSPOT_PRIVATE_APP_TOKEN is missing in .env.local",
        hint: "Copy it from your HubSpot Private App (Settings → Integrations → Private Apps)",
      },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const dealId = searchParams.get("dealId")?.trim();
  const listingId = searchParams.get("listingId")?.trim();
  const query = searchParams.get("q")?.trim();

  if (query && !dealId && !listingId) {
    try {
      const [deals, listings] = await Promise.all([
        searchHubSpot("deals", query, ["dealname"]),
        searchHubSpot(HUBSPOT_LISTING_OBJECT_TYPE, query, [
          "hs_name",
          "hs_address_1",
          "ops___property_unique_id",
          "arras_to_be_collected",
          "senal_to_be_collected",
        ]),
      ]);

      return NextResponse.json({
        mode: "search",
        query,
        deals: deals.map((deal) => ({
          id: deal.id,
          name: deal.properties.dealname,
          hubspotUrl: hubSpotRecordUrl("0-3", deal.id),
          previewUrl: `/api/dev/hubspot/preview?dealId=${deal.id}`,
        })),
        listings: listings.map((listing) => ({
          id: listing.id,
          name: listing.properties.hs_name,
          address: listing.properties.hs_address_1 ?? null,
          propertyId: listing.properties.ops___property_unique_id ?? null,
          arras_to_be_collected: listing.properties.arras_to_be_collected ?? null,
          senal_to_be_collected: listing.properties.senal_to_be_collected ?? null,
          hubspotUrl: hubSpotRecordUrl(HUBSPOT_LISTING_OBJECT_TYPE, listing.id),
          previewUrl: `/api/dev/hubspot/preview?listingId=${listing.id}`,
        })),
        notes: [
          "Si no aparece tu registro, copia el ID numérico de la URL de HubSpot y usa dealId= o listingId=.",
        ],
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "HubSpot search failed";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (!dealId && !listingId) {
    return NextResponse.json(
      {
        error: "Provide dealId, listingId, or q",
        examples: [
          "/api/dev/hubspot/preview?q=SP-JD9-I4A-006095",
          "/api/dev/hubspot/preview?q=Miguel Test CX",
          "/api/dev/hubspot/preview?dealId=495605739736",
          "/api/dev/hubspot/preview?listingId=1156018536637",
        ],
      },
      { status: 400 }
    );
  }

  try {
    if (listingId) {
      const listing = await hubSpotFetch<HubSpotObjectResponse>(
        `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}?properties=hs_name,${HUBSPOT_LISTING_PAYMENT_PROPERTIES}`
      );
      const resolved = await getPaymentAmountsForListing(listingId);
      const dealAssociations = await hubSpotFetch<AssociationsResponse>(
        `/crm/v4/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${listingId}/associations/deals`
      );

      return NextResponse.json({
        mode: "listing",
        listing: {
          id: listingId,
          name: listing.properties.hs_name,
          properties: listing.properties,
          hubspotUrl: hubSpotRecordUrl(HUBSPOT_LISTING_OBJECT_TYPE, listingId),
        },
        associatedDealIds: (dealAssociations.results ?? []).map((row) => String(row.toObjectId)),
        resolved,
        env: {
          HUBSPOT_MOCK_LISTING_ID: listingId,
          HUBSPOT_MOCK_DEAL_ID: dealAssociations.results?.[0]
            ? String(dealAssociations.results[0].toObjectId)
            : undefined,
        },
      });
    }

    const deal = await hubSpotFetch<HubSpotObjectResponse>(
      `/crm/v3/objects/deals/${dealId}?properties=dealname,${HUBSPOT_DEAL_PAYMENT_PROPERTIES}`
    );
    const listingAssociations = await hubSpotFetch<AssociationsResponse>(
      `/crm/v4/objects/deals/${dealId}/associations/${HUBSPOT_LISTING_OBJECT_TYPE}`
    );
    const associatedListingIds = (listingAssociations.results ?? []).map((row) =>
      String(row.toObjectId)
    );

    const listings = await Promise.all(
      associatedListingIds.map(async (id) => {
        const listing = await hubSpotFetch<HubSpotObjectResponse>(
          `/crm/v3/objects/${HUBSPOT_LISTING_OBJECT_TYPE}/${id}?properties=hs_name,hs_address_1,ops___property_unique_id,${HUBSPOT_LISTING_PAYMENT_PROPERTIES}`
        );
        return {
          id,
          name: listing.properties.hs_name,
          address: listing.properties.hs_address_1 ?? null,
          propertyId: listing.properties.ops___property_unique_id ?? null,
          arras_to_be_collected: listing.properties.arras_to_be_collected ?? null,
          senal_to_be_collected: listing.properties.senal_to_be_collected ?? null,
          hubspotUrl: hubSpotRecordUrl(HUBSPOT_LISTING_OBJECT_TYPE, id),
        };
      })
    );

    const resolved = await getPaymentAmountsForDeal(dealId!);

    return NextResponse.json({
      mode: "deal",
      deal: {
        id: dealId,
        name: deal.properties.dealname,
        properties: deal.properties,
        hubspotUrl: hubSpotRecordUrl("0-3", dealId!),
      },
      associatedListings: listings,
      resolved,
      env: {
        HUBSPOT_MOCK_DEAL_ID: dealId,
        HUBSPOT_MOCK_LISTING_ID: resolved?.listingId ?? associatedListingIds[0],
      },
      notes: [
        "Si arras/senal salen null, rellena esos campos en el listing de HubSpot o usa un listing con datos.",
        "Tras configurar .env.local, reinicia npm run dev y abre /investments/prop_001",
      ],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "HubSpot preview failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
