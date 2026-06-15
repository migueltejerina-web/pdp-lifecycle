# AGENTS.md — PDP Lifecycle

Operational guide for AI agents. Product context: `CLAUDE.md`.

## Scaffold

Generated from `vistral_supply` via `scripts/scaffold-vistral-product.mjs`. See `scripts/scaffold/README.md`.

## Local run

```bash
npm install
npm run dev
```

Open http://localhost:3005 — demo mode works without `.env.local`.

## Protected zones

- `app/prophero.css` — design tokens
- `lib/auth/**` — change only when implementing real auth flows
- `supabase/migrations/**` — add new files only; never edit shipped migrations
- **`.env.local`** — never delete or overwrite. Do not run `vercel link` or `vercel env pull` unless the user explicitly asks to restore env. See `.cursor/rules/22-env-local.mdc`.

## Cursor workspace

Open the **`pdp-lifecycle`** folder as the workspace root so rules and skills load correctly.
