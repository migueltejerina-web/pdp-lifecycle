"use client";

import { ToastProvider as VistralToastProvider } from "@vistral/design-system";
import type { ReactNode } from "react";

export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <VistralToastProvider position="top-center">
      {children}
    </VistralToastProvider>
  );
}
