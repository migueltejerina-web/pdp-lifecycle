import type { PropertyMock } from "@/app/investments/[id]/mock/property.mock";
import { formatEuroCompact } from "@/app/investments/[id]/utils/format";
import { PROPHERO_ARRAS_EXCHANGE_FEE_DEFAULT_EUR } from "@/lib/hubspot/constants";
import type { Lifecycle, StepCTAAction, SummaryCard } from "@/types/lifecycle";

const ARRAS_STEP_ID = "pagar_arras";
const FEE_STEP_ID = "pagar_fee_prophero";

export interface HubSpotPaymentAmounts {
  arrasAmount?: number;
  senalAmount?: number;
  exchangeFeeAmount?: number;
}

function computeArrasTransferTotal(
  arrasAmount?: number,
  senalAmount?: number
): number | undefined {
  if (arrasAmount != null && senalAmount != null) return arrasAmount + senalAmount;
  if (arrasAmount != null) return arrasAmount;
  if (senalAmount != null) return senalAmount;
  return undefined;
}

function resolvePropHeroExchangeFee(amounts: HubSpotPaymentAmounts, property: PropertyMock): number {
  return (
    amounts.exchangeFeeAmount ??
    property.propHeroFee ??
    PROPHERO_ARRAS_EXCHANGE_FEE_DEFAULT_EUR
  );
}

function withArrasPaymentSummary(
  summaryCard: SummaryCard,
  params: {
    proximaAccion: string;
    proximaAccionSubtext: string;
    bannerAmount?: string;
    primaryCtaLabel: string;
    primaryCtaAction: StepCTAAction;
    paymentArrasAmount?: string;
    paymentSenalAmount?: string;
    bannerVencimiento?: string;
  }
): SummaryCard {
  return {
    ...summaryCard,
    stageTitle: "Arras",
    actionBoxTitle: "Próxima acción",
    actionBoxLinkLabel: undefined,
    actionBoxLinkAction: undefined,
    proximaAccion: params.proximaAccion,
    proximaAccionSubtext: params.proximaAccionSubtext,
    ...(params.bannerAmount
      ? { bannerImporte: params.bannerAmount, proximaAccionAmount: params.bannerAmount }
      : {}),
    primaryCtaLabel: params.primaryCtaLabel,
    primaryCtaAction: params.primaryCtaAction,
    paymentArrasAmount: params.paymentArrasAmount,
    paymentSenalAmount: params.paymentSenalAmount,
  ...(params.bannerVencimiento ? { bannerVencimiento: params.bannerVencimiento } : { bannerVencimiento: undefined }),
    countdownHours: undefined,
    countdownMinutes: undefined,
    countdownExpiresAt: undefined,
  };
}

export function applyPaymentAmounts(
  property: PropertyMock,
  lifecycle: Lifecycle,
  summaryCard: SummaryCard,
  amounts: HubSpotPaymentAmounts
): { property: PropertyMock; lifecycle: Lifecycle; summaryCard: SummaryCard } {
  const arrasAmount = amounts.arrasAmount ?? property.arrasAmount;
  const senalAmount = amounts.senalAmount ?? property.senalAmount;
  const formattedArras = formatEuroCompact(arrasAmount);
  const formattedSenal = formatEuroCompact(senalAmount);
  const arrasTransferTotal = computeArrasTransferTotal(arrasAmount, senalAmount);
  const formattedArrasTransferTotal = formatEuroCompact(arrasTransferTotal);
  const propHeroFee = resolvePropHeroExchangeFee(amounts, property);
  const formattedPropHeroFee = formatEuroCompact(propHeroFee);

  const isArrasStep = lifecycle.currentStep === ARRAS_STEP_ID;
  const isFeeStep = lifecycle.currentStep === FEE_STEP_ID;

  const updatedLifecycle: Lifecycle = {
    ...lifecycle,
    stages: lifecycle.stages.map((stage) => ({
      ...stage,
      steps: stage.steps.map((step) => {
        if (step.id === ARRAS_STEP_ID && formattedArrasTransferTotal) {
          return { ...step, dynamicValue: formattedArrasTransferTotal };
        }
        if (step.id === FEE_STEP_ID && formattedPropHeroFee) {
          return { ...step, dynamicValue: formattedPropHeroFee, date: undefined };
        }
        return step;
      }),
    })),
  };

  let updatedSummaryCard = summaryCard;

  if (isFeeStep && formattedPropHeroFee) {
    updatedSummaryCard = withArrasPaymentSummary(summaryCard, {
      proximaAccion: "Pago tarifa PropHero",
      proximaAccionSubtext: "Sube el comprobante de pago",
      bannerAmount: formattedPropHeroFee,
      primaryCtaLabel: "Subir comprobante",
      primaryCtaAction: "upload_exchange_fee_receipt",
    });
  } else if (isArrasStep && formattedArrasTransferTotal) {
    updatedSummaryCard = withArrasPaymentSummary(summaryCard, {
      proximaAccion: "Pago de arras",
      proximaAccionSubtext: summaryCard.bannerVencimiento
        ? `Contrato de arras · vence el ${summaryCard.bannerVencimiento}`
        : "Contrato de arras",
      bannerAmount: formattedArrasTransferTotal,
      primaryCtaLabel: "Subir comprobante",
      primaryCtaAction: "upload_arras_receipt",
      paymentArrasAmount: formattedArras,
      paymentSenalAmount: formattedSenal,
      bannerVencimiento: summaryCard.bannerVencimiento,
    });
  } else if (summaryCard.bannerImporte !== undefined && (isArrasStep || isFeeStep)) {
    updatedSummaryCard = {
      ...summaryCard,
      ...(isFeeStep ? { bannerVencimiento: undefined } : {}),
    };
  }

  return {
    property: {
      ...property,
      ...(arrasAmount != null ? { arrasAmount } : {}),
      ...(senalAmount != null ? { senalAmount } : {}),
      propHeroFee,
    },
    lifecycle: updatedLifecycle,
    summaryCard: updatedSummaryCard,
  };
}

/** @deprecated Use applyPaymentAmounts */
export function applyArrasAmount(
  property: PropertyMock,
  lifecycle: Lifecycle,
  summaryCard: SummaryCard,
  arrasAmount: number
) {
  return applyPaymentAmounts(property, lifecycle, summaryCard, { arrasAmount });
}
