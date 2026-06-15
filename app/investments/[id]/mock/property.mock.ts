import type {
  Lifecycle,
  Stage,
  StageStatus,
  Step,
  StepCTA,
  StepCTAAction,
  StepStatus,
  SummaryCard,
} from "@/types/lifecycle";

export type PropertyStatus = "reserved";

export interface PropertyMock {
  id: string;
  /** HubSpot deal (opportunity) linked to this investment. */
  hubspotDealId?: string;
  /** HubSpot listing (propiedad) — used when arras is read directly from the listing. */
  hubspotListingId?: string;
  address?: string;
  city?: string;
  country?: string;
  sqm?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  status: PropertyStatus;
  reservationDate?: string;
  purchasePrice?: number;
  senalAmount?: number;
  arrasAmount?: number;
  propHeroFee?: number;
  totalInvestment?: number;
  expectedNetYield?: number;
  /** Net yield shown in the operation summary sidebar. */
  summaryNetYield?: number;
  /** Estimated price growth shown in the operation summary sidebar. */
  priceGrowth?: number;
  /** Total initial capital required for the investment. */
  initialInvestment?: number;
  estimatedMonthlyRent?: number;
}

export interface AdvisorMock {
  name: string;
  role: string;
  photoUrl?: string;
}

export type LifecycleStep = Step;
export type LifecycleStage = Stage;
export type LifecycleMock = Lifecycle;

export type {
  Lifecycle,
  Stage,
  StageStatus,
  Step,
  StepCTA,
  StepCTAAction,
  StepStatus,
  SummaryCard,
};

export {
  ACTIVE_LIFECYCLE_SCENARIO,
  LIFECYCLE_SCENARIOS,
  mockLifecycle,
  mockSummaryCard,
} from "./lifecycle.scenarios";
export type { LifecycleScenario, LifecycleScenarioKey } from "./lifecycle.scenarios";

/** HubSpot-linked shell — display values come from HubSpot APIs only. */
export const mockProperty: PropertyMock = {
  id: "prop_001",
  hubspotDealId: "322690904309",
  hubspotListingId: "1155969961147",
  status: "reserved",
};

export const mockAdvisor: AdvisorMock = {
  name: "Nacho Ballve",
  role: "Asesor inmobiliario",
  photoUrl:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=96&h=96&q=80",
};
