"use client";

import { Building2, Home } from "lucide-react";
import { VistralLogo } from "@/components/vistral-logo";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "home", icon: Home, label: "Inicio", active: false },
  { id: "properties", icon: Building2, label: "Propiedades", active: true },
] as const;

export function InvestmentSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-[var(--prophero-z-fixed)] flex w-20 flex-col items-center border-r border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-default)] py-6">
      <VistralLogo iconOnly className="mb-10" />

      <nav className="flex flex-1 flex-col items-center gap-2" aria-label="Navegación principal">
        {NAV_ITEMS.map(({ id, icon: Icon, label, active }) => (
          <button
            key={id}
            type="button"
            aria-label={label}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex size-10 items-center justify-center rounded-[var(--vistral-radius-2)] transition-colors",
              active
                ? "bg-[#D9E7FF] text-[var(--vistral-semantic-icon-brand)]"
                : "text-[var(--vistral-semantic-icon-secondary)] hover:bg-[var(--vistral-semantic-bg-muted)]"
            )}
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </button>
        ))}
      </nav>

      <div
        className="flex size-10 items-center justify-center rounded-full bg-[var(--vistral-semantic-bg-brand-subtle)] text-sm font-semibold text-[var(--vistral-semantic-text-brand)]"
        aria-label="Usuario AG"
      >
        AG
      </div>
    </aside>
  );
}
