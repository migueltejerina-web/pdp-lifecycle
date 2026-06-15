---
name: create-pr
description: Create a new branch, commit staged changes, push, and open a pull request with a structured PR description. Use when the user wants to create a branch and PR, ship work to GitHub, open a pull request, push changes for review, or says "create a PR", "make a branch", "ship this", or "open a PR".
---

# Create PR

Creates a branch from current work, pushes it, and opens a PR using a structured template populated from git diff context.

## When to Use

- User says "create a PR", "make a branch and PR", "ship this", "open a PR for this"
- Work is done locally and needs to go to GitHub for review
- After completing a feature, fix, or chore

## Process

### Step 0 — Detect mode: new PR vs push to existing PR

```bash
git branch --show-current
gh pr view --json number,url,state 2>/dev/null || echo "NO_PR"
```

**If the current branch already has an open PR** (output contains `"state":"OPEN"`):
- Switch to **push-to-existing-PR mode**. Skip Steps 1–7 entirely.
- Run:
  ```bash
  git fetch origin
  git rebase origin/dev
  ```
  If rebase conflicts: stop, list conflicting files, tell the user to resolve manually and run `git rebase --continue`.
- If there are uncommitted changes, stage and commit them:
  ```bash
  git add -A
  git commit -m "<message>"
  ```
  Suggest a commit message based on the diff. Ask the user to confirm or change it.
- Push:
  ```bash
  git push
  ```
- Report:
  ```
  ✓ Changes pushed to existing PR
  ✓ Branch: <branch-name>
  ✓ PR: <url>

  The PR has been updated with your latest commits.
  CI will re-run automatically.
  ```
- Stop here. Do not open a new PR.

**If the current branch has NO open PR** (output is `NO_PR` or state is not `OPEN`): continue to Step 1.

### Step 1 — Check prerequisites

```bash
# Verify gh CLI is available and authenticated
which gh && gh auth status 2>&1

# Check current branch and remote
git branch --show-current
git remote -v | head -2

# Check for uncommitted changes
git status --short

# Check for PR template
ls .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null && echo "template found" || echo "no template"
```

If `gh` is not found or not authenticated:
- Do **not** stop the skill. Continue with the full flow (branch, commit, push, PR description generation).
- Set a flag `GH_UNAVAILABLE=true` — this changes the behavior of Steps 7 and 8.

If already on `main` or `master`: stop with a hard error — "You are on `main`. Never create a feature branch from `main`. Switch to `dev` first or use the **start-feature** skill."

**Sync with origin/dev (MANDATORY — run before creating any branch):**

```bash
git fetch origin
git checkout dev
git rebase origin/dev
```

If `git rebase` reports conflicts:
- Stop immediately. Do not continue.
- Run `git status` and list all conflicting files.
- Tell the user: "There are conflicts between local `dev` and `origin/dev`. Resolve them manually, then run `git rebase --continue` and restart this skill."

If rebase succeeds: confirm "Local `dev` is up to date with `origin/dev`." and continue.

**Branch name validation (enforce after Step 2):**

After the user confirms the branch name, verify it starts with one of:
- `feat/` — new feature
- `fix/` — bug fix
- `chore/` — config, tooling, dependencies
- `hotfix/` — urgent production fix

If the name does NOT match: reject it, show the correct format, and ask for a new name. Do not create the branch until the format is valid.

**PR template detection (do this now, use result in Step 6):**
- If `.github/PULL_REQUEST_TEMPLATE.md` exists → read it and store as `PROJECT_TEMPLATE`. All PR body generation in Step 6 must follow this template's sections and order exactly.
- If no template exists → use the dual-audience fallback structure defined in Step 6.

### Step 1.5 — Migration collision check (run if any migration file is staged or changed)

**Detect whether this PR includes any migration files:**

```bash
git diff dev...HEAD --name-only 2>/dev/null | grep "^supabase/migrations/" || echo "NO_MIGRATIONS"
```

If output is `NO_MIGRATIONS` — skip this step entirely and continue to Step 2.

If one or more migration files are present, run the collision check:

```bash
for f in supabase/migrations/*.sql; do basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'; done | sort | uniq -d
```

**Interpret the result:**

- **Empty output** → no collisions. Print: `✓ No migration version collisions detected.` and continue.
- **Non-empty output** → one or more version keys are duplicated. **STOP. Do not create the PR.**

When a collision is found, output a clear error block:

```
⛔ Migration version collision detected — PR blocked

Colliding version key(s): <list output>

Two or more migration files resolve to the same version key.
The Supabase CLI will reject the deployment with:
  "Remote migration versions not found in local migrations directory."

Fix required before opening a PR:
1. Identify which file on this branch introduced the collision:
     git diff dev...HEAD --name-only | grep "^supabase/migrations/"
2. Rename the colliding file to use a unique 14-digit timestamp (YYYYMMDDHHmmSS):
     git mv supabase/migrations/<old_name>.sql supabase/migrations/<new_name>.sql
3. Stage the rename: git add -A
4. Re-run the collision check to confirm it's clean, then restart this skill.

Naming rule: YYYYMMDDHHmmSS_description.sql (14 digits, no underscore between date and time).
```

Also check that every migration file on this branch follows the `YYYYMMDDHHmmSS_` format:

```bash
git diff dev...HEAD --name-only 2>/dev/null | grep "^supabase/migrations/" | while read f; do
  base=$(basename "$f")
  if ! echo "$base" | grep -qE '^[0-9]{14}_'; then
    echo "BAD_FORMAT: $base"
  fi
done
```

If any `BAD_FORMAT` lines appear, stop and tell the user:

```
⛔ Migration filename format error — PR blocked

File(s) with invalid name format:
  <list of BAD_FORMAT files>

Required format: YYYYMMDDHHmmSS_description.sql  (14-digit prefix, seconds precision)
Bad formats that cause version key collisions:
  - YYYYMMDD_HHMM_  (inner underscore — version key stops at first underscore)
  - YYYYMMDDHHMM_   (12 digits — superseded, still causes collisions if two exist on same date)

Rename the file(s), stage the rename, then restart this skill.
```

**Check 3 — Prefix overlap between 12-digit and 14-digit version keys:**

```bash
for f in supabase/migrations/*.sql; do basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'; done | sort | while read v; do
  if [ ${#v} -eq 12 ]; then
    grep -q "^${v}" <<< "$(for f2 in supabase/migrations/*.sql; do basename "$f2" | sed -E 's/^([0-9]+)_.*/\1/'; done | grep -v "^${v}$")" && echo "PREFIX_OVERLAP: ${v}"
  fi
done
```

If any `PREFIX_OVERLAP` lines appear:

```
⛔ Migration version prefix overlap detected — PR blocked

A 12-digit version key shares its prefix with a 14-digit key.
The Supabase CLI cannot resolve the 12-digit file when the 14-digit file
exists, blocking ALL db push operations with:
  "Remote migration versions not found in local migrations directory."

Fix: rename the 12-digit file to a unique 14-digit timestamp (YYYYMMDDHHmmSS_),
then run `supabase migration repair` on staging and prod to update schema_migrations.
See .cursor/skills/fix-blocked-migration/SKILL.md (Root cause E).
```

Only continue to Step 2 if all three checks pass.

### Step 2 — Determine branch name

If user provided a branch name in their message, use it directly.

Otherwise, look at the staged/unstaged changes and suggest a name:
- `feat/` prefix for new features
- `fix/` prefix for bug fixes
- `chore/` prefix for config, tooling, dependencies

Ask the user to confirm or change the suggested name:
```
Suggested branch: feat/your-feature-name
Enter to confirm or type a different name:
```

Branch naming convention: `feat/kebab-description`, `fix/kebab-description`, `chore/kebab-description`

### Step 3 — Create branch and commit

```bash
# Create and switch to new branch
git checkout -b <branch-name>

# If there are uncommitted changes, stage and commit them
# First check what's unstaged
git status --short
```

If there are uncommitted changes:
- Ask for a commit message, OR suggest one based on the diff (use `git diff --stat` to understand what changed)
- Stage all relevant changes: `git add -A` (or let user specify files)
- Commit: `git commit -m "<message>"`

If working tree is clean (changes already committed on current branch):
- Just checkout the new branch from here — commits are already present

### Step 4 — Push branch

**Rebase onto latest origin/dev before pushing:**

```bash
git fetch origin
git rebase origin/dev
```

If `git rebase` reports conflicts:
- Stop immediately. Do not push.
- Run `git status` and list all conflicting files.
- Tell the user: "There are conflicts with the latest `dev`. Resolve them manually, run `git rebase --continue`, then retry the push."

**Validate commit message format:**

Check the most recent commit message:
```bash
git log -1 --format="%s"
```

The message MUST start with one of these conventional commit prefixes:
- `feat:` or `feat(scope):` — new feature
- `fix:` or `fix(scope):` — bug fix
- `refactor:` or `refactor(scope):` — refactoring
- `chore:` or `chore(scope):` — maintenance
- `style:` or `style(scope):` — visual/formatting
- `test:` or `test(scope):` — tests
- `docs:` or `docs(scope):` — documentation

If the message does NOT match:
- Show the current message to the user.
- Suggest a corrected version following the format.
- Ask for confirmation before amending: `git commit --amend -m "<corrected message>"`
- Do not push until the message is valid or the user explicitly approves the current message.

**Then push:**

```bash
git push --set-upstream origin <branch-name>
```

### Step 5 — Gather PR context from the user

Ask these questions (skip any the user already provided):

1. **ClickUp task ID:** "What's the ClickUp task ID? (format: CU-xxxxxxxx, or skip)"
2. **User flow:** "Do you need a User Flow section describing how users interact with this change? (skip if not applicable)"
3. **Media:** "Any screenshot or video to include? (drop a link or skip)"

Fill answers into the PR body. Use "N/A" for skipped items.

### Step 6 — Generate PR description

Read the diff to understand what changed:

```bash
git log dev..HEAD --oneline 2>/dev/null || git log HEAD~5..HEAD --oneline
git diff dev...HEAD --stat 2>/dev/null || git diff HEAD~1 --stat
git diff dev...HEAD 2>/dev/null || git diff HEAD~1
```

**Template resolution (use the result from Step 1):**

**If `PROJECT_TEMPLATE` was found (`.github/PULL_REQUEST_TEMPLATE.md` exists):**
- Use the template's sections as-is — do not add, remove, or reorder sections.
- Replace every HTML comment placeholder (`<!-- … -->`) with real content derived from the git diff.
- Fill every checklist item — check `[x]` when confirmed safe/done, leave `[ ]` when it requires human verification.
- Keep all section headers, icons, and dividers exactly as they appear in the template.
- Populate every section — never leave a placeholder empty. If a section genuinely doesn't apply (e.g. "Database changes" when there are none), write "None." instead of leaving the comment.
- Ask the user for any section that requires human input and cannot be inferred from the diff (e.g. pros/cons business rationale, non-technical verification steps).

**If no template exists — use dual-audience fallback:**

Create `.github/PULL_REQUEST_TEMPLATE.md` with the structure below before opening the PR.

```markdown
## 🔗 ClickUp Task

<!-- Paste the ClickUp task ID. Format: CU-xxxxxxxx -->

## 📋 For the Team (PM Review)

### What changed (in plain language)

<!-- What the user/team will notice. No file names, no code terms. -->

### Why

<!-- What problem does this solve? Who benefits? -->

### Impact

- **Who is affected:**
- **What changes in their experience:**
- **Risk level:** Low / Medium / High

### Pros & Cons

| | Pro | Con |
|---|---|---|
| 1 | | |
| 2 | | |

### How to verify (non-technical)

- [ ] Go to [page/feature]
- [ ] Do [action]
- [ ] Expect [result]

---

## 🔧 Technical Details (Dev)

### Changes

- 

### Architecture decisions

### Database / Auth / Infra changes

### Security & data

- [ ] No secrets or credentials added to code
- [ ] No new `NEXT_PUBLIC_` variables exposing server-only values
- [ ] User input validated
- [ ] API route verifies auth if touching server data

### How to test (technical)

- [ ] `npm run build` passes
- [ ] `npm run lint` passes
- [ ] No leftover `console.log` in changed files
- [ ] Tested in browser on the affected flow

### Rollback plan
```

When generating the PR description:
- Fill the PM section FIRST using business language inferred from the diff
- Fill the technical section with file-level details, architecture notes, and the standard checklist
- Always fill the rollback plan (e.g., "Revert PR — no migration" or "Needs migration rollback — dev required")

Populate every section from git context — don't leave placeholders empty.

Save the final filled description to `PR_DESCRIPTION.md` in the project root.

### Step 7 — Create the PR

**If `GH_UNAVAILABLE=false` (gh is installed and authenticated):**

```bash
gh pr create \
  --title "<title>" \
  --body-file PR_DESCRIPTION.md \
  --base dev
```

Title format: `type(scope): description` — e.g., `feat(supply): add property filter by status`

**If `GH_UNAVAILABLE=true` (gh not installed or not authenticated):**

Skip the `gh pr create` command. Instead:

1. Derive the suggested PR title from the branch name and diff context using the conventional commit format: `type(scope): description`.
2. Display the title and the full PR description to the user so they can create the PR manually on GitHub:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  PR READY TO CREATE MANUALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Suggested title (paste this into GitHub):
  feat(scope): your description here

  Branch pushed to:  origin/<branch-name>
  Base branch:       dev

  PR description has been saved to PR_DESCRIPTION.md
  → Copy its contents into the GitHub PR body.

  Open a PR at:
  https://github.com/<owner>/<repo>/compare/dev...<branch-name>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

To find the correct GitHub URL, run:
```bash
git remote get-url origin
```

Replace `git@github.com:owner/repo.git` or `https://github.com/owner/repo.git` with the compare URL above.

To install `gh` and create PRs automatically in the future: https://cli.github.com

### Step 8 — Report

**If `GH_UNAVAILABLE=false`:**

```
✓ Branch: <branch-name>
✓ Pushed to origin
✓ PR #<number> created: <url>

Next steps:
- Review the diff: <url>/files
- CI must pass before merge (lint → type-check → build)
- At least 1 approval required
```

**If `GH_UNAVAILABLE=true`:**

```
✓ Branch: <branch-name>
✓ Pushed to origin
✓ PR_DESCRIPTION.md generated and ready

Action required:
- Open the PR manually using the link shown above
- Use the suggested title — you can adjust the scope/description
- Paste PR_DESCRIPTION.md contents into the GitHub PR body
- CI must pass before merge (lint → type-check → build)
- At least 1 approval required

Tip: install gh CLI (https://cli.github.com) to automate this step next time
```

## Notes

- Base branch is always `dev` unless the user specifies otherwise — only release PRs target `main` (`dev → main`)
- **Release PRs (`dev → main`) MUST be merged with "Create a merge commit" — NEVER squash.** This preserves shared SHAs and prevents phantom divergence. See `.cursor/rules/08-pr-standards.mdc` for the full rationale.
- If the PR template file doesn't exist yet, create `.github/PULL_REQUEST_TEMPLATE.md` with the dual-audience fallback structure (Step 6) before opening the PR — it will be available for future PRs automatically
- Never push directly to `main` — always create a branch
- If `gh pr create` fails because the branch has no commits ahead of dev, tell the user: "Branch has no new commits vs dev — make your changes first"

## Skill Chain

- Run **post-change-checks** before creating the PR
- After PR is created, consider **deployment-safety** for the merge/deploy flow
- This skill replaces the standalone `generate-pr-description` skill — all PR description generation is handled in Step 6
