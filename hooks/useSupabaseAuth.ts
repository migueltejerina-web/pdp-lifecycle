"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { isDemoMode } from "@/lib/utils";

const MOCK_USER: User = {
  id: "mock-user-id",
  email: "demo@pdp-lifecycle.local",
  app_metadata: {},
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
} as User;

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(isDemoMode() ? MOCK_USER : null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!isDemoMode());
  const router = useRouter();

  useEffect(() => {
    if (!isDemoMode()) return;
    setUser(MOCK_USER);
    setSession(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isDemoMode()) return;

    let mounted = true;
    const timeoutId = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 3000);

    async function initializeAuth() {
      try {
        const supabase = createClient();
        const { data: { session: s }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        clearTimeout(timeoutId);
        if (error || !s?.user) {
          setSession(null);
          setUser(null);
        } else {
          setSession(s);
          setUser(s.user);
        }
        setLoading(false);
      } catch {
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
        }
      }
    }

    void initializeAuth();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, s: Session | null) => {
      if (!mounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (isDemoMode()) {
      router.push("/login");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (isDemoMode()) return null;
    const supabase = createClient();
    const { data: { session: s } } = await supabase.auth.getSession();
    return s?.access_token ?? null;
  }, []);

  return {
    user,
    session,
    loading,
    signOut,
    getAccessToken,
    isAuthenticated: !!user,
  };
}
