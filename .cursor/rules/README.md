# Cursor Rules - Vistral Lab

Rules and skills for the PDP Lifecycle project, optimized for PM vibe-coding with GSD execution.

## Rules (`.cursor/rules/`)

8 files. 1 always-on core + 7 glob-triggered.

| File | Trigger | Content |
|------|---------|---------|
| `00-core.mdc` | **Always on** | Security guardrails, protected zones, planning mandate, domain boundaries |
| `01-design-system.mdc` | components/**, *.css | Vistral DS components, tokens, grid, component patterns |
| `02-supabase.mdc` | lib/supabase/**, app/api/** | Client patterns, types, migrations, demo mode |
| `03-auth-permissions.mdc` | lib/auth/**, page.tsx | Two-layer auth, roles, permission functions |
| `04-forms-ui.mdc` | *form*.tsx, components/ui/** | react-hook-form + Zod, form components |
| `05-api-routes.mdc` | app/api/** | Route structure, auth verification, response format |
| `06-error-handling.mdc` | *.ts, *.tsx | try/catch mandate, toast feedback, contextual logging |
| `07-testing.mdc` | *.test.ts, *.spec.ts | Vitest patterns, what to test, mocking |
| `13-financial-numbers.mdc` | *financial*.{ts,tsx}, *profitability*.{ts,tsx} | Excel-like rules — full precision storage, 2 dp render, residual on last unit |

## Skills (`.cursor/skills/`)

Invoked on demand, not always loaded.

### Party Modes (from PM framework)

| Skill | Activation | Purpose |
|-------|-----------|---------|
| `hyperfocus/` | "HYPERFOCUS MODE: [goal]" | Single-goal focus with strict scope |
| `maestro/` | "MAESTRO MODE: [workflow]" | Multi-step orchestration with checkpoints |
| `creative-intelligence/` | "CREATIVE INTELLIGENCE: [topic]" | Problem space exploration, tradeoff analysis |
| `rapid-prototyping/` | "RAPID PROTOTYPE: [hypothesis]" | Throwaway prototypes for validation |
| `execute-user-story/` | "PARTY MODE: Execute User Story" | Atomic commits from acceptance criteria |
| `incremental-changes/` | "PARTY MODE: Incremental Changes" | Step-by-step changes with approval |
| `code-reference/` | "PARTY MODE: Code Reference" | Extract types/interfaces for docs |

### Development Skills

| Skill | Activation | Purpose |
|-------|-----------|---------|
| `feature-development/` | "SKILL: Feature Development" | End-to-end feature workflow (12 steps) |
| `figma-to-code/` | "SKILL: Figma to Code" | Figma design to production code |
| `form-creation/` | "SKILL: Form Creation" | Complete form with validation + Supabase |
| `post-change-checks/` | "SKILL: Post-Change Checks" | Pre-commit verification checklist |
| `create-pr/` | "create a PR" | Branch, commit, push, open PR |
| `deployment-safety/` | "ready to deploy" | Pre-deploy checklist + rollback |
| `mcp-guide/` | MCP questions | MCP integration reference |

## GSD Integration

Party Modes hand off to GSD for execution:
- `execute-user-story` and `maestro` reference `/gsd-quick`, `/gsd-execute-phase`, `/gsd-debug`
- GSD skills live at user level (`~/.claude/skills/`), not committed to the repo

## Architecture Decision

**Why this structure (not the ClickUp mega-rule):**
- Always-on core: 1,514 bytes (was 22,636 bytes across 5 always-on files)
- Total rules: 10,518 bytes (was 66,035 bytes across 14 files)
- Skills load only when invoked, saving tokens on every request
- CLAUDE.md carries stack/conventions/architecture context (no duplication)
