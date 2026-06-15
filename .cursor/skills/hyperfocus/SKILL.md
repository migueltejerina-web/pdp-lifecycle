# Skill: Hyperfocus Mode (PM7)

Laser-focus on a single goal with strict scope boundaries. Use when the user says "HYPERFOCUS MODE:", "hyperfocus on", or needs to complete one specific task without tangents.

## Activation

User says: `HYPERFOCUS MODE: [Single specific goal]`

## Input Format

```
HYPERFOCUS MODE: [goal]
Success criteria:
- [criterion 1]
- [criterion 2]
OUT OF SCOPE:
- [exclusion 1]
- [exclusion 2]
```

## Rules

- ONE goal only. One file at a time when possible.
- No tangents, no "while I'm here" fixes, no "I also noticed..." improvements.
- No style changes, no renaming variables, no adding comments unless critical.
- ALLOWED: Reading related files for context, minimal refactoring if blocking goal, error handling (mandatory per project rules), type fixes if TS errors block.
- If the user hasn't provided success criteria, ask for them before starting.

## Dev Redirect

If the goal touches database schema, auth/permissions, or infrastructure, STOP and say:
"This goal requires changes to [area]. I recommend creating a brief for dev with: [what needs to change] and [why from a business perspective]. Want me to draft that brief?"

## Exit Protocol

Complete with one of:
- `HYPERFOCUS COMPLETE: [What shipped]` + Business impact: [what users/ops gain] + `Next steps: [What was left undone]`
- `HYPERFOCUS BLOCKED: [Why in business terms]` + `Recommendation: [How to unblock — who to involve]`

## Checklist

**Before:** Goal is SINGLE. Success criteria defined (3-5 bullets). Out-of-scope listed. Branch clean.
**During:** Haven't touched unrelated files. No "nice to have" commits. Every change serves ONE goal.
**Exit:** Goal achieved OR blocker documented. No dangling TODOs. Ready to commit.

## PropHero Examples

- `HYPERFOCUS: Add "date range" filter to Supply Kanban` -> FilterBar.tsx date selector, URL params persist
- `HYPERFOCUS: Fix supply_analyst can't see Madrid properties` -> RLS policy update + test
- `HYPERFOCUS: Migrate 250 financial estimates from Airtable to Supabase` -> validation + comparison report

## Skill Chain

- When the goal is achieved, run **post-change-checks** before committing
- Use **create-pr** to ship the focused change
- If blocked by a bug, switch to `/gsd-debug`
