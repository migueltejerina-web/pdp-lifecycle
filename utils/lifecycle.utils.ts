import { LIFECYCLE_CONFIG } from "@/config/lifecycle.config";
import { formatEuroCompact } from "@/app/investments/[id]/utils/format";
import { PROPHERO_ARRAS_EXCHANGE_FEE_DEFAULT_EUR } from "@/lib/hubspot/constants";
import type { EnrichedStage, Lifecycle, StepConfig, StepOwner } from "@/types/lifecycle";
import { resolveEscriturasRecommendedStepId } from "@/utils/escrituras-lifecycle.utils";
import { PODER_NOTARIAL_DECLINED_DYNAMIC_VALUE, PODER_NOTARIAL_REQUEST_PROCESSING_COPY, PODER_NOTARIAL_WITHOUT_NOTA_SIMPLE_COPY } from "@/lib/hubspot/poder-notarial-prefill.types";

function resolveCopy(
  stepConfig: StepConfig,
  dynamicValue: string | undefined,
  date: string | undefined,
  mode: "inProgress" | "done"
): string | undefined {
  if (
    stepConfig.id === "poder_notarial" &&
    mode === "done" &&
    dynamicValue === PODER_NOTARIAL_DECLINED_DYNAMIC_VALUE
  ) {
    return "Has indicado que no necesitas poder notarial online";
  }

  if (
    stepConfig.id === "pago_final_propiedad" &&
    mode === "inProgress" &&
    !dynamicValue?.trim()
  ) {
    return "A pagar en notaría";
  }

  if (stepConfig.id === "poder_notarial" && mode === "done" && !dynamicValue?.trim()) {
    return "Poder enviado a la notaría";
  }

  if (stepConfig.id === "fecha_firma" && dynamicValue?.trim()) {
    return dynamicValue;
  }

  if (
    stepConfig.id === "pagar_fee_prophero" &&
    mode === "inProgress" &&
    !dynamicValue?.trim()
  ) {
    return `Importe: ${formatEuroCompact(PROPHERO_ARRAS_EXCHANGE_FEE_DEFAULT_EUR) ?? "3.000€"}`;
  }

  const template = mode === "done" ? stepConfig.doneCopy : stepConfig.inProgressCopy;
  if (!template?.trim()) return undefined;
  return template
    .replace("{dynamicValue}", dynamicValue ?? "")
    .replace("{date}", date ?? "");
}

export function getEnrichedStages(lifecycle: Lifecycle): EnrichedStage[] {
  const recommendedEscriturasStepId = lifecycle.stages
    .map((stage) => resolveEscriturasRecommendedStepId(stage))
    .find(Boolean);

  return lifecycle.stages.map((stage) => {
    const config = LIFECYCLE_CONFIG.find((entry) => entry.id === stage.id);
    if (!config) {
      throw new Error(`Missing lifecycle config for stage: ${stage.id}`);
    }

    return {
      ...config,
      status: stage.status,
      steps: stage.steps.map((step) => {
        const stepConfig = config.steps.find((entry) => entry.id === step.id);
        if (!stepConfig) {
          throw new Error(`Missing lifecycle config for step: ${stage.id}/${step.id}`);
        }

        const owner: StepOwner | undefined = stepConfig.owner;
        const isRecommended =
          stage.id === "escrituras" &&
          step.status !== "completed" &&
          step.id === (recommendedEscriturasStepId ?? lifecycle.currentStep);

        const notaSimpleCompleted =
          stage.id === "escrituras"
            ? stage.steps.find((entry) => entry.id === "nota_simple")?.status === "completed"
            : true;

        const resolvedCopy =
          step.id === "poder_notarial" &&
          step.status === "in_progress" &&
          step.poaFormSubmitted
            ? PODER_NOTARIAL_REQUEST_PROCESSING_COPY
            : step.id === "poder_notarial" &&
                step.status === "in_progress" &&
                !notaSimpleCompleted
              ? PODER_NOTARIAL_WITHOUT_NOTA_SIMPLE_COPY
              : step.status === "completed"
              ? resolveCopy(stepConfig, step.dynamicValue, step.date, "done")
              : step.status === "in_progress"
                ? resolveCopy(stepConfig, step.dynamicValue, step.date, "inProgress")
                : undefined;

        const showInvestorActions = step.status === "in_progress" && owner !== "prophero";
        const baseCTAs =
          step.status === "completed"
            ? (stepConfig.doneCTAs ?? [])
            : showInvestorActions
              ? (stepConfig.inProgressCTAs ?? [])
              : [];

        let resolvedCTAs = baseCTAs.map((cta) => {
          if (
            step.documentUrl &&
            (cta.action === "open_document" || cta.action === "view_file")
          ) {
            return { ...cta, url: step.documentUrl };
          }
          if (step.paymentLink && cta.action === "view_payment") {
            return { ...cta, url: step.paymentLink };
          }
          if (step.formUrl && cta.action === "start_notarial") {
            return { ...cta, url: step.formUrl };
          }
          return cta;
        });

        if (step.documentUrls && step.documentUrls.length > 0) {
          const viewFileCTAs = step.documentUrls.map((url, index) => ({
            label:
              step.documentUrls!.length > 1
                ? `Ver nota simple ${index + 1}`
                : "Ver nota simple",
            action: "view_file" as const,
            url,
          }));

          resolvedCTAs = [
            ...resolvedCTAs.filter(
              (cta) => cta.action !== "view_file" && cta.action !== "open_document"
            ),
            ...viewFileCTAs,
          ];
        }

        const isPoderNotarialDeclined =
          step.id === "poder_notarial" && step.status === "completed" && step.poaDeclined;

        if (isPoderNotarialDeclined) {
          resolvedCTAs = [
            { label: "Retomar poder notarial", action: "resume_poa", variant: "primary" },
          ];
        } else if (
          step.id === "poder_notarial" &&
          step.status === "in_progress" &&
          step.poaFormSubmitted
        ) {
          resolvedCTAs = [];
        } else if (step.id === "poder_notarial" && step.status === "in_progress") {
          resolvedCTAs = resolvedCTAs.filter((cta) =>
            ["decline_poa", "start_notarial", "upload_company_deed"].includes(cta.action)
          );
        } else if (step.id === "ficha_hipoteca" && step.status === "in_progress") {
          if (step.requiresFeinUpload) {
            resolvedCTAs = resolvedCTAs.filter(
              (cta) => cta.action === "upload_fein_signature_doc"
            );
          } else {
            resolvedCTAs = resolvedCTAs.filter(
              (cta) => cta.action !== "upload_fein_signature_doc"
            );
            if (step.documentUrl) {
              resolvedCTAs = [
                { label: "Ver FEIN", action: "view_file", url: step.documentUrl },
              ];
            }
          }
        }

        return {
          ...stepConfig,
          ...step,
          owner,
          isRecommended,
          resolvedCopy,
          resolvedCTAs,
        };
      }),
    };
  });
}
