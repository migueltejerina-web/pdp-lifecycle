"use client";

import { useParams } from "next/navigation";

import { VistralLogo } from "@/components/vistral-logo";
import { ReservationStatusBadge } from "@/app/investments/[id]/components/ReservationStatusBadge";
import { mockProperty } from "@/app/investments/[id]/mock/property.mock";
import {
  formatEuro,
  formatEuroPerMonth,
  formatPercent,
} from "@/app/investments/[id]/utils/format";

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const propertyId = params.id ?? mockProperty.id;

  const metadata = [
    `${mockProperty.city} ${mockProperty.country}`,
    `${mockProperty.sqm}m²`,
    `${mockProperty.bedrooms} habitaciones`,
    `${mockProperty.bathrooms} baños`,
    `${mockProperty.parking} parking`,
  ].join(" · ");

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
            {mockProperty.address}
          </h1>
          <ReservationStatusBadge
            investmentId={propertyId}
            redirectOnReserve
          />
        </div>
        <p className="mt-2 text-sm text-[var(--vistral-semantic-text-secondary)]">{metadata}</p>

        <section className="mt-8 rounded-[var(--vistral-radius-6)] border border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)] p-6 shadow-[var(--vistral-shadow-level-1)]">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Precio</p>
              <p className="mt-1 text-xl font-semibold">
                {formatEuro(mockProperty.purchasePrice)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Yield neto</p>
              <p className="mt-1 text-xl font-semibold">
                {formatPercent(mockProperty.expectedNetYield)}
              </p>
            </div>
            <div>
              <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">Renta est.</p>
              <p className="mt-1 text-xl font-semibold">
                {formatEuroPerMonth(mockProperty.estimatedMonthlyRent)}
              </p>
            </div>
          </div>
        </section>

        <p className="mt-8 text-sm text-[var(--vistral-semantic-text-secondary)]">
          Pulsa <strong>Reservar 48h</strong> para bloquear la propiedad. El estado se refleja en
          HubSpot y, tras reservar, verás el seguimiento de tu operación.
        </p>
      </main>
    </div>
  );
}
