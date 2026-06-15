"use client";

import { useMemo, useState } from "react";
import { getEnrichedStages } from "@/utils/lifecycle.utils";
import type { Lifecycle } from "@/types/lifecycle";
import { StageCard } from "./StageCard";

interface OperationStatusProps {
  lifecycle: Lifecycle;
  investmentId: string;
  onUploadComplete?: () => void;
}

function resolveInitialExpandedStage(lifecycle: Lifecycle): string | null {
  const arrasStage = lifecycle.stages.find((stage) => stage.id === "arras");
  if (arrasStage?.status === "completed" && lifecycle.currentStage === "escrituras") {
    return "arras";
  }
  return lifecycle.currentStage;
}

export function OperationStatus({
  lifecycle,
  investmentId,
  onUploadComplete,
}: OperationStatusProps) {
  const [expandedStage, setExpandedStage] = useState<string | null>(() =>
    resolveInitialExpandedStage(lifecycle)
  );
  const enrichedStages = useMemo(() => getEnrichedStages(lifecycle), [lifecycle]);

  const activeStageIndex = useMemo(
    () => enrichedStages.findIndex((stage) => stage.status === "in_progress"),
    [enrichedStages]
  );

  const handleToggle = (stageId: string) => {
    setExpandedStage((prev) => (prev === stageId ? null : stageId));
  };

  return (
    <section>
      <h2 className="mb-5 text-lg font-medium text-[var(--vistral-semantic-text-primary)]">
        Estado de la operación
      </h2>

      <div className="space-y-0">
        {enrichedStages.map((stage, index) => (
          <StageCard
            key={stage.id}
            stage={stage}
            isExpanded={expandedStage === stage.id}
            onToggle={() => {
              if (stage.status === "pending") return;
              handleToggle(stage.id);
            }}
            isLast={index === enrichedStages.length - 1}
            lineCompleted={index < activeStageIndex || stage.status === "completed"}
            investmentId={investmentId}
            onUploadComplete={onUploadComplete}
          />
        ))}
      </div>
    </section>
  );
}
