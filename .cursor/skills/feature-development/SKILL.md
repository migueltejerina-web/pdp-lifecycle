---
name: feature-development
description: Create a complete feature end-to-end — from design to deployment, optimized for vibe coding with MCP integrations
---

# Feature Development (Vibe Coding Edition)

## When to Use This Skill

Use this skill when:

- You are creating a new complete feature (new page, CRUD, workflow)
- You have a Figma design (optional)
- You need a step-by-step guide from zero to deploy

## Prerequisites

Before starting, have clear:

- **What the feature does** (user story, requirements)
- **Who can use it** (roles/permissions — see `03-auth-permissions.mdc`)
- **Where it lives** (domain: `app/supply/`, `app/reno/`, `app/proyecto/`, `app/admin/`, or new route)
- **Figma design** (if it exists, have the link ready)

---

## Step 1 — Analyze Requirements

**Prompt to use:**

```markdown
"Let's create a feature: [description]

User story:
- As [role]
- I want [action]
- So that [benefit]

Help me:
1. Identify what components I need
2. What API endpoints I need (app/api/)
3. What permissions/roles apply (03-auth-permissions.mdc)
4. Where it lives in the app (which domain folder)

Give me a step-by-step plan."
```

**Expected output:**

- List of components to create (in `components/[domain]/`)
- Required API endpoints (in `app/api/`)
- Required roles/permissions
- Suggested file structure following App Router conventions

---

## Step 2 — Design System Check (MANDATORY)

**If you have Figma:**

```markdown
"I have this Figma design: [URL]

Use Figma MCP to:
1. Extract layout, spacing, typography
2. Map to --prophero-* design tokens (see app/prophero.css)
3. Identify which Radix UI / components/ui/ primitives match
4. Verify responsive breakpoints

Check components/ui/ for existing components before creating new ones."
```

**If you DON'T have Figma:**

```markdown
"I need to create [component]

Before creating, verify:
1. Does a similar component exist in components/ui/?
2. Is there a similar pattern in components/[domain]/?
3. What design tokens from app/prophero.css should I use?

Give me options before creating from scratch."
```

---

## Step 3 — Types and Supabase Schema

**Prompt:**

```markdown
"Let's set up the data layer for this feature.

1. Check if the Supabase table exists (use Supabase MCP)
2. If new table needed: create migration (YYYYMMDD_HHMM_description.sql)
   - MUST include RLS policies (see 00-core.mdc)
   - MUST use search_path in SECURITY DEFINER functions
3. Generate/update TypeScript types from Supabase schema
4. Types go in lib/supabase/ (generated) or types/ (custom)

Domain: [properties/projects/renovations/etc]"
```

**Files involved:**

- `supabase/migrations/YYYYMMDD_HHMM_*.sql` (new migration)
- `lib/supabase/types.ts` (generated types)
- `types/` (custom domain types if needed)

---

## Step 4 — Service Layer (Hook)

**Prompt:**

```markdown
"Create a custom hook for this feature's data.

Following the pattern from existing hooks (hooks/usePropertyData.ts):
1. Use Supabase client from lib/supabase/
2. Check isDemoMode() before Supabase calls
3. Handle loading, error, and empty states
4. Return typed data: { data, isLoading, error }

Hook file: hooks/use[FeatureName].ts"
```

**File to create:**

- `hooks/use[FeatureName].ts`

---

## Step 5 — Create Component

**Prompt:**

```markdown
"Create component [ComponentName]

Following project conventions:
1. Named export (not default) — components/[domain]/[ComponentName].tsx
2. Max 300 lines (see 10-progressive-refactor.mdc)
3. Props interface defined inline or co-located
4. Error handling with try/catch (06-error-handling.mdc)
5. Loading states and toast feedback
6. Use design tokens from app/prophero.css
7. Use Radix UI primitives from components/ui/ where possible

Component type: [Page / Form / Card / Dialog / etc]"
```

**File structure:**

```
components/[domain]/
└── [ComponentName].tsx
```

---

## Step 6 — Add Route (App Router)

**Prompt:**

```markdown
"Add route for this feature using Next.js App Router.

Route: app/[domain]/[path]/page.tsx
Protected: yes (wrap with auth check)
Required role: [role] (see 03-auth-permissions.mdc)

Create page.tsx as default export."
```

**File to create:**

- `app/[domain]/[path]/page.tsx`

---

## Step 7 — i18n Strings

**Prompt:**

```markdown
"Add i18n strings for this feature.

Using useI18n() hook from lib/i18n/:
- Translation keys: t.[section].[key]
- Spanish is primary language
- English must also be added

Add strings to lib/i18n/translations.ts under the appropriate section:
- title, description
- empty state message
- error messages
- success toast
- button labels"
```

---

## Step 8 — API Route (if needed)

**Prompt:**

```markdown
"Create API route for this feature.

Following 05-api-routes.mdc pattern:
1. File: app/api/[domain]/route.ts
2. Verify auth with supabase.auth.getUser() (NEVER getSession)
3. Validate input with Zod
4. Call service logic
5. Return typed response

Read environment from lib/config/environment.ts, not process.env directly."
```

---

## Step 9 — Visual Testing

**Prompt:**

```markdown
"Use Browser MCP (Playwright) for visual testing:

1. Open localhost:3000/[route]
2. Screenshot at 375px / 768px / 1920px
3. Interact with the feature:
   - [list of user actions]
4. Screenshot of each state
5. Compare with Figma (if exists)

Report: What looks good, what needs adjustment."
```

---

## Step 10 — Supabase Verification

**Prompt:**

```markdown
"Use Supabase MCP to verify:

1. Table [table_name] exists with correct columns?
2. RLS policies configured? (who reads, who writes)
3. Indexes created for common queries?
4. Signed URLs for any private file storage? (never public URLs for user docs)

If anything is missing, create it following 00-core.mdc and 02-supabase.mdc."
```

---

## Step 11 — Pre-Deploy Checks

Run the **post-change-checks** skill, which covers:

1. TypeScript check (`npx tsc --noEmit`)
2. Build check (`npm run build`)
3. No console.logs in code
4. Supabase types up to date
5. Environment variables documented

---

## Step 12 — Create PR

Run the **create-pr** skill, which handles:

1. Create feature branch (`feat/[description]`)
2. Commit with conventional format
3. Push to origin
4. Open PR against `dev` with dual-audience description
5. Never push directly to `main`

---

## Final Checklist

### Code Quality

- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No lint errors (`npm run lint`)
- [ ] Components under 300 lines
- [ ] Error handling with try/catch
- [ ] No `console.log` (only `console.error` with context)

### Functionality

- [ ] Feature works on localhost
- [ ] Tested with Browser MCP (Playwright)
- [ ] Permissions/roles verified
- [ ] Loading / error / empty states implemented
- [ ] Toast feedback on mutations

### Data

- [ ] Supabase table + RLS verified
- [ ] Types generated and up to date
- [ ] Hooks handle `isDemoMode()` check
- [ ] Data persists correctly
- [ ] Signed URLs for private files (not public URLs)

### UI/UX

- [ ] Responsive (375px / 768px / 1920px)
- [ ] Matches Figma (if applicable)
- [ ] Uses `--prophero-*` design tokens
- [ ] Radix UI / components/ui/ primitives used
- [ ] i18n strings in Spanish + English

### Deployment

- [ ] Build passes locally
- [ ] PR created against `dev`
- [ ] CI passes (lint → type-check → build)
- [ ] No secrets in code

---

## Troubleshooting

### Build fails with TypeScript errors

```markdown
"Fix TypeScript errors:
1. Run npx tsc --noEmit
2. Show me the errors
3. Fix one by one
4. Re-run build"
```

### Supabase query not working

```markdown
"Debug Supabase query:
1. Use Supabase MCP to run manual query
2. Verify RLS policies allow current user's role
3. Check isDemoMode() is handled
4. Show me the exact Supabase error"
```

### Deploy fails on Vercel

```markdown
"Debug Vercel deploy:
1. Check build logs in Vercel dashboard
2. Verify env vars are configured (Settings > Environment Variables)
3. Does local build pass? npm run build
4. Common: case-sensitive paths (Mac vs Linux)"
```

---

## Skill Chain

This skill works best when combined with:

- **figma-to-code** — if starting from a Figma design
- **form-creation** — if the feature includes forms
- **post-change-checks** — before committing (Step 11)
- **create-pr** — to ship the work (Step 12)
