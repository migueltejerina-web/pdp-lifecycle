"use client";

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';
import { config, getSupabaseProjectName } from '@/lib/config/environment';
import { isDemoMode } from '@/lib/utils';

const supabaseUrl = config.supabase.url;
const supabaseAnonKey = config.supabase.anonKey;

// Use proxy in development (avoids CORS). Set NEXT_PUBLIC_SUPABASE_USE_PROXY=false to disable.
const useProxy =
  typeof window !== 'undefined' &&
  process.env.NEXT_PUBLIC_SUPABASE_USE_PROXY !== 'false' &&
  (process.env.NEXT_PUBLIC_SUPABASE_USE_PROXY === 'true' || process.env.NODE_ENV === 'development');

// Validate environment variables only if not in demo mode
if (!isDemoMode() && (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '')) {
  const errorMessage = 
    'Missing Supabase environment variables. ' +
    `Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.\n` +
    `Current environment: ${config.environment}\n` +
    `Expected Supabase project: ${getSupabaseProjectName()}\n` +
    `Supabase URL: ${supabaseUrl ? 'Set' : 'Missing'}\n` +
    `Supabase Anon Key: ${supabaseAnonKey ? 'Set' : 'Missing'}`;
  
  if (config.isDevelopment) {
    console.warn(`⚠️ ${errorMessage}`);
  }
}

/** Custom fetch that routes through Next.js API proxy to avoid CORS.
 *  Storage paths are excluded — Supabase Storage has proper CORS and
 *  proxying large binary uploads (videos up to 50 MB) causes timeouts. */
function createProxyFetch(realUrl: string): (input: RequestInfo | URL, init?: RequestInit) => Promise<Response> {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
    if (!url.startsWith(realUrl)) return fetch(input, init);

    const pathAndQuery = url.slice(realUrl.length) || '/';

    // Bypass proxy for Storage API — direct browser→Supabase avoids buffering large files
    if (pathAndQuery.startsWith('/storage/')) {
      return fetch(input, init);
    }

    const proxyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/api/supabase-proxy${pathAndQuery.startsWith('/') ? pathAndQuery : '/' + pathAndQuery}`;
    return fetch(proxyUrl, {
      method: init?.method ?? 'GET',
      headers: init?.headers,
      body: init?.body,
      signal: init?.signal,
      credentials: 'omit',
      cache: 'no-store',
    });
  };
}

export function createClient() {
  // In demo mode, return a mock client that won't crash
  if (isDemoMode()) {
    console.debug('[Supabase Client] Demo mode: Using mock client');
    // Return a minimal mock client
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
        signOut: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }) }),
    } as any;
  }

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.trim() === '' || supabaseAnonKey.trim() === '') {
    throw new Error('Cannot create Supabase client: missing required environment variables');
  }

  const globalOptions: Record<string, any> = {
    headers: {
      'x-client-info': `pdp-lifecycle-${config.environment}`,
      'x-supabase-project': getSupabaseProjectName(),
    },
  };

  if (useProxy) {
    globalOptions.fetch = createProxyFetch(supabaseUrl);
  }
  
  return createBrowserClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: globalOptions,
    } as any
  );
}
