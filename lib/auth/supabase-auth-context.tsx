"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import type { User, Session } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/utils";

interface SupabaseAuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  isAuthenticated: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

const DEMO_AUTH: SupabaseAuthContextType = {
  user: {
    id: "mock-user-id",
    email: "demo@pdp-lifecycle.local",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: new Date().toISOString(),
  } as User,
  session: null,
  loading: false,
  signOut: async () => {},
  getAccessToken: async () => null,
  isAuthenticated: true,
};

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
  const realAuth = useSupabaseAuth();
  const value = useMemo(
    () => (isDemoMode() ? DEMO_AUTH : realAuth),
    [realAuth],
  );

  return (
    <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
  );
}

export function useSupabaseAuthContext() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error("useSupabaseAuthContext must be used within a SupabaseAuthProvider");
  }
  return context;
}
