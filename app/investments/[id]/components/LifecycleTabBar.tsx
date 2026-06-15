"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type TabItem = {
  value: string;
  label: string;
  badge?: number;
};

const TAB_ITEMS: TabItem[] = [
  { value: "operacion", label: "Mi operación" },
  { value: "resumen", label: "Resumen" },
  { value: "finanzas", label: "Finanzas" },
  { value: "ubicacion", label: "Ubicación" },
  { value: "legal", label: "Legal y Documentos", badge: 5 },
];

interface LifecycleTabBarProps {
  operationContent: ReactNode;
}

function TabPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-[var(--vistral-radius-6)] border border-dashed border-[var(--vistral-semantic-border-muted)] bg-[var(--vistral-semantic-bg-subtle)]">
      <p className="text-sm text-[var(--vistral-semantic-text-muted)]">{label} — próximamente</p>
    </div>
  );
}

export function LifecycleTabBar({ operationContent }: LifecycleTabBarProps) {
  return (
    <Tabs defaultValue="operacion" className="w-full">
      <div className="sticky top-14 z-[calc(var(--prophero-z-sticky)-1)] -mx-6 border-b border-[var(--vistral-semantic-border-subtle)] bg-[color-mix(in_srgb,var(--vistral-semantic-bg-default)_85%,transparent)] px-6 backdrop-blur-[var(--vistral-blur-3)]">
        <TabsList className="inline-flex h-auto gap-6 rounded-none bg-transparent p-0">
          {TAB_ITEMS.map(({ value, label, badge }) => (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "relative h-10 rounded-none border-0 bg-transparent px-0 pb-3 pt-2 text-sm font-medium shadow-none",
                "text-[var(--vistral-semantic-text-secondary)] hover:text-[var(--vistral-semantic-text-primary)]",
                "data-[state=active]:bg-transparent data-[state=active]:text-[var(--vistral-semantic-text-primary)] data-[state=active]:shadow-none",
                "after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:bg-[var(--vistral-semantic-interactive-brand-default)] after:transition-transform",
                "data-[state=active]:after:scale-x-100"
              )}
            >
              <span className="flex items-center gap-2">
                {label}
                {badge !== undefined ? (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[var(--vistral-semantic-bg-muted)] px-1.5 text-xs font-medium text-[var(--vistral-semantic-text-secondary)]">
                    {badge}
                  </span>
                ) : null}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>

      <TabsContent value="operacion" className="mt-6">
        {operationContent}
      </TabsContent>
      <TabsContent value="resumen" className="mt-6">
        <TabPlaceholder label="Resumen" />
      </TabsContent>
      <TabsContent value="finanzas" className="mt-6">
        <TabPlaceholder label="Finanzas" />
      </TabsContent>
      <TabsContent value="ubicacion" className="mt-6">
        <TabPlaceholder label="Ubicación" />
      </TabsContent>
      <TabsContent value="legal" className="mt-6">
        <TabPlaceholder label="Legal y Documentos" />
      </TabsContent>
    </Tabs>
  );
}
