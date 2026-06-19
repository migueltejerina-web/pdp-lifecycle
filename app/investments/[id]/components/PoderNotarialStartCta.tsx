"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { PoderNotarialFormDialog } from "./PoderNotarialFormDialog";

type PoderNotarialStartVariant = "primary" | "title_link" | "sidebar";

interface PoderNotarialStartCtaProps {
  investmentId?: string;
  label: string;
  variant?: PoderNotarialStartVariant;
  onComplete?: () => void;
}

export function PoderNotarialStartCta({
  investmentId,
  label,
  variant = "primary",
  onComplete,
}: PoderNotarialStartCtaProps) {
  const [open, setOpen] = useState(false);

  function handleClick() {
    if (!investmentId) return;
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        disabled={!investmentId}
        onClick={handleClick}
        className={cn(
          variant === "sidebar" &&
            "mt-5 flex h-10 w-full items-center justify-center rounded-full bg-[var(--vistral-semantic-interactive-brand-default)] text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "primary" &&
            "inline-flex h-8 shrink-0 items-center justify-center rounded-full bg-[#2050F6] px-4 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
          variant === "title_link" &&
            "shrink-0 text-xs font-medium leading-5 text-[#162EB7] transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
        )}
      >
        {label}
      </button>

      {investmentId ? (
        <PoderNotarialFormDialog
          investmentId={investmentId}
          open={open}
          onOpenChange={setOpen}
          onSuccess={onComplete}
        />
      ) : null}
    </>
  );
}
