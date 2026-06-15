---
name: deployment-safety
description: Pre-deployment checklist, deployment steps, and rollback procedures for Vercel. Use when the user says "ready to deploy", "pre-deploy check", "deployment checklist", or needs to deploy, verify, or rollback.
---

# Deployment Safety

## When to Use

- Before deploying to staging or production
- After a Vercel deploy fails and you need to debug
- When production breaks and you need to rollback
- Before merging a PR that includes database changes

---

## Branch & Environment Map

| Branch | Environment | URL | Auto-deploy |
|--------|-------------|-----|-------------|
| Feature branches | Preview | `*.vercel.app` (unique per PR) | Yes |
| `dev` | Staging | staging URL | Yes |
| `main` | Production | production URL | Yes |

**Flow:** Feature branch → PR to `dev` → merge → staging auto-deploys → PR from `dev` to `main` → merge → production auto-deploys.

---

## Pre-Deploy Checklist

Run ALL before merging to `dev` or `main`:

### 1. Build check

```bash
npm run build
```

Must pass with zero errors. If TypeScript errors: `npx tsc --noEmit` to see all.

### 2. Lint check

```bash
npm run lint
```

### 3. Environment variables

- `.env.local.example` updated if new vars added
- No secrets in code (search for hardcoded keys)
- `NEXT_PUBLIC_` prefix ONLY for client-safe values
- New vars configured in Vercel (Settings > Environment Variables) for the target environment

### 4. Console cleanup

- No `console.log` in changed files (only `console.error` with `[Context]:` prefix)
- No commented-out code
- No `debugger` statements

### 5. Database (if changed)

- Migration ran locally without errors
- RLS policies tested (can the right roles access the data?)
- New tables have RLS enabled + at least one policy
- Migration file uses timestamp naming: `YYYYMMDD_HHMM_description.sql`
- **NEVER modify existing migration files** — create a new corrective migration instead

### 6. Auth / Permissions (if changed)

- Role checks verified for affected routes
- `supabase.auth.getUser()` used (never `getSession()`) in API routes
- No service role key exposed in client code

---

## Deployment Steps

### Staging (merge to `dev`)

1. Run pre-deploy checklist above
2. Create PR against `dev` (use **create-pr** skill)
3. CI must pass: lint → type-check → build
4. Get at least 1 approval
5. Merge — Vercel auto-deploys to staging
6. Verify on staging: login works, feature works, forms submit, data loads, no console errors
7. Test on mobile

### Production (merge `dev` → `main`)

1. Verify feature works on staging first
2. Create PR from `dev` to `main`
3. If database migration included: **coordinate with dev** — migration runs automatically on deploy
4. Merge — Vercel auto-deploys to production
5. Verify immediately: login, main feature, check mobile
6. Monitor for 15 minutes (check Vercel logs for errors)

---

## Rollback Procedures

### App rollback (Vercel — ~2 minutes)

1. Go to Vercel Dashboard → Deployments tab
2. Find the previous green deployment
3. Click "..." menu → "Promote to Production"
4. Verify the rollback worked

### Database rollback (requires dev)

Database migrations **cannot be auto-rolled back**. If a migration caused issues:

1. **Rollback the app first** (Vercel, see above)
2. Post in #vistral-lab: "Production rollback needed — migration [name] caused [issue]"
3. Dev creates a corrective migration (never edit the original)
4. Test corrective migration locally → staging → production

**This is why database changes always need dev review before merging.**

---

## Debugging Failed Deploys

### Check Vercel build logs

1. Vercel Dashboard → Deployments → click the failed deployment
2. Open "Building" phase logs
3. Common errors:
   - **TypeScript errors:** Fix locally with `npx tsc --noEmit`
   - **Missing dependencies:** `npm install <pkg>`, commit both `package.json` + `package-lock.json`
   - **Case-sensitive paths:** `Button` vs `button` — Linux (Vercel) is strict, Mac is not
   - **Missing env vars:** Check Settings > Environment Variables for the right environment

### Check runtime errors (post-deploy)

1. Vercel Dashboard → Deployments → click deployment → "Runtime Logs"
2. Look for 500 errors, auth failures, or Supabase connection issues
3. If Supabase queries fail: verify RLS policies and env vars match the environment

---

## Emergency Protocol

**If production is broken:**

1. **Rollback immediately** via Vercel Dashboard (don't debug first)
2. Post in #vistral-lab: "Production rolled back — [what broke]"
3. Fix the issue locally
4. Run full pre-deploy checklist
5. Test on staging first
6. Redeploy to production

**Time to revert:** ~2 minutes (Vercel rollback). This is instant for the app layer. Database changes may require dev intervention.

---

## Skill Chain

- Run **post-change-checks** before deploying
- Use **create-pr** to ship work to the right branch
- If deploy fails, use the debugging section above before retrying
