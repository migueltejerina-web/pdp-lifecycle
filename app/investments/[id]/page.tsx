"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { applyEscriturasState } from "@/utils/apply-escrituras-state";
import { applyPaymentAmounts, type HubSpotPaymentAmounts } from "@/utils/apply-arras-amount";
import {
  applyListingPropertyDetails,
  type HubSpotPropertyDetails,
} from "@/utils/apply-listing-property";
import {
  applyReservationState,
  type HubSpotReservationState,
} from "@/utils/apply-reservation-state";
import type { HubSpotEscriturasInfo } from "@/lib/hubspot/escrituras.types";
import { normalizeLifecycleEscriturasParallel } from "@/utils/escrituras-lifecycle.utils";
import { mockAdvisor, mockLifecycle, mockProperty, mockSummaryCard } from "./mock/property.mock";
import { AdvisorCard } from "./components/AdvisorCard";
import { InvestmentNavbar } from "./components/InvestmentNavbar";
import { InvestmentSidebar } from "./components/InvestmentSidebar";
import { LifecycleTabBar } from "./components/LifecycleTabBar";
import { NavPaymentBanner } from "./components/NavPaymentBanner";
import { OperationStatus } from "./components/OperationStatus";
import { OperationSummaryCard } from "./components/OperationSummaryCard";
import { PropertyHeader } from "./components/PropertyHeader";

export default function InvestmentDetailPage() {
  const params = useParams<{ id: string }>();
  const investmentId = params.id ?? mockProperty.id;
  const [paymentAmounts, setPaymentAmounts] = useState<HubSpotPaymentAmounts>({});
  const [listingPropertyDetails, setListingPropertyDetails] = useState<HubSpotPropertyDetails>({});
  const [reservationState, setReservationState] = useState<HubSpotReservationState>({});
  const [escriturasState, setEscriturasState] = useState<HubSpotEscriturasInfo | null>(null);
  const [reservationRefreshKey, setReservationRefreshKey] = useState(0);

  const refreshReservation = () => {
    setReservationRefreshKey((current) => current + 1);
  };

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/investments/${investmentId}/arras`)
      .then((response) => response.json())
      .then((data: HubSpotPaymentAmounts) => {
        if (cancelled) return;
        setPaymentAmounts((current) => ({
          arrasAmount:
            typeof data.arrasAmount === "number" ? data.arrasAmount : current.arrasAmount,
          senalAmount:
            typeof data.senalAmount === "number" ? data.senalAmount : current.senalAmount,
          exchangeFeeAmount:
            typeof data.exchangeFeeAmount === "number"
              ? data.exchangeFeeAmount
              : current.exchangeFeeAmount,
        }));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [investmentId]);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/investments/${investmentId}/property`)
      .then((response) => response.json())
      .then((data: HubSpotPropertyDetails) => {
        if (cancelled) return;
        setListingPropertyDetails({
          ...(typeof data.address === "string" ? { address: data.address } : {}),
          ...(typeof data.city === "string" ? { city: data.city } : {}),
          ...(typeof data.country === "string" ? { country: data.country } : {}),
          ...(typeof data.purchasePrice === "number" ? { purchasePrice: data.purchasePrice } : {}),
          ...(typeof data.initialInvestment === "number"
            ? { initialInvestment: data.initialInvestment }
            : {}),
          ...(typeof data.totalInvestment === "number"
            ? { totalInvestment: data.totalInvestment }
            : {}),
          ...(typeof data.estimatedMonthlyRent === "number"
            ? { estimatedMonthlyRent: data.estimatedMonthlyRent }
            : {}),
          ...(typeof data.summaryNetYield === "number"
            ? { summaryNetYield: data.summaryNetYield }
            : {}),
          ...(typeof data.escriturasEstimadas === "string"
            ? { escriturasEstimadas: data.escriturasEstimadas }
            : {}),
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [investmentId]);

  useEffect(() => {
    let cancelled = false;

    const loadReservation = () => {
      fetch(`/api/investments/${investmentId}/reservation`)
        .then((response) => response.json())
        .then((data: HubSpotReservationState) => {
          if (cancelled) return;
          setReservationState(data);
        })
        .catch(() => {});
    };

    loadReservation();
    const intervalId = window.setInterval(loadReservation, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [investmentId, reservationRefreshKey]);

  useEffect(() => {
    let cancelled = false;

    const loadEscrituras = () => {
      fetch(`/api/investments/${investmentId}/escrituras`)
        .then((response) => response.json())
        .then((data: HubSpotEscriturasInfo & { configured?: boolean }) => {
          if (cancelled || !data.steps) return;
          setEscriturasState(data);
        })
        .catch(() => {});
    };

    loadEscrituras();
    const intervalId = window.setInterval(loadEscrituras, 20_000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [investmentId, reservationRefreshKey]);

  const { property, lifecycle, summaryCard } = useMemo(() => {
    const withHubSpotDetails = applyListingPropertyDetails(
      mockProperty,
      mockSummaryCard,
      listingPropertyDetails
    );
    const shouldMergeHubSpotReservation = reservationState.configured === true;

    const withReservation = shouldMergeHubSpotReservation
      ? applyReservationState(
          mockLifecycle,
          withHubSpotDetails.summaryCard,
          reservationState
        )
      : {
          lifecycle: mockLifecycle,
          summaryCard: withHubSpotDetails.summaryCard,
        };
    const withPayments = applyPaymentAmounts(
      withHubSpotDetails.property,
      withReservation.lifecycle,
      withReservation.summaryCard,
      paymentAmounts
    );

    const arrasCompleted = withPayments.lifecycle.stages.find((stage) => stage.id === "arras")
      ?.status === "completed";

    const withEscrituras =
      escriturasState && arrasCompleted
        ? applyEscriturasState(
            withPayments.lifecycle,
            withPayments.summaryCard,
            escriturasState
          )
        : {
            lifecycle: withPayments.lifecycle,
            summaryCard: withPayments.summaryCard,
          };

    const parallelLifecycle = normalizeLifecycleEscriturasParallel(withEscrituras.lifecycle);

    const activeCountdownStep = parallelLifecycle.stages
      .flatMap((stage) => stage.steps)
      .find(
        (step) =>
          step.status === "in_progress" &&
          step.countdownHours !== undefined &&
          step.countdownMinutes !== undefined
      );

    const mergedSummaryCard =
      activeCountdownStep !== undefined
        ? {
            ...withEscrituras.summaryCard,
            countdownHours: activeCountdownStep.countdownHours,
            countdownMinutes: activeCountdownStep.countdownMinutes,
            countdownExpiresAt: activeCountdownStep.countdownExpiresAt,
          }
        : withEscrituras.summaryCard;

    return {
      property: withPayments.property ?? mockProperty,
      lifecycle: parallelLifecycle,
      summaryCard: mergedSummaryCard,
    };
  }, [listingPropertyDetails, paymentAmounts, reservationRefreshKey, reservationState, escriturasState]);

  const showPaymentBanner =
    lifecycle.currentStep === "pagar_arras" ||
    lifecycle.currentStep === "pagar_fee_prophero";

  const operationContent = (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <OperationStatus
          lifecycle={lifecycle}
          investmentId={investmentId}
          onUploadComplete={refreshReservation}
        />
      </div>
      <aside className="sticky top-32 hidden w-96 shrink-0 self-start space-y-4 xl:block">
        <OperationSummaryCard
          property={property}
          summaryCard={summaryCard}
          investmentId={investmentId}
          onUploadComplete={refreshReservation}
        />
        <AdvisorCard advisor={mockAdvisor} />
      </aside>
    </div>
  );

  return (
    <div
      className="min-h-dvh bg-[var(--vistral-semantic-bg-subtle)]"
      style={{ fontFamily: "var(--vistral-font-family-sans)" }}
    >
      <InvestmentSidebar />

      <div className="pl-20">
        <InvestmentNavbar property={property} />
        {showPaymentBanner ? <NavPaymentBanner summaryCard={summaryCard} /> : null}

        <main className="mx-auto max-w-[1200px] px-6 pb-12 pt-6">
          <PropertyHeader property={property} />

          <div className="mt-6">
            <LifecycleTabBar operationContent={operationContent} />
          </div>

          <div className="mt-6 space-y-4 xl:hidden">
            <OperationSummaryCard
          property={property}
          summaryCard={summaryCard}
          investmentId={investmentId}
          onUploadComplete={refreshReservation}
        />
            <AdvisorCard advisor={mockAdvisor} />
          </div>
        </main>
      </div>
    </div>
  );
}
