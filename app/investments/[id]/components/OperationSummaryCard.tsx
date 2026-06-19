"use client";

import { Clock, Info } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { SummaryCard } from "@/types/lifecycle";
import { InvestmentFileUploadCta, isUploadAction } from "./InvestmentFileUploadCta";
import { PoderNotarialStartCta } from "./PoderNotarialStartCta";
import { useCountdownFromExpiry } from "../hooks/use-countdown-from-expiry";
import type { PropertyMock } from "../mock/property.mock";
import { handleLifecycleCtaAction } from "../utils/lifecycle-cta";
import { formatEuro, formatPercent } from "../utils/format";

interface OperationSummaryCardProps {
  property: PropertyMock;
  summaryCard: SummaryCard;
  investmentId: string;
  onUploadComplete?: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
  tooltip?: string;
}

function SummaryCountdownBadge({ hours, minutes }: { hours: number; minutes: number }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full bg-[var(--vistral-semantic-bg-muted)] px-2 py-1 text-xs leading-4">
      <Clock
        className="size-3 text-[var(--vistral-semantic-text-secondary)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="font-semibold text-[var(--vistral-semantic-text-primary)]">{hours}</span>
      <span className="text-[var(--vistral-semantic-text-secondary)]">hrs</span>
      <span className="text-[var(--vistral-semantic-text-secondary)]">:</span>
      <span className="font-semibold text-[var(--vistral-semantic-text-primary)]">{minutes}</span>
      <span className="text-[var(--vistral-semantic-text-secondary)]">min</span>
    </div>
  );
}

function SummaryRow({ label, value, tooltip }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--vistral-semantic-text-secondary)]">
        {label}
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`Más información sobre ${label}`}
                className="inline-flex text-[var(--vistral-semantic-icon-secondary)] transition-opacity hover:opacity-80"
              >
                <Info className="size-3.5" strokeWidth={1.75} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">{tooltip}</TooltipContent>
          </Tooltip>
        ) : null}
      </span>
      <span className="text-sm font-medium text-[var(--vistral-semantic-text-primary)]">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="h-px w-full bg-[var(--vistral-semantic-border-muted)]" />;
}

export function OperationSummaryCard({
  property,
  summaryCard,
  investmentId,
  onUploadComplete,
}: OperationSummaryCardProps) {
  const showCountdown =
    summaryCard.countdownHours !== undefined && summaryCard.countdownMinutes !== undefined;
  const countdown = useCountdownFromExpiry(
    summaryCard.countdownExpiresAt,
    summaryCard.countdownHours ?? 0,
    summaryCard.countdownMinutes ?? 0
  );

  return (
    <TooltipProvider delayDuration={200}>
      <section className="overflow-hidden rounded-[var(--vistral-radius-6)] border border-[color-mix(in_srgb,#4D7AFF_16%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--vistral-semantic-bg-info)_60%,white)_0%,var(--vistral-semantic-bg-default)_100%)] shadow-[var(--vistral-shadow-level-1)]">
        <div className="p-6">
          {summaryCard.reservedDate ? (
            <p className="text-sm text-[var(--vistral-semantic-text-secondary)]">
              Reservado el {summaryCard.reservedDate}
            </p>
          ) : null}

          <h3 className="mt-4 text-2xl font-bold text-[var(--vistral-semantic-text-primary)]">
            {summaryCard.stageTitle}
          </h3>

          <div className="mt-4">
            <SummaryRow label="Precio de la propiedad" value={formatEuro(property.purchasePrice)} />
            <Divider />
            <SummaryRow
              label="Inversión inicial"
              value={formatEuro(property.initialInvestment)}
              tooltip="Capital necesario para completar la compra, incluyendo arras, gastos y reforma."
            />
            <Divider />
            <SummaryRow
              label="Rendimiento neto esperado"
              value={formatPercent(property.summaryNetYield)}
            />
            <Divider />
            <SummaryRow
              label="Crecimiento del precio"
              value={formatPercent(property.priceGrowth)}
              tooltip="Incremento estimado del valor de la propiedad a 5 años."
            />
          </div>

          <div className="mt-5 rounded-[var(--vistral-radius-2)] border border-[var(--vistral-semantic-border-muted)] bg-[rgba(0,0,0,0.04)] p-4">
            {summaryCard.actionBoxTitle ? (
              <div className="mb-3 flex items-center justify-between gap-2">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--vistral-semantic-text-secondary)]">
                  {summaryCard.actionBoxTitle}
                </p>
                {summaryCard.actionBoxLinkLabel && summaryCard.actionBoxLinkAction ? (
                  <button
                    type="button"
                    onClick={() =>
                      handleLifecycleCtaAction(summaryCard.actionBoxLinkAction!)
                    }
                    className="text-xs font-medium text-[#162EB7] transition-opacity hover:opacity-80"
                  >
                    {summaryCard.actionBoxLinkLabel}
                  </button>
                ) : null}
              </div>
            ) : showCountdown ? (
              <div className="mb-3">
                <SummaryCountdownBadge hours={countdown.hours} minutes={countdown.minutes} />
              </div>
            ) : null}
            {summaryCard.paymentArrasAmount && summaryCard.paymentSenalAmount ? (
              <div className="mb-3 space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--vistral-semantic-text-secondary)]">
                    Arras
                  </span>
                  <span className="text-sm font-medium text-[var(--vistral-semantic-text-primary)]">
                    {summaryCard.paymentArrasAmount}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-[var(--vistral-semantic-text-secondary)]">
                    Señal
                  </span>
                  <span className="text-sm font-medium text-[var(--vistral-semantic-text-primary)]">
                    {summaryCard.paymentSenalAmount}
                  </span>
                </div>
                <Divider />
              </div>
            ) : null}
            {summaryCard.paymentArrasAmount && summaryCard.paymentSenalAmount ? (
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--vistral-semantic-text-secondary)]">
                Total a transferir
              </p>
            ) : null}
            <p className="text-2xl font-semibold text-[var(--vistral-semantic-text-primary)]">
              {summaryCard.proximaAccionAmount ?? summaryCard.proximaAccion}
            </p>
            <p className="mt-1 text-sm text-[var(--vistral-semantic-text-secondary)]">
              {summaryCard.proximaAccionSubtext}
            </p>
          </div>

          {summaryCard.escriturasEstimadas ? (
            <div className="mt-4">
              <Divider />
              <SummaryRow
                label="Escrituras estimadas"
                value={summaryCard.escriturasEstimadas}
              />
            </div>
          ) : null}

          {summaryCard.primaryCtaLabel && summaryCard.primaryCtaAction ? (
            isUploadAction(summaryCard.primaryCtaAction) ? (
              <InvestmentFileUploadCta
                investmentId={investmentId}
                action={summaryCard.primaryCtaAction}
                label={summaryCard.primaryCtaLabel}
                onUploaded={onUploadComplete}
                variant="sidebar"
              />
            ) : summaryCard.primaryCtaAction === "start_notarial" ? (
              <PoderNotarialStartCta
                investmentId={investmentId}
                label={summaryCard.primaryCtaLabel}
                variant="sidebar"
                onComplete={onUploadComplete}
              />
            ) : (
              <button
                type="button"
                onClick={() =>
                  handleLifecycleCtaAction(
                    summaryCard.primaryCtaAction!,
                    summaryCard.primaryCtaUrl
                  )
                }
                className="mt-5 flex h-10 w-full items-center justify-center rounded-full bg-[var(--vistral-semantic-interactive-brand-default)] text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                {summaryCard.primaryCtaLabel}
              </button>
            )
          ) : null}
        </div>
      </section>
    </TooltipProvider>
  );
}
