import type { Lifecycle, Stage, Step } from "@/types/lifecycle";
import { ESCRITURAS_STEP_ORDER } from "@/lib/hubspot/escrituras.types";

const ESCRITURAS_STAGE_ID = "escrituras";

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
