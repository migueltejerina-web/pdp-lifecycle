import { LIFECYCLE_CONFIG } from "@/config/lifecycle.config";
import type { EnrichedStage, Lifecycle, StepConfig } from "@/types/lifecycle";

function resolveCopy(
  stepConfig: StepConfig,
  dynamicValue: string | undefined,
  date: string | undefined,
  mode: "inProgress" | "done"
): string | undefined {
  const template = mode === "done" ? stepConfig.doneCopy : stepConfig.inProgressCopy;
  if (!template) return undefined;
  return template
    .replace("{dynamicValue}", dynamicValue ?? "")
    .replace("{date}", date ?? "");
}

export function getEnrichedStages(lifecycle: Lifecycle): EnrichedStage[] {
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

        const resolvedCopy =
          step.status === "completed"
            ? resolveCopy(stepConfig, step.dynamicValue, step.date, "done")
            : step.status === "in_progress"
              ? resolveCopy(stepConfig, step.dynamicValue, step.date, "inProgress")
              : undefined;

        const baseCTAs =
          step.status === "completed"
            ? (stepConfig.doneCTAs ?? [])
            : step.status === "in_progress"
              ? (stepConfig.inProgressCTAs ?? [])
              : [];

        const resolvedCTAs = baseCTAs.map((cta) => {
          if (
            step.documentUrl &&
            (cta.action === "open_document" || cta.action === "view_file")
          ) {
            return { ...cta, url: step.documentUrl };
          }
          return cta;
        });

        return {
          ...stepConfig,
          ...step,
          resolvedCopy,
          resolvedCTAs,
        };
      }),
    };
  });
}
