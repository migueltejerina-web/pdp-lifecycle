# PDP Lifecycle

Greenfield Vistral Lab app — scaffolded from [vistral_supply](../vistral_supply) with Cursor rules, skills, UI kit, and Supabase-ready auth.

## Quick start

```bash
npm install
npm run dev
```

- **URL:** http://localhost:3005
- **Demo mode:** works with no `.env.local` (mock user `demo@pdp-lifecycle.local`)
- **Real Supabase:** copy `.env.local.example` → `.env.local` and fill staging credentials

## What's included

| Area | Location |
|------|----------|
| Cursor rules | `.cursor/rules/` |
| Cursor skills | `.cursor/skills/` |
| UI primitives | `components/ui/` |
| Design tokens | `app/prophero.css`, `app/globals.css` |
| Auth (2-layer pattern) | `lib/auth/` |
| Workspaces | `packages/*` (`@vistral/ui`, etc.) |

## What's not included

Supply, Reno, Proyecto, Settlement, B2B2C, client-viewer, or historical migrations.

## Regenerate scaffold

From `vistral_supply`:

```bash
node scripts/scaffold-vistral-product.mjs \
  --dest "../PDP_lifecycle" \
  --slug pdp-lifecycle \
  --title "PDP Lifecycle" \
  --port 3005 \
  --overlay greenfield \
  --force
```

See `scripts/scaffold/README.md` for details.
