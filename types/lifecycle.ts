export type StageStatus = "pending" | "in_progress" | "completed";

export type StepStatus = "pending" | "in_progress" | "completed";

export type StepCTAAction =
  | "open_mail"
  | "open_document"
  | "upload_file"
  | "upload_contract"
  | "upload_arras_receipt"
  | "upload_exchange_fee_receipt"
  | "view_details"
  | "view_payment"
  | "view_file"
  | "mark_complete"
  | "start_notarial"
  | "send_signo";

export type StepCTAVariant = "primary" | "secondary" | "title_link";

export type StepCTAIcon = "upload" | "send";

export interface StepCTA {
  label: string;
  action: StepCTAAction;
  url?: string;
  variant?: StepCTAVariant;
  icon?: StepCTAIcon;
}

export interface StepConfig {
  id: string;
  title: string;
  inProgressCopy?: string;
  doneCopy?: string;
  inProgressCTAs?: StepCTA[];
  doneCTAs?: StepCTA[];
  countdown?: boolean;
  countdownLabel?: string;
}

export interface StageConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  steps: StepConfig[];
}

export interface Step {
  id: string;
  status: StepStatus;
  date?: string;
  dynamicValue?: string;
  documentUrl?: string;
  countdownHours?: number;
  countdownMinutes?: number;
  countdownExpiresAt?: string;
}

export interface Stage {
  id: string;
  status: StageStatus;
  steps: Step[];
}

export interface Lifecycle {
  currentStage: string;
  currentStep: string;
  stages: Stage[];
}

export interface EnrichedStep extends StepConfig {
  status: StepStatus;
  date?: string;
  dynamicValue?: string;
  countdownHours?: number;
  countdownMinutes?: number;
  countdownExpiresAt?: string;
  resolvedCopy?: string;
  resolvedCTAs: StepCTA[];
}

export interface EnrichedStage extends Omit<StageConfig, "steps"> {
  status: StageStatus;
  steps: EnrichedStep[];
}

export interface SummaryCard {
  reservedDate?: string;
  stageTitle: string;
  proximaAccion?: string;
  proximaAccionSubtext: string;
  escriturasEstimadas?: string;
  bannerImporte?: string;
  bannerVencimiento?: string;
  actionBoxTitle?: string;
  actionBoxLinkLabel?: string;
  actionBoxLinkAction?: StepCTAAction;
  proximaAccionAmount?: string;
  paymentArrasAmount?: string;
  paymentSenalAmount?: string;
  primaryCtaLabel?: string;
  primaryCtaAction?: StepCTAAction;
  countdownHours?: number;
  countdownMinutes?: number;
  countdownExpiresAt?: string;
}
