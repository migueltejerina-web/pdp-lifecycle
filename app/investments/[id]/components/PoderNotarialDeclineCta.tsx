"use client";

import { useState } from "react";

interface PoderNotarialDeclineCtaProps {
  investmentId?: string;
  onComplete?: () => void;
}

export function PoderNotarialDeclineCta({
  investmentId,
  onComplete,
}: PoderNotarialDeclineCtaProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    if (!investmentId || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/investments/${investmentId}/poder-notarial-decline`,
        { method: "POST" }
      );
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "No se pudo registrar tu preferencia");
      }

      onComplete?.();
    } catch (declineError) {
      setError(
        declineError instanceof Error
          ? declineError.message
          : "No se pudo registrar tu preferencia"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex shrink-0 flex-col items-end gap-1">
      <button
        type="button"
        disabled={loading || !investmentId}
        onClick={handleClick}
        className="shrink-0 text-left text-xs font-medium leading-5 text-[#162EB7] transition-opacity hover:opacity-80 disabled:cursor-wait disabled:opacity-70"
      >
        {loading ? "Guardando…" : "No estoy interesado en poder notarial"}
      </button>
      {error ? <p className="text-xs text-[#B42318]">{error}</p> : null}
    </div>
  );
}
