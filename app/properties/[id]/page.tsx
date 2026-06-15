"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { ReservationStatusBadge } from "@/app/investments/[id]/components/ReservationStatusBadge";
import { mockProperty, mockSummaryCard } from "@/app/investments/[id]/mock/property.mock";
import {
  EMPTY_FIELD,
  formatEuro,
  formatEuroPerMonth,
  formatPercent,
} from "@/app/investments/[id]/utils/format";
import { VistralLogo } from "@/components/vistral-logo";
import {
  applyListingPropertyDetails,
  type HubSpotPropertyDetails,
} from "@/utils/apply-listing-property";

function buildMetadata(property: typeof mockProperty): string {
  const location = [property.city, property.country].filter(Boolean).join(" ");
  const parts = [
    location || null,
    property.sqm != null ? `${property.sqm}m²` : null,
    property.bedrooms != null ? `${property.bedrooms} habitaciones` : null,
    property.bathrooms != null ? `${property.bathrooms} baños` : null,
    property.parking != null ? `${property.parking} parking` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" · ") : EMPTY_FIELD;
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params.id ?? mockProperty.id;
  const [listingPropertyDetails, setListingPropertyDetails] = useState<HubSpotPropertyDetails>({});

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/investments/${propertyId}/property`)
      .then((response) => response.json())
      .then((data: HubSpotPropertyDetails) => {
        if (cancelled) return;
        setListingPropertyDetails({
          ...(typeof data.address === "string" ? { address: data.address } : {}),
          ...(typeof data.city === "string" ? { city: data.city } : {}),
          ...(typeof data.country === "string" ? { country: data.country } : {}),
          ...(typeof data.purchasePrice === "number" ? { purchasePrice: data.purchasePrice } : {}),
          ...(typeof data.initialInvestment === "number"
            ? { initialInvestment: data.initialInvestment }
            : {}),
          ...(typeof data.totalInvestment === "number"
            ? { totalInvestment: data.totalInvestment }
            : {}),
          ...(typeof data.estimatedMonthlyRent === "number"
            ? { estimatedMonthlyRent: data.estimatedMonthlyRent }
            : {}),
          ...(typeof data.summaryNetYield === "number"
            ? { summaryNetYield: data.summaryNetYield }
            : {}),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [propertyId]);

  const property = useMemo(() => {
    const shell = { ...mockProperty, id: propertyId };
    return applyListingPropertyDetails(shell, mockSummaryCard, listingPropertyDetails).property;
  }, [listingPropertyDetails, propertyId]);

  const metadata = buildMetadata(property);
  const netYield = property.expectedNetYield ?? property.summaryNetYield;

  return (
    <div
      className="min-h-dvh bg-[var(--vistral-semantic-bg-subtle)]"
      style={{ fontFamily: "var(--vistral-font-family-sans)" }}
    >
      <header className="border-b border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)] px-6 py-4">
        <VistralLogo className="h-8 w-auto" />
      </header>

      <main className="mx-auto max-w-[720px] px-6 py-10">
        <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Propiedad disponible</p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold text-[var(--vistral-semantic-text-primary)]">
            {property.address ?? EMPTY_FIELD}
          </h1>
          <ReservationStatusBadge investmentId={propertyId} redirectOnReserve />
        </div>
        <p className="mt-2 text-sm text-[var(--vistral-semantic-text-secondary)]">{metadata}</p>

        <section className="mt-8 rounded-[var(--vistral-radius-6)] border border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)] p-6 shadow-[var(--vistral-shadow-level-1)]">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Precio</p>
              <p className="mt-1 text-xl font-semibold">
                {formatEuro(property.purchasePrice ?? property.totalInvestment)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Yield neto</p>
              <p className="mt-1 text-xl font-semibold">{formatPercent(netYield)}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Renta est.</p>
              <p className="mt-1 text-xl font-semibold">
                {formatEuroPerMonth(property.estimatedMonthlyRent)}
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-sm text-[var(--vistral-semantic-text-secondary)]">
          Pulsa <strong>Reservar 48h</strong> para bloquear la propiedad. El estado se refleja en
          HubSpot y, tras reservar, verás el seguimiento de tu operación en{" "}
          <a
            href={`/investments/${propertyId}`}
            className="font-medium text-[#162EB7] underline-offset-2 hover:underline"
          >
            Mi operación
          </a>
          .
        </p>
      </main>
    </div>
  );
}
