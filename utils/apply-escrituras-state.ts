import type { EscriturasStepId, HubSpotEscriturasInfo } from "@/lib/hubspot/escrituras.types";
import { ESCRITURAS_STEP_ORDER } from "@/lib/hubspot/escrituras.types";
import { PODER_NOTARIAL_REQUEST_PROCESSING_COPY, PODER_NOTARIAL_WITHOUT_NOTA_SIMPLE_COPY } from "@/lib/hubspot/poder-notarial-prefill.types";
import type { Lifecycle, SummaryCard } from "@/types/lifecycle";

const ESCRITURAS_STAGE_ID = "escrituras";

const SUMMARY_BY_STEP: Partial<
  Record<EscriturasStepId, Pick<SummaryCard, "proximaAccion" | "proximaAccionSubtext">>
> = {
  nota_simple: {
    proximaAccion: "Subiendo nota simple",
    proximaAccionSubtext:
      "En breves subiremos la nota simple actualizada, necesaria para solicitar el poder notarial",
  },
  poder_notarial: {
    proximaAccion: "Poder notarial",
    proximaAccionSubtext: "Autoriza a PropHero a gestionar tu compra.",
  },
  tasacion: {
    proximaAccion: "Tasación",
    proximaAccionSubtext: "Coordinamos la tasación con el banco.",
  },
  ficha_hipoteca: {
    proximaAccion: "Ficha de hipoteca",
    proximaAccionSubtext: "Revisa y firma la FEIN cuando esté disponible.",
  },
  pago_reaf: {
    proximaAccion: "Pago de honorarios de agencia (REAF)",
    proximaAccionSubtext: "Realiza el pago cuando recibas el enlace.",
  },
  pago_provision_fondos: {
    proximaAccion: "Provisión de fondos",
    proximaAccionSubtext: "Este pago lo gestiona directamente tu banco.",
  },
  fecha_firma: {
    proximaAccion: "Fecha de firma",
    proximaAccionSubtext: "Coordinamos la cita ante notario con todas las partes.",
  },
  pago_fee_escrituras: {
    proximaAccion: "Tarifa PropHero escrituras",
    proximaAccionSubtext: "Pago de honorarios de gestión en escritura.",
  },
  pago_final_propiedad: {
    proximaAccion: "Pago final de escritura de propiedad",
    proximaAccionSubtext: "A pagar en notaría",
  },
};

function isArrasStageCompleted(lifecycle: Lifecycle): boolean {
  const arrasStage = lifecycle.stages.find((stage) => stage.id === "arras");
  return arrasStage?.status === "completed";
}

function buildEscriturasSummary(
  summaryCard: SummaryCard,
  currentStep: EscriturasStepId,
  stepState: HubSpotEscriturasInfo["steps"][EscriturasStepId],
  notaSimpleCompleted: boolean
): SummaryCard {
  const copy = SUMMARY_BY_STEP[currentStep];
  const base: SummaryCard = {
    ...summaryCard,
    stageTitle: "Escritura",
    proximaAccion: copy?.proximaAccion,
    proximaAccionSubtext: copy?.proximaAccionSubtext ?? "",
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

  if (currentStep === "pago_reaf" && stepState.dynamicValue) {
    return {
      ...base,
      proximaAccionAmount: stepState.dynamicValue,
      proximaAccionSubtext: "Honorarios de agencia (REAF)",
      ...(stepState.paymentLink
        ? {
            primaryCtaLabel: "Ir al pago",
            primaryCtaAction: "view_payment" as const,
            primaryCtaUrl: stepState.paymentLink,
          }
        : {}),
    };
  }

  if (currentStep === "pago_provision_fondos" && stepState.dynamicValue) {
    return {
      ...base,
      proximaAccionAmount: stepState.dynamicValue,
      proximaAccionSubtext: "Provisión de fondos · gestionado por tu banco",
      ...(stepState.paymentLink
        ? {
            primaryCtaLabel: "Ir al pago",
            primaryCtaAction: "view_payment" as const,
            primaryCtaUrl: stepState.paymentLink,
          }
        : {}),
    };
  }

  if (currentStep === "pago_fee_escrituras" && stepState.dynamicValue) {
    return {
      ...base,
      proximaAccionAmount: stepState.dynamicValue,
      proximaAccionSubtext: "Tarifa PropHero · escritura",
      ...(stepState.paymentLink
        ? {
            primaryCtaLabel: "Ir al pago",
            primaryCtaAction: "view_payment" as const,
            primaryCtaUrl: stepState.paymentLink,
          }
        : {}),
    };
  }

  if (currentStep === "pago_final_propiedad" && stepState.dynamicValue) {
    return {
      ...base,
      proximaAccionAmount: stepState.dynamicValue,
      proximaAccionSubtext: "A pagar en notaría",
    };
  }

  if (currentStep === "fecha_firma") {
    return {
      ...base,
      ...(stepState.dynamicValue
        ? { proximaAccionSubtext: stepState.dynamicValue }
        : {}),
      ...(stepState.date ? { proximaAccionAmount: stepState.date } : {}),
    };
  }

  if (currentStep === "ficha_hipoteca") {
    if (stepState.requiresFeinUpload) {
      return {
        ...base,
        primaryCtaLabel: "Subir FEIN",
        primaryCtaAction: "upload_fein_signature_doc",
      };
    }

    if (stepState.documentUrl) {
      return {
        ...base,
        primaryCtaLabel: "Ver FEIN",
        primaryCtaAction: "view_file",
        primaryCtaUrl: stepState.documentUrl,
      };
    }
  }

  if (currentStep === "poder_notarial") {
    if (stepState.poaFormSubmitted) {
      return {
        ...base,
        proximaAccion: "Poder notarial",
        proximaAccionSubtext: PODER_NOTARIAL_REQUEST_PROCESSING_COPY,
      };
    }

    if (!notaSimpleCompleted) {
      return {
        ...base,
        proximaAccionSubtext: PODER_NOTARIAL_WITHOUT_NOTA_SIMPLE_COPY,
      };
    }

    if (stepState.formUrl) {
      return {
        ...base,
        primaryCtaLabel: "Solicitar poder notarial",
        primaryCtaAction: "start_notarial",
        primaryCtaUrl: stepState.formUrl,
      };
    }

    return {
      ...base,
      primaryCtaLabel: "Subir poder notarial",
      primaryCtaAction: "upload_company_deed",
    };
  }

  return base;
}

export function applyEscriturasState(
  lifecycle: Lifecycle,
  summaryCard: SummaryCard,
  escrituras: HubSpotEscriturasInfo
): { lifecycle: Lifecycle; summaryCard: SummaryCard } {
  if (!isArrasStageCompleted(lifecycle)) {
    return { lifecycle, summaryCard };
  }

  const currentStepState = escrituras.steps[escrituras.currentStep];

  const updatedLifecycle: Lifecycle = {
    ...lifecycle,
    currentStage: ESCRITURAS_STAGE_ID,
    currentStep: escrituras.currentStep,
    stages: lifecycle.stages.map((stage) => {
      if (stage.id !== ESCRITURAS_STAGE_ID) {
        return stage;
      }

      return {
        ...stage,
        status: escrituras.stageStatus,
        steps: stage.steps.map((step) => {
          const hubSpotStep = escrituras.steps[step.id as EscriturasStepId];
          if (!hubSpotStep) return step;

          return {
            ...step,
            status: hubSpotStep.status,
            ...(step.id === "nota_simple"
              ? { date: undefined }
              : hubSpotStep.date
                ? { date: hubSpotStep.date }
                : { date: undefined }),
            ...(hubSpotStep.dynamicValue
              ? { dynamicValue: hubSpotStep.dynamicValue }
              : { dynamicValue: step.dynamicValue }),
            ...(hubSpotStep.documentUrl
              ? { documentUrl: hubSpotStep.documentUrl }
              : { documentUrl: undefined }),
            ...(hubSpotStep.documentUrls?.length
              ? { documentUrls: hubSpotStep.documentUrls }
              : { documentUrls: undefined }),
            ...(hubSpotStep.formUrl ? { formUrl: hubSpotStep.formUrl } : { formUrl: undefined }),
            ...(hubSpotStep.poaDeclined ? { poaDeclined: true } : { poaDeclined: undefined }),
            ...(hubSpotStep.poaFormSubmitted
              ? { poaFormSubmitted: true }
              : { poaFormSubmitted: undefined }),
            ...(hubSpotStep.requiresFeinUpload
              ? { requiresFeinUpload: true }
              : { requiresFeinUpload: undefined }),
            ...(hubSpotStep.paymentLink ? { paymentLink: hubSpotStep.paymentLink } : {}),
          };
        }),
      };
    }),
  };

  const allEscriturasCompleted = ESCRITURAS_STEP_ORDER.every(
    (stepId) => escrituras.steps[stepId].status === "completed"
  );

  if (allEscriturasCompleted) {
    const reformaStage = updatedLifecycle.stages.find((stage) => stage.id === "reforma");
    if (reformaStage?.status === "pending") {
      return {
        lifecycle: {
          ...updatedLifecycle,
          currentStage: "reforma",
          currentStep: reformaStage.steps[0]?.id ?? "reforma_en_marcha",
          stages: updatedLifecycle.stages.map((stage) =>
            stage.id === "reforma" ? { ...stage, status: "in_progress" as const } : stage
          ),
        },
        summaryCard: {
          ...summaryCard,
          stageTitle: "Reforma y mobiliario",
          proximaAccion: "Reforma en marcha",
          proximaAccionSubtext: "Coordinamos la obra con postventa.",
        },
      };
    }
  }

  return {
    lifecycle: updatedLifecycle,
    summaryCard: buildEscriturasSummary(
      summaryCard,
      escrituras.currentStep,
      currentStepState,
      escrituras.steps.nota_simple.status === "completed"
    ),
  };
}
