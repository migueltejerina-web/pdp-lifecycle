import type { PropertyMock } from "@/app/investments/[id]/mock/property.mock";
import { formatEuroCompact } from "@/app/investments/[id]/utils/format";
import type { Lifecycle, SummaryCard } from "@/types/lifecycle";

const ARRAS_STEP_ID = "pagar_arras";
const FEE_STEP_ID = "pagar_fee_prophero";

export interface HubSpotPaymentAmounts {
  arrasAmount?: number;
  senalAmount?: number;
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
  const formattedPropHeroFee = formatEuroCompact(property.propHeroFee);

  const isArrasStep = lifecycle.currentStep === ARRAS_STEP_ID;
  const isFeeStep = lifecycle.currentStep === FEE_STEP_ID;
  const hasPaymentSummaryData =
    isFeeStep ? formattedPropHeroFee != null : formattedArrasTransferTotal != null;
  const shouldSyncPaymentSummary =
    hasPaymentSummaryData && (isArrasStep || isFeeStep || summaryCard.bannerImporte !== undefined);

  const bannerAmount = isFeeStep ? formattedPropHeroFee : formattedArrasTransferTotal;

  return {
    property: {
      ...property,
      ...(arrasAmount != null ? { arrasAmount } : {}),
      ...(senalAmount != null ? { senalAmount } : {}),
    },
    lifecycle: {
      ...lifecycle,
      stages: lifecycle.stages.map((stage) => ({
        ...stage,
        steps: stage.steps.map((step) => {
          if (step.id === ARRAS_STEP_ID && formattedArrasTransferTotal) {
            return { ...step, dynamicValue: formattedArrasTransferTotal };
          }
          if (step.id === FEE_STEP_ID && formattedPropHeroFee) {
            return { ...step, dynamicValue: formattedPropHeroFee };
          }
          return step;
        }),
      })),
    },
    summaryCard:
      shouldSyncPaymentSummary && bannerAmount
        ? {
            ...summaryCard,
            bannerImporte: bannerAmount,
            proximaAccionAmount: bannerAmount,
            paymentArrasAmount: isArrasStep ? formattedArras : undefined,
            paymentSenalAmount: isArrasStep ? formattedSenal : undefined,
          }
        : summaryCard,
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
