import type { StageStatus, StepStatus } from "@/types/lifecycle";

export const ESCRITURAS_STEP_ORDER = [
  "nota_simple",
  "poder_notarial",
  "tasacion",
  "ficha_hipoteca",
  "pago_reaf",
  "pago_provision_fondos",
  "fecha_firma",
  "pago_fee_escrituras",
  "pago_final_propiedad",
] as const;

export type EscriturasStepId = (typeof ESCRITURAS_STEP_ORDER)[number];

export interface EscriturasStepState {
  status: StepStatus;
  date?: string;
  dynamicValue?: string;
  documentUrl?: string;
  /** Proxy URLs when multiple nota simple documents are available. */
  documentUrls?: string[];
  /** Pre-filled Google Form URL (poder notarial online). */
  formUrl?: string;
  poaDeclined?: boolean;
  poaFormSubmitted?: boolean;
  requiresFeinUpload?: boolean;
  paymentLink?: string;
}

export interface HubSpotEscriturasInfo {
  source: "hubspot" | "mock";
  stageStatus: StageStatus;
  currentStep: EscriturasStepId;
  steps: Record<EscriturasStepId, EscriturasStepState>;
  /** When true, tasación and ficha hipotecaria are omitted from the PDP. */
  financingNotRequired?: boolean;
}

export interface HubSpotEscriturasState extends HubSpotEscriturasInfo {
  configured?: boolean;
  dealId?: string;
}
