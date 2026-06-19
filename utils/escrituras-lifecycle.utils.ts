import type { Lifecycle, Stage, Step } from "@/types/lifecycle";
import {
  ESCRITURAS_STEP_ORDER,
  type EscriturasStepId,
} from "@/lib/hubspot/escrituras.types";

const ESCRITURAS_STAGE_ID = "escrituras";

const ESCRITURAS_FINANCING_STEP_IDS: EscriturasStepId[] = ["tasacion", "ficha_hipoteca"];

/** HubSpot `financing` = "Not Required" → cash purchase, no mortgage steps in PDP. */
export function isEscriturasFinancingNotRequired(
  financing: string | null | undefined
): boolean {
  return financing?.trim().toLowerCase() === "not required";
}

export function getEscriturasVisibleStepOrder(
  financingNotRequired: boolean
): EscriturasStepId[] {
  if (!financingNotRequired) return [...ESCRITURAS_STEP_ORDER];
  return ESCRITURAS_STEP_ORDER.filter(
    (stepId) => !ESCRITURAS_FINANCING_STEP_IDS.includes(stepId)
  );
}

export function filterEscriturasStepsForDisplay<T extends { id: string }>(
  steps: T[],
  financingNotRequired: boolean
): T[] {
  if (!financingNotRequired) return steps;
  return steps.filter((step) => !ESCRITURAS_FINANCING_STEP_IDS.includes(step.id as EscriturasStepId));
}

/** Escritura steps are parallel — all incomplete steps stay actionable from day 0. */
export function normalizeEscriturasParallelSteps(stage: Stage): Stage {
  if (stage.id !== ESCRITURAS_STAGE_ID || stage.status === "pending") {
    return stage;
  }

  return {
    ...stage,
    steps: stage.steps.map((step) => {
      if (step.status === "completed") return step;
      if (!ESCRITURAS_STEP_ORDER.includes(step.id as (typeof ESCRITURAS_STEP_ORDER)[number])) {
        return step;
      }
      return { ...step, status: "in_progress" as const };
    }),
  };
}

export function normalizeLifecycleEscriturasParallel(lifecycle: Lifecycle): Lifecycle {
  return {
    ...lifecycle,
    stages: lifecycle.stages.map((stage) => normalizeEscriturasParallelSteps(stage)),
  };
}

export function resolveEscriturasRecommendedStepId(stage: Stage): string | undefined {
  if (stage.id !== ESCRITURAS_STAGE_ID || stage.status === "pending") {
    return undefined;
  }

  return stage.steps.find((step) => step.status !== "completed")?.id;
}
