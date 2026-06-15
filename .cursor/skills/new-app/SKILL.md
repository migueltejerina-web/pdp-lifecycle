---
description: Scaffold a new internal app inside the PDP Lifecycle deployment as a route group. Same Vercel project, same DB, same auth — accessible at /<slug> immediately.
triggers:
  - "new app"
  - "spawn app"
  - "create new app"
  - "new-app"
  - "nueva app"
  - "crear app nueva"
  - "spawnear app"
---

# new-app — Vistral internal app spawner

Creates a new app at `app/(apps)/<slug>/` inside the existing Supply Next.js project. No separate Vercel deployment, no hub proxy, no Auth0 callback changes required. The app is accessible at `/<slug>` on the same Supply URL the moment the PR is merged and deployed.

## When to use

- A PM needs to start a new **internal** product (investment tracker, gestoria, dashboard, client viewer, etc.).
- The app should share the same login session, Supabase database, and deployment as Supply.

## What gets automated

- `app/(apps)/<slug>/` scaffolded from `app/(apps)/_template/` with placeholders replaced.
- `.github/ownership.yml` updated so the owner can modify `app/(apps)/<slug>/**` without a manual `@product` review.
- Optionally: Supabase schema `apps_<slug>` created on both `main` and `dev` branches (when `NEEDS_DB=yes`).
- Branch created, commit pushed, PR opened with reviewer, labels, and provisioning summary.

## What stays manual (by design)

- Any custom navigation link in the Supply sidebar or hub page — add it after the PR merges.
- Production Supabase schema changes (follow the migration standards in `.cursor/rules/11-migrations.mdc`).

---

## Step 1 — Collect inputs

Ask the PM in a single message with examples:

1. **Slug** — kebab-case, lowercase, `^[a-z][a-z0-9-]{1,31}$`. E.g. `investment`.
2. **Display name** — e.g. "Investment Tracker".
3. **Owner GitHub handle** — no `@`. E.g. `ivelazco`.
4. **Accent color** — one of `blue`, `emerald`, `amber`, `violet`, `rose`, `slate`.
5. **Needs its own Supabase tables?** — `yes` / `no`.
   - `yes` → creates a dedicated schema `apps_<slug>` inside the **same shared Supply Supabase database**. You can then add tables to it. **Tables are never deleted — only created or modified.**
   - `no` → the app reads/writes directly against existing Supply tables (no schema created).
   - Either way, this is the **same database** the Supply app uses — no new Supabase project is ever created.

Store as: `SLUG`, `DISPLAY`, `OWNER`, `COLOR`, `NEEDS_DB`.

## Step 2 — Check Supabase credentials (only needed when NEEDS_DB=yes)

If `NEEDS_DB=yes`, check whether `.env.local` already has the three required Supabase values:

```bash
grep -E "^NEXT_PUBLIC_SUPABASE_URL=.+" .env.local 2>/dev/null
grep -E "^NEXT_PUBLIC_SUPABASE_ANON_KEY=.+" .env.local 2>/dev/null
grep -E "^SUPABASE_SERVICE_ROLE_KEY=.+" .env.local 2>/dev/null
```

**If all three are present:** confirm to the user and continue to Step 3.

**If any are missing:**

First, check if `.env.local.example` exists and try to bootstrap from it:

```bash
test -f .env.local.example && ! test -f .env.local && cp .env.local.example .env.local
```

Then ask the user in a single message:

> "Para crear el schema de Supabase de la nueva app, necesito 3 valores del entorno staging.
>
> **Opción rápida — 1Password:**
> Buscá **"Vistral LAB AI Dashboard"** en 1Password — los 3 valores están ahí bajo el entorno `dev`.
>
> **Opción alternativa — Supabase Dashboard:**
> 👉 [supabase.com/dashboard](https://supabase.com/dashboard) → **proyecto Supply** → **Settings → API**
> Asegurate de estar en el **branch `dev`** (selector arriba a la izquierda).
>
> Pasame:
> 1. **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`) — se ve como `https://xxxx.supabase.co`
> 2. **Anon key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) — la key `anon` bajo "Project API keys"
> 3. **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) — la key `service_role`
>
> 💡 Si ya hiciste el onboarding (Día 1, paso 9), estos valores ya están en tu `.env.local`."

Once the user provides the values, write them into `.env.local` (append or update — never overwrite other keys):

```bash
grep -q "^NEXT_PUBLIC_SUPABASE_URL=" .env.local || echo "NEXT_PUBLIC_SUPABASE_URL=<value>" >> .env.local
grep -q "^NEXT_PUBLIC_SUPABASE_ANON_KEY=" .env.local || echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=<value>" >> .env.local
grep -q "^SUPABASE_SERVICE_ROLE_KEY=" .env.local || echo "SUPABASE_SERVICE_ROLE_KEY=<value>" >> .env.local
```

## Step 3 — Pre-flight checks (abort cleanly on failure)

Run all of these and abort with a precise, actionable message on any failure:

- `git rev-parse --is-inside-work-tree` — must be inside the repo.
- `git status --porcelain` — working tree must be clean. **Never auto-stash.** If dirty, tell the PM to commit or stash first.
- `gh auth status` — must be authenticated. If not, print `gh auth login` instructions and stop.
- Slug matches regex `^[a-z][a-z0-9-]{1,31}$`.
- Slug is not in the reserved list: `hub`, `supply`, `admin`, `login`, `_template`, `api`, `auth`.
- `app/(apps)/<SLUG>/` does not already exist.

## Step 4 — Create branch

Branch off the **current branch** (whatever is checked out when the skill runs — do NOT switch to main first):

```bash
git checkout -b spawner/new-app-<SLUG>
```

## Step 5 — Scaffold route group

```bash
node scripts/spawn/rewrite.mjs \
  --slug <SLUG> \
  --display "<DISPLAY>" \
  --owner <OWNER> \
  --color <COLOR> \
  --needs-db <NEEDS_DB>
```

Effects:

- Copies `app/(apps)/_template/` → `app/(apps)/<SLUG>/` and replaces `__SLUG__`, `__SLUG_PASCAL__`, `__DISPLAY_NAME__`, `__OWNER__`, `__COLOR__` placeholders.
- Appends an owner entry in `.github/ownership.yml` under `owners:` with `paths: [app/(apps)/<SLUG>/**, docs/<SLUG>/**]`.

## Step 6 — Provision Supabase schema (only if NEEDS_DB=yes and SUPABASE_ACCESS_TOKEN is set)

```bash
node scripts/spawn/provision-supabase.mjs --slug <SLUG>
```

- Runs `CREATE SCHEMA IF NOT EXISTS apps_<slug>` + RLS boilerplate on both `main` and `dev` branches of the **shared Supply Supabase project**.
- **NEVER deletes anything.** Only `CREATE` and `ALTER` statements are allowed — no `DROP TABLE`, `DROP SCHEMA`, or destructive operations, ever.
- **Never** creates a new Supabase project — this is always the same DB as Supply.

If `SUPABASE_ACCESS_TOKEN` is not set, skip this step and flag it in the PR body with instructions for the PM to create the schema manually.

## Step 7 — Commit + push + open PR

```bash
git add -A
git commit -m "spawn: new app <SLUG>"
git push -u origin spawner/new-app-<SLUG>

gh pr create \
  --base dev \
  --head spawner/new-app-<SLUG> \
  --title "spawn: new app <SLUG>" \
  --reviewer <OWNER> \
  --label spawner --label needs-product-review \
  --body-file .spawn/pr-body.md
```

The skill writes `.spawn/pr-body.md` with:

- **What this adds** — one-line summary: "New internal app `<DISPLAY>` at `/<SLUG>` in the Supply deployment."
- **Provisioning status table** — Supabase schema: `done` / `skipped: <reason>`.
- **Local dev instructions**: `npm run dev` at repo root, then visit `http://localhost:3000/<SLUG>`.
- **After merge**: the app is live at `/<SLUG>` on the next Supply deployment — no additional Vercel or Auth0 setup needed.

## Step 8 — Final message to the PM

Print:

1. The PR URL.
2. Local dev steps: `npm run dev` → `http://localhost:3000/<SLUG>`.
3. Reminder: `@product` approval is required before merge; reviewer `<OWNER>` is also assigned.
4. If the Supabase schema step was skipped, one-line instructions on how to create it manually.

---

## Guard rails

- **Never delete files on failure.** Leave the branch with partial changes so the PM (or Cursor in a follow-up session) can debug.
- **Never commit** if `rewrite.mjs` exits non-zero.
- **Never auto-stash.**
- **Never create a separate Vercel project** — this skill intentionally does not provision one. The app runs inside the existing Supply deployment.
- **Never touch** anything outside `app/(apps)/<slug>/` — all spawned apps live as route groups in the main Next.js deployment.
