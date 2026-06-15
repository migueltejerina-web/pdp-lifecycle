---
name: post-change-checks
description: Run all required checks after code changes before committing — TypeScript, build, tests, visual, and Supabase verification
---

# Post-Change Checks (Vibe Coding Edition)

## When to Use This Skill

Use this skill when:

- You finished a feature or bugfix and are about to commit
- You made significant code changes
- Before making a PR or deploy
- You want to verify nothing broke

## Prerequisites

Have changes ready in the working directory (they don't need to be staged).

---

## Step 0 — Sync with origin/dev

Before running any checks, ensure your branch is rebased on the latest `dev`:

```bash
git fetch origin
git rebase origin/dev
```

If `git rebase` reports conflicts:
- Stop immediately. Do not run any checks.
- List the conflicting files (`git status`).
- Tell the user: "There are conflicts with `origin/dev`. Resolve them manually, run `git rebase --continue`, then re-run post-change-checks."

If rebase succeeds: confirm "Branch is up to date with `origin/dev`." and continue.

---

## Step 1 — TypeScript Check

**Prompt:**

```markdown
"Run TypeScript check without compiling:
npx tsc --noEmit

Show me all errors if there are any.
For each error:
1. File and line
2. Error description
3. Proposed fix

If no errors, confirm 'TypeScript: no errors'"
```

**Common errors and fixes:**

```markdown
# Error: Property 'X' does not exist on type 'Y'
-> Verify the type includes the property
-> May need to regenerate Supabase types

# Error: Type 'string | undefined' is not assignable to type 'string'
-> Add null check: if (!value) return
-> Or use: value ?? 'defaultValue'

# Error: Cannot find module '@/...'
-> Verify the file exists
-> Verify tsconfig paths
```

---

## Step 2 — Build Check

**Prompt:**

```markdown
"Run the production build:
npm run build

If there are errors:
1. Show me the complete error
2. Identify the cause (TypeScript, missing import, env var, etc.)
3. Fix and re-run build

If build passes, confirm 'Build: successful'"
```

**Common errors:**

```markdown
# Module not found
-> npm install (missing dependency)
-> Verify import path is correct (case-sensitive on Linux)

# Cannot find module '@/components/ui/Button' (uppercase)
-> On Linux it's case-sensitive: must be 'button' (lowercase)
-> Fix all imports

# Invalid environment variable
-> Add the missing variable in .env.local
-> Add to .env.local.example to document
```

---

## Step 3 — Tests

**Prompt:**

```markdown
"Run the tests:
npm run test

If there are failing tests:
1. Show me which tests fail
2. Error for each one
3. Proposed fix (broken code or outdated test?)

If all pass, confirm 'Tests: [N] passing, 0 failing'"
```

**What to do if a test fails:**

```markdown
# Test assertion fails -> code changed behavior
-> Check if the change is intentional
-> If yes: update the test to reflect new behavior
-> If no: revert the code

# Mock error -> interface of something being mocked changed
-> Update the mock with the new interface

# Import error -> a file was moved/renamed
-> Update import in the test file
```

---

## Step 4 — Console.log Cleanup

**Prompt:**

```markdown
"Search for console.log in the code I just modified.

Modified files: [list of files or 'all staged files']

For each console.log found:
1. Show me the file and line
2. Is it intentional (temp debug) or should it be console.error?
3. Propose whether to remove it or convert to console.error

Allowed exceptions:
- console.error with context in brackets: [Feature Error]:
- console.warn for deprecation warnings

Confirm 'Console.logs: clean' if there are none"
```

---

## Step 5 — Visual Verification with Browser MCP

**Prompt:**

```markdown
"Use Browser MCP to visually verify the changes:

Changes made: [briefly describe what you changed]

1. Open localhost:3000/[main affected route]
2. Screenshot of current state
3. Verify that:
   - The UI looks correct
   - No broken layouts
   - No cut or overlapping text
   - Buttons/links work

4. If there are affected interactions:
   - [action 1] -> screenshot result
   - [action 2] -> screenshot result

5. Verify on mobile (375px):
   - Screenshot
   - Does it look good on small screen?

Report: Visual OK or Problem in [description]"
```

---

## Step 6 — Supabase Check (if there were DB changes)

**Run ONLY if you modified schema, migrations, or queries.**

**Prompt:**

```markdown
"Verify database changes with Supabase MCP:

Changes made:
- [New table / New field / Modified RLS / New query]

Verify:
1. Migration ran correctly (no SQL errors)
2. Table/field exists with correct type
3. RLS policy is active and correctly configured
4. TypeScript types are updated (lib/supabase/types.ts)
   -> If not: run: supabase gen types typescript > lib/supabase/types.ts

Confirm 'Supabase: schema correct' or report gaps"
```

---

## Step 7 — Environment Variables Check (if you added new ones)

**Run ONLY if you added new environment variables.**

**Prompt:**

```markdown
"Verify that:

1. The new variable is in .env.local (local)
2. The variable is documented in .env.local.example
   -> With placeholder value, not the real one
   -> With comment explaining what it's for
3. If it's a public variable: has NEXT_PUBLIC_ prefix
4. If it's a private variable: does NOT have NEXT_PUBLIC_
5. The variable is configured in Vercel (production)
   -> Go to: Vercel Dashboard -> Settings -> Environment Variables

Confirm if everything is OK or what's missing."
```

---

## Step 8 — Commit Ready

**Prompt to generate commit message:**

```markdown
"Generate a commit message for these changes:

Modified files: [list or description]
What the change does: [brief description]

Required format:
- feat: for new features
- fix: for bug fixes
- refactor: for refactoring
- style: for visual changes
- test: for tests
- docs: for documentation
- chore: for maintenance tasks

Examples:
feat: add property timeline tab with history view
fix: correct RLS policy for supply_analyst role
refactor: extract PropertyCard to shared component"
```

---

## Quick Summary Checklist

After running all steps:

```markdown
"Give me a summary of all checks:

0. Sync with origin/dev: [rebased OK / conflicts found]
1. TypeScript: [pass/fail]
2. Build: [pass/fail]
3. Tests: [N passing, N failing]
4. Console.logs: [clean/N found]
5. Visual: [OK/issues]
6. Supabase: [OK/N/A/issues]
7. Env vars: [OK/N/A/issues]

If all pass -> ready to commit
If any fail -> list what needs fixing"
```

---

## When to Skip Steps

| Step | Skip if... |
| --- | --- |
| Tests | No test files exist yet |
| Supabase check | No DB changes made |
| Env vars check | No new variables added |
| Visual check | Changes are purely backend |
| Console cleanup | Only modifying tests |
