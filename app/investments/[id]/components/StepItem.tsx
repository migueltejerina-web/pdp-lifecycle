"use client";

import { Check, Clock, FileSignature, Link2, Send, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  EnrichedStep,
  StepCTA,
  StepCTAIcon,
  StepCTAVariant,
  StepStatus,
} from "@/types/lifecycle";
import { useCountdownFromExpiry } from "../hooks/use-countdown-from-expiry";
import { handleLifecycleCtaClick } from "../utils/lifecycle-cta";
import { getUploadEndpoint, renderStepUploadCta } from "./InvestmentFileUploadCta";
import { PoderNotarialDeclineCta } from "./PoderNotarialDeclineCta";
import { PoderNotarialResumeCta } from "./PoderNotarialResumeCta";
import { PoderNotarialStartCta } from "./PoderNotarialStartCta";

interface StepItemProps {
  step: EnrichedStep;
  isLast: boolean;
  connectorCompleted: boolean;
  investmentId?: string;
  onUploadComplete?: () => void;
}

function StepDot({ status, isRecommended }: { status: StepStatus; isRecommended?: boolean }) {
  if (status === "completed") {
    return (
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#2050F6]">
        <Check className="size-3.5 text-white" strokeWidth={2.5} aria-hidden />
      </div>
    );
  }

  if (status === "in_progress") {
    if (isRecommended) {
      return (
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#EEF4FF]">
          <span aria-hidden className="size-2 rounded-full bg-[#2050F6]" />
        </div>
      );
    }

    return (
      <span
        aria-hidden
        className="size-4 shrink-0 rounded-full border-2 border-[#2050F6] bg-[var(--vistral-semantic-bg-default)]"
      />
    );
  }

  return (
    <span aria-hidden className="size-4 shrink-0 rounded-full bg-[#D4D4D8]" />
  );
}

function StepOwnerBadge({ owner }: { owner?: EnrichedStep["owner"] }) {
  if (owner !== "prophero") return null;

  return (
    <span
      title="Lo gestiona el equipo PropHero"
      className="inline-flex shrink-0 items-center rounded-full bg-[#EEF4FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#162EB7]"
    >
      PropHero
    </span>
  );
}

function StepCountdownBadge({
  label,
  hours,
  minutes,
}: {
  label: string;
  hours: number;
  minutes: number;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <Clock
        className="size-3 text-[var(--vistral-semantic-text-secondary)]"
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="whitespace-nowrap text-xs leading-4 text-[var(--vistral-semantic-text-secondary)]">
        {label}
      </span>
      <span className="inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-[#E4E4E7] px-2 py-1 text-xs leading-4">
        <span className="font-semibold text-[var(--vistral-semantic-text-primary)]">{hours}</span>
        <span className="text-[var(--vistral-semantic-text-secondary)]">hrs</span>
        <span className="text-[var(--vistral-semantic-text-secondary)]">:</span>
        <span className="font-semibold text-[var(--vistral-semantic-text-primary)]">
          {minutes}
        </span>
        <span className="text-[var(--vistral-semantic-text-secondary)]">min</span>
      </span>
    </div>
  );
}

function resolveCtaVariant(cta: StepCTA, isCompleted: boolean): StepCTAVariant {
  if (cta.variant) return cta.variant;
  if (isCompleted) return "secondary";
  if (cta.action === "mark_complete" || cta.action === "decline_poa") return "title_link";
  if (
    cta.action === "upload_file" ||
    cta.action === "upload_contract" ||
    cta.action === "upload_arras_receipt" ||
    cta.action === "upload_exchange_fee_receipt" ||
    cta.action === "upload_company_deed" ||
    cta.action === "upload_final_payment_proof" ||
    cta.action === "upload_fein_signature_doc" ||
    cta.action === "open_mail" ||
    cta.action === "view_payment" ||
    cta.action === "open_document" ||
    cta.action === "start_notarial"
  ) {
    return "primary";
  }
  return "secondary";
}

function CtaIcon({ icon }: { icon: StepCTAIcon }) {
  if (icon === "upload") {
    return <Upload className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />;
  }
  return <Send className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />;
}

function StepTitleLinkCta({ cta }: { cta: StepCTA }) {
  return (
    <button
      type="button"
      onClick={() => handleLifecycleCtaClick(cta)}
      className="shrink-0 text-xs font-medium leading-5 text-[#162EB7] transition-opacity hover:opacity-80"
    >
      {cta.label}
    </button>
  );
}

function StepSecondaryLinkCta({ cta }: { cta: StepCTA }) {
  return (
    <button
      type="button"
      onClick={() => handleLifecycleCtaClick(cta)}
      className="inline-flex items-center gap-1.5 text-xs font-medium leading-5 text-[#162EB7] transition-opacity hover:opacity-80"
    >
      {cta.icon ? <CtaIcon icon={cta.icon} /> : null}
      {cta.label}
    </button>
  );
}

function StepPrimaryCta({ cta }: { cta: StepCTA }) {
  const isSolid = cta.action === "start_notarial";

  return (
    <button
      type="button"
      onClick={() => handleLifecycleCtaClick(cta)}
      className={cn(
        "inline-flex h-8 shrink-0 items-center justify-center rounded-full px-4 text-xs font-medium transition-opacity hover:opacity-90",
        isSolid ? "bg-[#2050F6] text-white" : "bg-[#D9E7FF] text-[#162EB7]"
      )}
    >
      {cta.label}
    </button>
  );
}

function StepCompletedLinkCta({ cta }: { cta: StepCTA }) {
  return (
    <button
      type="button"
      onClick={() => handleLifecycleCtaClick(cta)}
      className="text-left text-xs font-medium leading-5 text-[#162EB7] transition-opacity hover:opacity-80"
    >
      {cta.label}
    </button>
  );
}

function shouldShowCopy(step: EnrichedStep): boolean {
  if (!step.resolvedCopy) return false;
  return !step.resolvedCTAs.some((cta) => cta.label === step.resolvedCopy);
}

function partitionCTAs(ctas: StepCTA[], isCompleted: boolean) {
  const titleLinkCtas: StepCTA[] = [];
  const primaryCtas: StepCTA[] = [];
  const secondaryCtas: StepCTA[] = [];

  for (const cta of ctas) {
    const variant = resolveCtaVariant(cta, isCompleted);
    if (variant === "title_link") titleLinkCtas.push(cta);
    else if (variant === "primary") primaryCtas.push(cta);
    else secondaryCtas.push(cta);
  }

  return { titleLinkCtas, primaryCtas, secondaryCtas };
}

function renderUploadCta(
  cta: StepCTA,
  stepId: string,
  investmentId?: string,
  onUploaded?: () => void
) {
  return renderStepUploadCta(
    cta,
    stepId,
    investmentId,
    onUploaded,
    <StepPrimaryCta key={`${stepId}-${cta.action}-${cta.label}`} cta={cta} />
  );
}

export function StepItem({
  step,
  isLast,
  connectorCompleted,
  investmentId,
  onUploadComplete,
}: StepItemProps) {
  const isCompleted = step.status === "completed";
  const isInProgress = step.status === "in_progress";
  const isRecommended = step.isRecommended === true;
  const showActiveUi = isInProgress;
  const countdown = useCountdownFromExpiry(
    step.countdownExpiresAt,
    step.countdownHours ?? 0,
    step.countdownMinutes ?? 0
  );
  const showCountdown =
    isInProgress &&
    step.countdown === true &&
    step.countdownHours !== undefined &&
    step.countdownMinutes !== undefined;
  const showCopy = (isCompleted || showActiveUi) && shouldShowCopy(step);
  const isCompletedPaymentCopy =
    isCompleted &&
    (step.id === "pagar_arras" || step.id === "pagar_fee_prophero") &&
    Boolean(step.resolvedCopy?.startsWith("Importe:"));
  const { titleLinkCtas, primaryCtas, secondaryCtas } = partitionCTAs(
    step.resolvedCTAs,
    isCompleted
  );

  return (
    <div className="flex gap-2">
      <div className="flex w-5 shrink-0 flex-col items-center self-stretch pt-0.5">
        <StepDot status={step.status} isRecommended={isRecommended} />
        {!isLast ? (
          <span
            aria-hidden
            className={cn(
              "mt-0.5 w-0.5 flex-1 min-h-4 rounded-full",
              connectorCompleted ? "bg-[#2050F6]" : "bg-[#D4D4D8]"
            )}
          />
        ) : null}
      </div>

      <div className={cn("min-w-0 flex-1", !isLast && "pb-4")}>
        <div
          className={cn(
            "flex gap-3",
            isInProgress && (showCountdown || titleLinkCtas.length > 0)
              ? "items-start justify-between"
              : "flex-col"
          )}
        >
          <div
            className={cn(
              "min-w-0",
              showActiveUi && titleLinkCtas.length > 0
                ? "flex flex-1 items-start justify-between gap-3"
                : "w-full"
            )}
          >
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {showActiveUi && step.id === "firma_contrato" ? (
                <FileSignature
                  className="size-4 shrink-0 text-[var(--vistral-semantic-icon-brand)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
              ) : null}
              {showActiveUi &&
              (step.id === "pagar_arras" || step.id === "pagar_fee_prophero") ? (
                <Link2
                  className="size-4 shrink-0 text-[var(--vistral-semantic-icon-brand)]"
                  strokeWidth={1.75}
                  aria-hidden
                />
              ) : null}
              <p
                className={cn(
                  "text-base leading-6 tracking-[-0.02em]",
                  showActiveUi && isRecommended
                    ? "font-semibold text-[var(--vistral-semantic-text-primary)]"
                    : showActiveUi
                      ? "font-medium text-[var(--vistral-semantic-text-primary)]"
                      : isCompleted
                        ? "font-medium text-[var(--vistral-semantic-text-primary)]"
                        : "font-medium text-[var(--vistral-semantic-text-secondary)]"
                )}
              >
                {step.title}
              </p>
              <StepOwnerBadge owner={step.owner} />
            </div>

            {showActiveUi && titleLinkCtas.length > 0 ? (
              <div className="flex shrink-0 flex-col items-end gap-1">
                {titleLinkCtas.map((cta) =>
                  cta.action === "decline_poa" ? (
                    <PoderNotarialDeclineCta
                      key={`${step.id}-${cta.action}-${cta.label}`}
                      investmentId={investmentId}
                      onComplete={onUploadComplete}
                    />
                  ) : (
                    <StepTitleLinkCta key={`${step.id}-${cta.action}-${cta.label}`} cta={cta} />
                  )
                )}
              </div>
            ) : null}
          </div>

          {showCountdown ? (
            <StepCountdownBadge
              label={step.countdownLabel ?? ""}
              hours={countdown.hours}
              minutes={countdown.minutes}
            />
          ) : null}
        </div>

        {isCompleted && step.date && !isCompletedPaymentCopy && step.id !== "nota_simple" ? (
          <p className="mt-1 text-sm leading-5 text-[var(--vistral-semantic-text-secondary)]">
            {step.date}
          </p>
        ) : null}

        {showCopy ? (
          <p
            className={cn(
              "mt-1 text-sm leading-5",
              isCompletedPaymentCopy
                ? "font-semibold text-[#16A34A]"
                : "text-[var(--vistral-semantic-text-secondary)]"
            )}
          >
            {step.resolvedCopy}
            {isInProgress &&
            step.id !== "nota_simple" &&
            step.id !== "pagar_fee_prophero" &&
            step.date &&
            step.resolvedCopy &&
            !step.resolvedCopy.includes(step.date)
              ? ` · ${step.date}`
              : null}
          </p>
        ) : null}

        {isCompleted && step.resolvedCTAs.length > 0 ? (
          <div className="mt-3 flex flex-col items-start gap-2">
            {step.resolvedCTAs.map((cta) =>
              cta.action === "resume_poa" ? (
                <PoderNotarialResumeCta
                  key={`${step.id}-${cta.action}-${cta.label}`}
                  investmentId={investmentId}
                  onComplete={onUploadComplete}
                />
              ) : (
                <StepCompletedLinkCta key={`${step.id}-${cta.action}-${cta.label}`} cta={cta} />
              )
            )}
          </div>
        ) : null}

        {showActiveUi && (primaryCtas.length > 0 || secondaryCtas.length > 0) ? (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            {primaryCtas.map((cta) =>
              cta.action === "start_notarial" ? (
                <PoderNotarialStartCta
                  key={`${step.id}-${cta.action}-${cta.label}`}
                  investmentId={investmentId}
                  label={cta.label}
                  variant="primary"
                  onComplete={onUploadComplete}
                />
              ) : (
                renderUploadCta(cta, step.id, investmentId, onUploadComplete)
              )
            )}
            {secondaryCtas.map((cta) =>
              getUploadEndpoint(cta.action) ? (
                renderUploadCta(cta, step.id, investmentId, onUploadComplete)
              ) : (
                <StepSecondaryLinkCta key={`${step.id}-${cta.action}-${cta.label}`} cta={cta} />
              )
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
