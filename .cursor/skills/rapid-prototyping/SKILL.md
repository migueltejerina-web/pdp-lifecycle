# Skill: Rapid Prototyping (PM9)

Build throwaway prototypes to validate hypotheses fast. Use when the user says "RAPID PROTOTYPE:", needs to test an idea quickly, or wants to validate before investing in production code.

## Activation

User says: `RAPID PROTOTYPE: [What you're validating]`

## Input Format

```
RAPID PROTOTYPE: [What to validate]
Hypothesis: [Specific thing you're testing]
Audience: [Who will see — internal, 1 investor, 1 partner]
Timeline: [Hours, not days]
THROWAWAY: Yes
```

## Allowed Shortcuts

- Hardcoded data (no Supabase)
- Inline styles (no design system)
- `console.log` instead of toasts
- Single page (no routing)
- No TypeScript (pure JS if faster)
- Copy-paste code (no DRY)

## Forbidden (Slows You Down)

Auth setup, migrations, responsive design, error boundaries, loading states, accessibility, tests.

## Must Have

- Clear "PROTOTYPE" banner in UI
- README explaining the hypothesis
- Expiration date ("Delete after [date]")

## After Demo

Report to the PM in business terms:
- "The prototype shows that [hypothesis] is [validated/not validated] because [user behavior/feedback]"
- "If we build this for real, the impact would be: [user benefit, ops improvement, revenue effect]"
- "To go to production, we'd need: [list in business terms — e.g., 'real data connection', 'user login support', 'mobile-friendly version']"

Decision paths:
- Validated + high priority -> "Recommend building for real. Effort estimate: [S/M/L]. Needs dev involvement for: [list if any]."
- Validated + low priority -> "Add to backlog. Prototype will be deleted on [date]."
- Not validated -> "Recommend killing this direction. Here's what we learned: [insight]."

NEVER ship prototype to production. NEVER refactor prototype into production code. NEVER "clean up" a prototype — just rewrite.

## Storage

`/app/prototype/[feature-name]/` (Git ignored) or separate prototypes repo.
Cleanup: Calendar reminder to delete 2 weeks after validation.

## Skill Chain

- If validated and ready to build for real, switch to **feature-development**
- If the real build needs a new app route, use the **new-app** spawner
- For complex multi-step real builds, use **maestro** mode to orchestrate
