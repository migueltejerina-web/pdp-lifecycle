## Project

**PDP Lifecycle** — new Vistral Lab product scaffolded from Vistral Supply.

**Stack:** Next.js 16 (App Router) + TypeScript + Supabase + Tailwind CSS 4 + Radix UI.

**Core value:** Same PM vibe-coding base (Cursor rules, skills, design system) without Supply/Reno/Settlement domain code.

### Constraints

- No domain kanbans or legacy Supply migrations in this repo.
- **Demo mode** when `NEXT_PUBLIC_SUPABASE_URL` is unset — safe local start with no credentials.
- Database changes only via `supabase/migrations/` (see `.cursor/rules/11-migrations.mdc`).

## Architecture

- `app/` — routes (home, login; add domains here)
- `components/ui/` — Vistral primitives
- `lib/` — config, Supabase, auth, i18n stub
- `packages/` — `@vistral/ui`, `auth`, `config`, `db`, `types` workspaces
- `.cursor/rules` + `.cursor/skills` — agent guardrails (copied from Supply)

## Conventions

See `.cursor/rules/*.mdc`. Design tokens: `app/prophero.css` (do not edit unless agreed).
