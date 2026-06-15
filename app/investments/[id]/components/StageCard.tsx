"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EnrichedStage } from "@/types/lifecycle";
import { getStageIcon } from "../utils/lifecycle-icons";
import { StepItem } from "./StepItem";

const STAGE_STATUS_BADGE: Record<
  "in_progress" | "completed",
  { label: string; className: string }
> = {
  in_progress: {
    label: "En curso",
    className: "bg-[#FFEDD5] text-[#C2410C]",
  },
  completed: {
    label: "Completado",
    className:
      "bg-[var(--vistral-semantic-bg-success)] text-[var(--vistral-semantic-interactive-success-pressed)]",
  },
};

interface StageCardProps {
  stage: EnrichedStage;
  isExpanded: boolean;
  onToggle: () => void;
  isLast: boolean;
  lineCompleted: boolean;
  investmentId?: string;
  onUploadComplete?: () => void;
}

interface StageHeaderProps {
  stage: EnrichedStage;
  isExpanded: boolean;
  isPending: boolean;
  statusBadge: (typeof STAGE_STATUS_BADGE)["in_progress"] | null;
  onToggle: () => void;
}

function StageHeaderContent({
  stage,
  isExpanded,
  isPending,
  statusBadge,
}: Omit<StageHeaderProps, "onToggle">) {
  return (
    <>
      <div className="min-w-0 flex-1 space-y-1">
        <h3
          className={cn(
            "text-2xl font-medium leading-8 tracking-[-0.04em]",
            isPending
              ? "text-[var(--vistral-semantic-text-muted)]"
              : "text-[var(--vistral-semantic-text-primary)]"
          )}
        >
          {stage.title}
        </h3>
        <p
          className={cn(
            "text-sm leading-5",
            isPending
              ? "text-[var(--vistral-semantic-text-muted)]"
              : "text-[var(--vistral-semantic-text-secondary)]"
          )}
        >
          {stage.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {statusBadge ? (
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusBadge.className
            )}
          >
            {statusBadge.label}
          </span>
        ) : null}
        {!isPending ? (
          <span className="text-[var(--vistral-semantic-icon-secondary)]">
            {isExpanded ? (
              <ChevronUp className="size-6" strokeWidth={1.75} />
            ) : (
              <ChevronDown className="size-6" strokeWidth={1.75} />
            )}
          </span>
        ) : (
          <span className="text-[var(--vistral-semantic-icon-secondary)]" aria-hidden>
            <ChevronDown className="size-5" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </>
  );
}

function StageHeader({ stage, isExpanded, isPending, statusBadge, onToggle }: StageHeaderProps) {
  const className = "flex w-full items-start justify-between gap-3 p-6 text-left";

  if (isPending) {
    return (
      <div className={className} aria-disabled="true">
        <StageHeaderContent
          stage={stage}
          isExpanded={isExpanded}
          isPending={isPending}
          statusBadge={statusBadge}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      className={className}
      aria-expanded={isExpanded}
    >
      <StageHeaderContent
        stage={stage}
        isExpanded={isExpanded}
        isPending={isPending}
        statusBadge={statusBadge}
      />
    </button>
  );
}

export function StageCard({
  stage,
  isExpanded,
  onToggle,
  isLast,
  lineCompleted,
  investmentId,
  onUploadComplete,
}: StageCardProps) {
  const Icon = getStageIcon(stage.icon);
  const isInProgress = stage.status === "in_progress";
  const isPending = stage.status === "pending";
  const statusBadge =
    stage.status === "in_progress" || stage.status === "completed"
      ? STAGE_STATUS_BADGE[stage.status]
      : null;

  return (
    <div className="relative flex gap-6">
      {!isLast ? (
        <span
          aria-hidden
          className={cn(
            "absolute bottom-0 left-5 top-10 w-0.5 rounded-full",
            lineCompleted ? "bg-[#2050F6]" : "bg-[#D4D4D8]"
          )}
        />
      ) : null}

      <div
        className={cn(
          "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full",
          isInProgress
            ? "bg-[#EEF4FF] text-[#162EB7]"
            : "bg-[#E4E4E7] text-[var(--vistral-semantic-icon-secondary)]"
        )}
      >
        <Icon className="size-6" strokeWidth={1.75} />
      </div>

      <div className={cn("min-w-0 flex-1", isLast ? "pb-0" : "pb-10")}>
        <div
          className={cn(
            "overflow-hidden rounded-[var(--vistral-radius-6)] border border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)]",
            isInProgress && "shadow-[var(--vistral-shadow-level-1)]"
          )}
        >
          <StageHeader
            stage={stage}
            isExpanded={isExpanded}
            isPending={isPending}
            statusBadge={statusBadge}
            onToggle={onToggle}
          />

          {isExpanded && stage.steps.length > 0 ? (
            <div className="border-t border-[var(--vistral-semantic-border-subtle)] px-6 pb-6 pt-4">
              {stage.steps.map((step, index) => {
                const nextStep = stage.steps[index + 1];
                const connectorCompleted =
                  step.status === "completed" && nextStep?.status === "completed";

                return (
                  <StepItem
                    key={step.id}
                    step={step}
                    isLast={index === stage.steps.length - 1}
                    connectorCompleted={connectorCompleted}
                    investmentId={investmentId}
                    onUploadComplete={onUploadComplete}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
