---
name: nextjs/security-checklist
description: Pre-commit security checklist for Vistral Lab — auth, RLS, signed URLs, no hardcoded secrets. Run before every PR.
---

# Security Checklist (Pre-Commit)

Run through this before opening a PR. Each item is a real attack vector that has been seen in this codebase or similar projects.

## Auth

- [ ] **getUser() not getSession()** — API routes must call `supabase.auth.getUser()`. `getSession()` trusts the client cookie without re-validating with the server.
  
  ```typescript
  // WRONG
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  
  // CORRECT
  const { data: { user } } = await supabase.auth.getUser()
  ```

- [ ] **Auth check is first** — In every API route, the auth check must be the very first operation, before any body parsing or DB queries.

- [ ] **Role check for admin routes** — Any route under `app/api/admin/` must verify the user has `supply_admin` role before proceeding.

- [ ] **No auth logic in client components** — Server-side auth validation belongs in API routes, not in `"use client"` components.

## RLS (Row Level Security)

- [ ] **Every new table has RLS enabled**
  
  ```sql
  -- Check in Supabase Dashboard → Table Editor → your table → RLS
  -- Or confirm: ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;
  ```

- [ ] **At least one SELECT policy** — An enabled RLS with no policies blocks ALL access including authenticated users.

- [ ] **Policies tested with a real user** — Don't rely on service role access to verify RLS is correct. Test with an actual user session.

- [ ] **RLS policy doesn't reference user_roles in a recursive way** — Policies that JOIN user_roles can cause infinite recursion. Use security definer helpers if needed (see migration 040).

## Secrets and Environment Variables

- [ ] **No hardcoded secrets** — No API keys, tokens, passwords, or service role keys in code. Use `lib/config/environment.ts`.

- [ ] **No NEXT_PUBLIC_ for server-only values** — `NEXT_PUBLIC_` variables are bundled into the browser build and visible to anyone. Only use for truly public values like the Supabase URL.
  
  | Variable | Correct prefix |
  |----------|----------------|
  | Supabase URL | `NEXT_PUBLIC_SUPABASE_URL` ✓ |
  | Supabase anon key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓ |
  | Service role key | `SUPABASE_SERVICE_ROLE_KEY` (no prefix) ✓ |
  | DocuSign token | `DOCUSIGN_ACCESS_TOKEN` (no prefix) ✓ |
  | Any API secret | No `NEXT_PUBLIC_` prefix ✓ |

- [ ] **Service role key only in API routes** — `SUPABASE_SERVICE_ROLE_KEY` must never appear in components, hooks, or client-side code.

## File Storage

- [ ] **Private files use signed URLs, not public URLs**
  
  Real example from this codebase — `app/api/contracts/fetch-signed-pdf/route.ts` currently uses `getPublicUrl()` on the `contract-documents` bucket. This is a known issue. New code must use signed URLs:
  
  ```typescript
  // WRONG — anyone with the URL can access the file forever
  const { data: { publicUrl } } = supabase.storage
    .from('contract-documents')
    .getPublicUrl(fileName)
  
  // CORRECT — URL expires after 1 hour
  const { data, error } = await supabase.storage
    .from('contract-documents')
    .createSignedUrl(fileName, 3600)
  
  if (error || !data) throw new Error('Could not generate signed URL')
  const signedUrl = data.signedUrl
  ```

- [ ] **`contract-documents` bucket is private** — Verify in Supabase Dashboard → Storage → Policies that this bucket does not have a public read policy.

## Input Validation

- [ ] **Zod schema validates all API input** — Every `POST`/`PATCH`/`PUT` route must parse the body with a Zod schema before using it.

- [ ] **No raw user input in SQL** — Use Supabase's parameterized queries (the `.from().select().eq()` chain). Never concatenate strings to build queries.

## Quick scan commands

```bash
# Find potential getSession() usage in API routes
grep -r "getSession" app/api/

# Find potential process.env usage (should use lib/config/environment.ts)
grep -r "process\.env\." app/ --include="*.ts" --include="*.tsx" | grep -v "SUPABASE_SERVICE_ROLE_KEY"

# Find getPublicUrl in storage operations (should be signed URLs for private buckets)
grep -r "getPublicUrl" app/ lib/

# Find any console.log (should be console.error with context prefix)
grep -r "console\.log" app/ lib/ hooks/
```
