"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";

export interface ReservationStatus {
  uiStatus: "available" | "blocked" | "signed" | "blocked_by_ph" | "coming_soon";
  isClickable: boolean;
  docusignStatus?: string | null;
  envelopeStatus?: string | null;
  arrasContractEnvelopeStatus?: string | null;
  arrasContractUrl?: string | null;
  arrasContractSigned?: boolean;
  arrasContractSignedVia?: "docusign_envelope" | "hubspot_attachment" | "listing_status" | null;
  blockHoursRemaining?: number | null;
  blockExpiresAt?: string | null;
  configured?: boolean;
  error?: string;
}

const POLL_INTERVAL_MS = 20_000;

interface ReservationStatusBadgeProps {
  investmentId: string;
  className?: string;
  /** After blocking, navigate to Mi Operación */
  redirectOnReserve?: boolean;
}

function badgeLabel(status: ReservationStatus): string {
  switch (status.uiStatus) {
    case "available":
      return "Reservar 48h";
    case "blocked":
      if (status.blockHoursRemaining != null && status.blockHoursRemaining > 0) {
        return `Reservada · ${status.blockHoursRemaining}h`;
      }
      return "Reservada";
    case "signed":
      return "Firmada";
    case "blocked_by_ph":
      return "Bloqueada PH";
    case "coming_soon":
      return "Próximamente";
    default:
      return "Disponible";
  }
}

function badgeStyles(status: ReservationStatus): string {
  switch (status.uiStatus) {
    case "available":
      return "bg-white text-[#162EB7] border border-[#4D7AFF] hover:bg-[#EEF4FF] cursor-pointer";
    case "blocked":
      return "bg-[#EEF4FF] text-[#162EB7] border border-[#4D7AFF]";
    case "signed":
      return "bg-[#E8F8EF] text-[#0F6B3A] border border-[#9BE3B8]";
    case "blocked_by_ph":
    case "coming_soon":
      return "bg-[var(--vistral-semantic-bg-subtle)] text-[var(--vistral-semantic-text-secondary)] border border-[var(--vistral-semantic-border-muted)]";
    default:
      return "bg-[#EEF4FF] text-[#162EB7]";
  }
}

export function ReservationStatusBadge({
  investmentId,
  className,
  redirectOnReserve = false,
}: ReservationStatusBadgeProps) {
  const router = useRouter();
  const [status, setStatus] = useState<ReservationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  const fetchStatus = useCallback(async () => {
    const response = await fetch(`/api/investments/${investmentId}/reservation`);
    const data = (await response.json()) as ReservationStatus;
    setStatus(data);
    setLoading(false);
  }, [investmentId]);

  useEffect(() => {
    void fetchStatus();
    const intervalId = window.setInterval(() => {
      void fetchStatus();
    }, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [fetchStatus]);

  async function handleClick() {
    if (!status?.isClickable || reserving) return;

    setReserving(true);
    try {
      const response = await fetch(`/api/investments/${investmentId}/reservation`, {
        method: "POST",
      });
      const data = (await response.json()) as ReservationStatus & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo reservar la propiedad");
      }
      setStatus(data);
      if (redirectOnReserve) {
        router.push(`/investments/${investmentId}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setReserving(false);
    }
  }

  if (loading) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium opacity-60",
          className
        )}
      >
        …
      </span>
    );
  }

  if (!status) return null;

  const label = reserving ? "Reservando…" : badgeLabel(status);
  const Component = status.isClickable ? "button" : "span";

  return (
    <Component
      type={status.isClickable ? "button" : undefined}
      onClick={status.isClickable ? handleClick : undefined}
      disabled={reserving}
      title={
        status.arrasContractSigned
          ? status.arrasContractSignedVia === "hubspot_attachment"
            ? "Contrato de arras disponible (subido por el coach)"
            : status.arrasContractSignedVia === "docusign_envelope"
              ? `Contrato firmado vía DocuSign${status.envelopeStatus ? `: ${status.envelopeStatus}` : ""}`
              : "Contrato de arras firmado"
          : status.envelopeStatus
            ? `DocuSign: ${status.envelopeStatus}`
            : status.docusignStatus
              ? `Estado HubSpot: ${status.docusignStatus}`
              : undefined
      }
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors",
        badgeStyles(status),
        status.isClickable && "disabled:cursor-wait disabled:opacity-70",
        className
      )}
    >
      {label}
    </Component>
  );
}
