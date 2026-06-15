"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { useSupabaseAuthContext } from "./supabase-auth-context";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/utils";

type AppRole = string;

interface AppUser {
  id: string;
  email: string;
  role: AppRole;
}

interface AppAuthContextType {
  user: AppUser | null;
  role: AppRole | null;
  actualRole: AppRole | null;
  isRoleImpersonationActive: boolean;
  setRoleImpersonation: (role: AppRole | null) => void;
  isLoading: boolean;
  isAdmin: boolean;
  hasRole: (role: AppRole) => boolean;
  hasAnyRole: (roles: AppRole[]) => boolean;
}

const AppAuthContext = createContext<AppAuthContextType | undefined>(undefined);

const MOCK_USER: AppUser = {
  id: "mock-user-id",
  email: "demo@pdp-lifecycle.local",
  role: "admin",
};

const DEFAULT_ROLE: AppRole = "user";

export function AppAuthProvider({ children }: { children: ReactNode }) {
  const { user: supabaseUser, loading: supabaseLoading } = useSupabaseAuthContext();
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isDemoMode()) {
      setAppUser(MOCK_USER);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => setLoading(false), 3000);

    if (supabaseLoading) {
      return () => clearTimeout(timeoutId);
    }

    async function fetchUserRole() {
      if (!supabaseUser) {
        setAppUser(null);
        setLoading(false);
        clearTimeout(timeoutId);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", supabaseUser.id)
          .single();

        const role =
          !error && data?.role ? (data.role as AppRole) : DEFAULT_ROLE;

        setAppUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          role,
        });
      } catch {
        setAppUser({
          id: supabaseUser.id,
          email: supabaseUser.email || "",
          role: DEFAULT_ROLE,
        });
      } finally {
        setLoading(false);
        clearTimeout(timeoutId);
      }
    }

    void fetchUserRole();
    return () => clearTimeout(timeoutId);
  }, [supabaseUser, supabaseLoading]);

  const actualRole = appUser?.role ?? null;
  const effectiveRole = actualRole;

  const hasRole = useCallback((r: AppRole) => effectiveRole === r, [effectiveRole]);
  const hasAnyRole = useCallback(
    (roles: AppRole[]) => (effectiveRole ? roles.includes(effectiveRole) : false),
    [effectiveRole],
  );

  const isAdmin = useMemo(
    () => effectiveRole === "admin" || effectiveRole === "supply_admin" || effectiveRole === "super_admin",
    [effectiveRole],
  );

  const isLoading = useMemo(
    () => loading || (isDemoMode() ? false : supabaseLoading),
    [loading, supabaseLoading],
  );

  const value = useMemo<AppAuthContextType>(
    () => ({
      user: appUser,
      role: effectiveRole,
      actualRole,
      isRoleImpersonationActive: false,
      setRoleImpersonation: () => {},
      isLoading,
      isAdmin,
      hasRole,
      hasAnyRole,
    }),
    [appUser, effectiveRole, actualRole, isLoading, isAdmin, hasRole, hasAnyRole],
  );

  return <AppAuthContext.Provider value={value}>{children}</AppAuthContext.Provider>;
}

export function useAppAuth() {
  const context = useContext(AppAuthContext);
  if (!context) throw new Error("useAppAuth must be used within an AppAuthProvider");
  return context;
}
