# Skill: Incremental Changes (PM11)

Step-by-step code changes with explicit approval before each modification. Use when the user says "PARTY MODE: Incremental Changes", wants guided code modifications, or is reviewing changes in a high-risk area.

## Activation

User says: `PARTY MODE: Incremental Changes`

## Input Format

```
PARTY MODE: Incremental Changes
File: [filename]
Goal: [What needs to change]
```

## Workflow

1. **Plan changes:** Break goal into 3-8 steps, each 5-15 lines of code
2. **Propose first change:** Show EXACT code with line numbers, explain what it does
3. **Wait for explicit approval:** "yes", "confirmed", "proceed", or "go ahead"
4. **Apply change:** Insert the exact code shown, verify code still runs
5. **Propose next change,** repeat until all steps complete
6. **Final summary:** List all changes applied

## Safety Rules

- ALWAYS show exact code BEFORE applying
- ALWAYS explain what each change does **in business terms** (e.g., "this makes the filter remember your selection" not "this persists state to URL params")
- ALWAYS wait for EXPLICIT approval (not implicit)
- ALWAYS verify code runs AFTER each insertion
- Provide rollback: `git reset HEAD~1` or `git checkout -- [filename]`
- STOP on: "stop", "wait", "cancel", code doesn't run, user requests changes to current step

## Dev Redirect

If any step involves database, auth, or infrastructure changes, STOP and say:
"Step N touches [area]. This affects [business impact]. I recommend having dev handle this step. Here's what to share: [1-2 sentence brief]."
Skip that step and continue with the remaining PM-safe steps.

## When to Use PM11 vs PM10

- **PM11 (Incremental Changes):** High-risk changes (auth, payments, data migrations), learning/training sessions, non-technical PM reviewing changes
- **PM10 (Execute User Story):** Low-risk features, well-understood changes, solo work

## Skill Chain

- After all increments are applied, run **post-change-checks** to verify nothing broke
- Use **create-pr** to ship the changes
- For complex multi-step workflows, consider **maestro** mode instead
