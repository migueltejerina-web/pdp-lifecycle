"use client";

import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { ToastProvider } from "@/components/ui/toast-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { SupabaseAuthProvider } from "@/lib/auth/supabase-auth-context";
import { AppAuthProvider } from "@/lib/auth/app-auth-context";
import { I18nProvider } from "@/lib/i18n";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <SupabaseAuthProvider>
          <AppAuthProvider>
            <ToastProvider>
              {children}
              <Toaster />
            </ToastProvider>
          </AppAuthProvider>
        </SupabaseAuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
