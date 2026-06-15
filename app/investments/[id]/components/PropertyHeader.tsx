"use client";

import { Share2 } from "lucide-react";
import type { PropertyMock } from "../mock/property.mock";
import { EMPTY_FIELD, formatEuro, formatEuroPerMonth, formatPercent } from "../utils/format";
import { ReservationStatusBadge } from "./ReservationStatusBadge";

interface PropertyHeaderProps {
  property: PropertyMock;
}

interface DataItemProps {
  label: string;
  value: string;
}

function DataItem({ label, value }: DataItemProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-[var(--vistral-semantic-text-secondary)]">{label}</span>
      <span className="text-2xl font-bold leading-8 text-[var(--vistral-semantic-text-primary)]">
        {value}
      </span>
    </div>
  );
}

export function PropertyHeader({ property }: PropertyHeaderProps) {
  const location = [property?.city, property?.country].filter(Boolean).join(" ");
  const metadataParts = [
    location || null,
    property?.sqm != null ? `${property.sqm}m²` : null,
    property?.bedrooms != null ? `${property.bedrooms} habitaciones` : null,
    property?.bathrooms != null ? `${property.bathrooms} baños` : null,
    property?.parking != null ? `${property.parking} parking` : null,
  ].filter(Boolean);
  const metadata = metadataParts.length > 0 ? metadataParts.join(" · ") : EMPTY_FIELD;

  return (
    <section className="rounded-[var(--vistral-radius-6)] border border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)] p-6 shadow-[var(--vistral-shadow-level-1)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-[var(--vistral-semantic-text-primary)]">
              {property?.address ?? EMPTY_FIELD}
            </h1>
            <ReservationStatusBadge investmentId={property?.id ?? ""} />
          </div>
          <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">{metadata}</p>
        </div>

        <button
          type="button"
          aria-label="Compartir"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#D9E7FF] text-[#162EB7] transition-opacity hover:opacity-90"
        >
          <Share2 className="size-4" strokeWidth={1.75} />
        </button>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-6 border-t border-[var(--vistral-semantic-border-subtle)] pt-6">
        <DataItem label="Inversión total" value={formatEuro(property?.totalInvestment)} />
        <DataItem
          label="Yield neto esperado"
          value={formatPercent(property?.expectedNetYield ?? property?.summaryNetYield)}
        />
        <DataItem label="Renta estimada" value={formatEuroPerMonth(property?.estimatedMonthlyRent)} />
      </div>
    </section>
  );
}
