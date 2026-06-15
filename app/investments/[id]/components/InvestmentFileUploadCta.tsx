"use client";

import type { ReactNode } from "react";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StepCTA, StepCTAAction, StepCTAIcon } from "@/types/lifecycle";

export function getUploadEndpoint(action: StepCTAAction): string | null {
  if (action === "upload_contract") return "arras-contract";
  if (action === "upload_arras_receipt") return "arras-receipt";
  if (action === "upload_exchange_fee_receipt") return "exchange-fee-receipt";
  return null;
}

function uploadErrorMessage(action: StepCTAAction): string {
  if (action === "upload_arras_receipt") return "No se pudo subir el comprobante";
  if (action === "upload_exchange_fee_receipt") return "No se pudo subir el comprobante de tarifa";
  return "No se pudo subir el contrato";
}

function uploadSuccessMessage(action: StepCTAAction): string {
  if (action === "upload_arras_receipt") return "Comprobante subido correctamente";
  if (action === "upload_exchange_fee_receipt") return "Comprobante de tarifa subido correctamente";
  return "Contrato subido correctamente";
}

function CtaIcon({ icon }: { icon: StepCTAIcon }) {
  return <Upload className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />;
}

interface InvestmentFileUploadCtaProps {
  investmentId: string;
  action: StepCTAAction;
  label: string;
  onUploaded?: () => void;
  variant?: "step" | "sidebar";
  icon?: StepCTAIcon;
}

export function InvestmentFileUploadCta({
  investmentId,
  action,
  label,
  onUploaded,
  variant = "step",
  icon,
}: InvestmentFileUploadCtaProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const uploadEndpoint = getUploadEndpoint(action);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !uploadEndpoint) return;

    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/investments/${investmentId}/${uploadEndpoint}`, {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? uploadErrorMessage(action));
      }

      setSuccess(true);
      onUploaded?.();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Error al subir el archivo");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  if (!uploadEndpoint) return null;

  const isSidebar = variant === "sidebar";

  return (
    <div className={cn("flex flex-col gap-1", isSidebar ? "w-full" : "items-start")}>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "inline-flex items-center justify-center font-medium transition-opacity hover:opacity-90 disabled:cursor-wait disabled:opacity-70",
          isSidebar
            ? "mt-5 h-10 w-full gap-2 rounded-full bg-[var(--vistral-semantic-interactive-brand-default)] text-sm text-white"
            : "h-8 shrink-0 gap-1.5 rounded-full bg-[#D9E7FF] px-4 text-xs text-[#162EB7]"
        )}
      >
        {icon ? <CtaIcon icon={icon} /> : null}
        {uploading ? "Subiendo…" : label}
      </button>
      {error ? (
        <p className={cn("text-xs text-[#B42318]", isSidebar && "mt-1")}>{error}</p>
      ) : null}
      {success ? (
        <p className={cn("text-xs text-[#0F6B3A]", isSidebar && "mt-1")}>
          {uploadSuccessMessage(action)}
        </p>
      ) : null}
    </div>
  );
}

export function isUploadAction(action: StepCTAAction): boolean {
  return getUploadEndpoint(action) !== null;
}

export function renderStepUploadCta(
  cta: StepCTA,
  stepId: string,
  investmentId: string | undefined,
  onUploaded?: () => void,
  fallback?: ReactNode
) {
  if (!investmentId || !getUploadEndpoint(cta.action)) {
    return fallback ?? null;
  }

  return (
    <InvestmentFileUploadCta
      key={`${stepId}-${cta.action}-${cta.label}`}
      investmentId={investmentId}
      action={cta.action}
      label={cta.label}
      icon={cta.icon}
      onUploaded={onUploaded}
      variant="step"
    />
  );
}
