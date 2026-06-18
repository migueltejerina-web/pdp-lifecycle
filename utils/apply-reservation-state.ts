import { SIGNING_DEADLINE_HOURS } from "@/lib/hubspot/constants";
import type { Lifecycle, SummaryCard } from "@/types/lifecycle";
import { isSigningDeadlineExpired, resolveSigningExpiresAt } from "@/utils/signing-deadline";

const FIRMA_CONTRATO_STEP_ID = "firma_contrato";
const PAGAR_ARRAS_STEP_ID = "pagar_arras";
const PAGAR_FEE_STEP_ID = "pagar_fee_prophero";
const RESERVADO_STEP_ID = "reservado";

export interface HubSpotReservationState {
  configured?: boolean;
  uiStatus?: "available" | "blocked" | "signed" | "blocked_by_ph" | "coming_soon";
  blockedAt?: string | null;
  blockExpiresAt?: string | null;
  /** Deal `last_envelope_docusign_status_update` → sent = coach sent the arras contract. */
  arrasContractSent?: boolean;
  arrasContractSigningExpiresAt?: string | null;
  envelopeStatus?: string | null;
  arrasContractSigned?: boolean;
  arrasContractUrl?: string | null;
  arrasReceiptUploaded?: boolean;
  arrasReceiptUrl?: string | null;
  exchangeFeeReceiptUploaded?: boolean;
  exchangeFeeReceiptUrl?: string | null;
}

function formatSpanishDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function resolveReservationDate(state: HubSpotReservationState): string {
  if (state.blockedAt) {
    const blockedAt = new Date(state.blockedAt);
    if (!Number.isNaN(blockedAt.getTime())) {
      return formatSpanishDate(blockedAt);
    }
  }
  return formatSpanishDate(new Date());
}

function countdownFromExpiry(expiresAt: string | null | undefined): {
  countdownHours: number;
  countdownMinutes: number;
  countdownExpiresAt?: string;
} {
  if (!expiresAt) {
    return { countdownHours: SIGNING_DEADLINE_HOURS, countdownMinutes: 0 };
  }

  const remainingMs = new Date(expiresAt).getTime() - Date.now();
  if (remainingMs <= 0) {
    return { countdownHours: 0, countdownMinutes: 0, countdownExpiresAt: expiresAt };
  }

  return {
    countdownHours: Math.floor(remainingMs / (60 * 60 * 1000)),
    countdownMinutes: Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000)),
    countdownExpiresAt: expiresAt,
  };
}

function updateArrasStage(
  lifecycle: Lifecycle,
  updater: (steps: Lifecycle["stages"][number]["steps"]) => Lifecycle["stages"][number]["steps"]
): Lifecycle {
  return {
    ...lifecycle,
    stages: lifecycle.stages.map((stage) =>
      stage.id === "arras" ? { ...stage, steps: updater(stage.steps) } : stage
    ),
  };
}

function escriturasNotaSimpleSummary(
  summaryCard: SummaryCard,
  reservationDate: string
): SummaryCard {
  return {
    ...summaryCard,
    reservedDate: reservationDate,
    stageTitle: "Escritura",
    proximaAccion: "Subiendo nota simple",
    proximaAccionSubtext:
      "En breves subiremos la nota simple actualizada, necesaria para solicitar el poder notarial",
    actionBoxTitle: undefined,
    actionBoxLinkLabel: undefined,
    actionBoxLinkAction: undefined,
    proximaAccionAmount: undefined,
    paymentArrasAmount: undefined,
    paymentSenalAmount: undefined,
    primaryCtaLabel: undefined,
    primaryCtaAction: undefined,
    bannerImporte: undefined,
    bannerVencimiento: undefined,
    countdownHours: undefined,
    countdownMinutes: undefined,
    countdownExpiresAt: undefined,
  };
}

export function applyReservationState(
  lifecycle: Lifecycle,
  summaryCard: SummaryCard,
  state: HubSpotReservationState
): { lifecycle: Lifecycle; summaryCard: SummaryCard } {
  const today = formatSpanishDate(new Date());
  const reservationDate = resolveReservationDate(state);

  if (state.arrasContractSigned || state.uiStatus === "signed") {
    if (state.arrasReceiptUploaded) {
      if (state.exchangeFeeReceiptUploaded) {
        const updatedLifecycle: Lifecycle = {
          ...lifecycle,
          currentStage: "escrituras",
          currentStep: "nota_simple",
          stages: lifecycle.stages.map((stage) => {
            if (stage.id === "arras") {
              return {
                ...stage,
                status: "completed",
                steps: stage.steps.map((step) => {
                  if (step.id === RESERVADO_STEP_ID) {
                    return { ...step, status: "completed" as const, date: reservationDate };
                  }
                  if (step.id === FIRMA_CONTRATO_STEP_ID) {
                    return {
                      ...step,
                      status: "completed" as const,
                      date: step.date ?? today,
                      documentUrl: state.arrasContractUrl ?? step.documentUrl,
                    };
                  }
                  if (step.id === PAGAR_ARRAS_STEP_ID) {
                    return {
                      ...step,
                      status: "completed" as const,
                      date: step.date ?? today,
                      documentUrl: state.arrasReceiptUrl ?? step.documentUrl,
                    };
                  }
                  if (step.id === PAGAR_FEE_STEP_ID) {
                    return {
                      ...step,
                      status: "completed" as const,
                      date: step.date ?? today,
                      documentUrl: state.exchangeFeeReceiptUrl ?? step.documentUrl,
                    };
                  }
                  return step;
                }),
              };
            }
            if (stage.id === "escrituras" && stage.status === "pending") {
              return { ...stage, status: "in_progress" as const };
            }
            return stage;
          }),
        };

        return {
          lifecycle: updatedLifecycle,
          summaryCard: escriturasNotaSimpleSummary(summaryCard, reservationDate),
        };
      }

      const updatedLifecycle = updateArrasStage(lifecycle, (steps) =>
        steps.map((step) => {
          if (step.id === RESERVADO_STEP_ID) {
            return { ...step, status: "completed", date: reservationDate };
          }
          if (step.id === FIRMA_CONTRATO_STEP_ID) {
            return {
              ...step,
              status: "completed",
              date: step.date ?? today,
              documentUrl: state.arrasContractUrl ?? step.documentUrl,
            };
          }
          if (step.id === PAGAR_ARRAS_STEP_ID) {
            return {
              ...step,
              status: "completed",
              date: step.date ?? today,
              documentUrl: state.arrasReceiptUrl ?? step.documentUrl,
            };
          }
          if (step.id === PAGAR_FEE_STEP_ID && step.status === "pending") {
            return {
              ...step,
              status: "in_progress",
              date: undefined,
            };
          }
          return step;
        })
      );

      return {
        lifecycle: {
          ...updatedLifecycle,
          currentStage: "arras",
          currentStep: PAGAR_FEE_STEP_ID,
        },
        summaryCard: {
          ...summaryCard,
          reservedDate: reservationDate,
          stageTitle: "Arras",
          actionBoxTitle: "Próxima acción",
          actionBoxLinkLabel: undefined,
          actionBoxLinkAction: undefined,
          proximaAccion: "Pago tarifa PropHero",
          proximaAccionAmount: summaryCard.bannerImporte ?? summaryCard.proximaAccionAmount,
          proximaAccionSubtext: "Sube el comprobante de pago",
          primaryCtaLabel: "Subir comprobante",
          primaryCtaAction: "upload_exchange_fee_receipt",
          bannerVencimiento: undefined,
          countdownHours: undefined,
          countdownMinutes: undefined,
          countdownExpiresAt: undefined,
        },
      };
    }

    const updatedLifecycle = updateArrasStage(lifecycle, (steps) =>
      steps.map((step) => {
        if (step.id === RESERVADO_STEP_ID) {
          return { ...step, status: "completed", date: reservationDate };
        }
        if (step.id === FIRMA_CONTRATO_STEP_ID) {
          return {
            ...step,
            status: "completed",
            date: step.date ?? today,
            documentUrl: state.arrasContractUrl ?? step.documentUrl,
          };
        }
        if (step.id === PAGAR_ARRAS_STEP_ID && step.status === "pending") {
          return {
            ...step,
            status: "in_progress",
            ...(step.date ? { date: step.date } : {}),
          };
        }
        return step;
      })
    );

    return {
      lifecycle: {
        ...updatedLifecycle,
        currentStage: "arras",
        currentStep: PAGAR_ARRAS_STEP_ID,
      },
      summaryCard: {
        ...summaryCard,
        reservedDate: reservationDate,
        stageTitle: "Arras",
        actionBoxTitle: "Próxima acción",
        actionBoxLinkLabel: undefined,
        actionBoxLinkAction: undefined,
        proximaAccion: "Pago de arras",
        proximaAccionAmount: summaryCard.bannerImporte ?? summaryCard.proximaAccionAmount,
        proximaAccionSubtext: summaryCard.bannerVencimiento
          ? `Contrato de arras · vence el ${summaryCard.bannerVencimiento}`
          : "Contrato de arras",
        primaryCtaLabel: "Subir comprobante",
        primaryCtaAction: "upload_arras_receipt",
        ...(summaryCard.bannerVencimiento ? { bannerVencimiento: summaryCard.bannerVencimiento } : {}),
        countdownHours: undefined,
        countdownMinutes: undefined,
        countdownExpiresAt: undefined,
      },
    };
  }

  if (state.arrasContractSent && !state.arrasContractSigned) {
    const signingDeadline = resolveSigningExpiresAt(
      state.arrasContractSigningExpiresAt,
      state.blockExpiresAt
    );

    if (isSigningDeadlineExpired(signingDeadline)) {
      const updatedLifecycle = updateArrasStage(lifecycle, (steps) =>
        steps.map((step) => ({
          ...step,
          status: "pending" as const,
          date: undefined,
          documentUrl: undefined,
          countdownHours: undefined,
          countdownMinutes: undefined,
          countdownExpiresAt: undefined,
        }))
      );

      return {
        lifecycle: {
          ...updatedLifecycle,
          currentStage: "arras",
          currentStep: RESERVADO_STEP_ID,
        },
        summaryCard: {
          ...summaryCard,
          proximaAccion: "Reservar propiedad",
          proximaAccionSubtext: "Plazo de firma expirado · vuelve a reservar",
          primaryCtaLabel: undefined,
          primaryCtaAction: undefined,
          countdownHours: undefined,
          countdownMinutes: undefined,
          countdownExpiresAt: undefined,
        },
      };
    }

    const countdown = countdownFromExpiry(signingDeadline);
    const updatedLifecycle = updateArrasStage(lifecycle, (steps) =>
      steps.map((step) => {
        if (step.id === RESERVADO_STEP_ID) {
          return { ...step, status: "completed", date: reservationDate };
        }
        if (step.id === FIRMA_CONTRATO_STEP_ID) {
          return {
            ...step,
            status: "in_progress",
            ...countdown,
          };
        }
        return step;
      })
    );

    return {
      lifecycle: {
        ...updatedLifecycle,
        currentStage: "arras",
        currentStep: FIRMA_CONTRATO_STEP_ID,
      },
      summaryCard: {
        ...summaryCard,
        reservedDate: reservationDate,
        proximaAccion: "Firmar contrato",
        proximaAccionSubtext: "Contrato enviado por tu coach",
        primaryCtaLabel: "Subir contrato firmado",
        primaryCtaAction: "upload_contract",
        countdownHours: countdown.countdownHours,
        countdownMinutes: countdown.countdownMinutes,
        countdownExpiresAt: countdown.countdownExpiresAt,
      },
    };
  }

  if (state.uiStatus === "available") {
    const updatedLifecycle = updateArrasStage(lifecycle, (steps) =>
      steps.map((step) => ({
        ...step,
        status: "pending" as const,
        date: undefined,
        documentUrl: undefined,
        countdownHours: undefined,
        countdownMinutes: undefined,
        countdownExpiresAt: undefined,
      }))
    );

    return {
      lifecycle: {
        ...updatedLifecycle,
        currentStage: "arras",
        currentStep: RESERVADO_STEP_ID,
      },
      summaryCard: {
        ...summaryCard,
        proximaAccion: "Reservar propiedad",
        proximaAccionSubtext: "Bloquea la propiedad 48h",
      },
    };
  }

  return { lifecycle, summaryCard };
}
