"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

interface PoderNotarialResumeCtaProps {
  investmentId?: string;
  onComplete?: () => void;
  variant?: "step" | "sidebar";
}

export function PoderNotarialResumeCta({
  investmentId,
  onComplete,
  variant = "step",
}: PoderNotarialResumeCtaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!investmentId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/investments/${investmentId}/poder-notarial-resume`,
        { method: "POST" }
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo retomar el poder notarial");
      }

      onComplete?.();
    } catch (resumeError) {
      setError(
        resumeError instanceof Error
          ? resumeError.message
          : "No se pudo retomar el poder notarial"
      );
    } finally {
      setLoading(false);
    }
  }

  const isSidebar = variant === "sidebar";

  return (
    <div className={cn("flex flex-col gap-1", isSidebar ? "w-full" : "items-start")}>
      <button
        type="button"
        disabled={loading || !investmentId}
        onClick={handleClick}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70",
          isSidebar
            ? "mt-5 h-10 w-full rounded-full bg-[var(--vistral-semantic-interactive-brand-default)] text-sm text-white"
            : "h-8 shrink-0 rounded-full bg-[#2050F6] px-4 text-xs text-white"
        )}
      >
        {loading ? "Abriendo…" : "Retomar poder notarial"}
      </button>
      {error ? <p className="text-xs text-[#B42318]">{error}</p> : null}
    </div>
  );
}
