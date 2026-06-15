---
name: start-feature
description: Start a new development branch from an up-to-date dev. Always syncs with origin/dev, validates branch name format, and creates the branch. Use when starting any new feature, fix, chore, doc edit, or any code change — before writing any code.
---

# Start Feature

Initializes a new development branch correctly: syncs with `origin/dev`, validates the branch name, and creates the branch ready to work.

## When to Use

- User says "quiero empezar un feature", "iniciar desarrollo", "crear branch", "start feature", "nueva tarea", "empezar a trabajar en..."
- Before writing **any** code, fix, doc edit, config change, or chore — no matter how small
- Whenever a new development cycle begins
- Agent is about to edit files and is not already on a valid feature branch

## Step 0 — Check current branch first

```bash
git branch --show-current
```

**If already on a valid feature branch** (starts with `feat/`, `fix/`, `chore/`, or `hotfix/`):
- Skip Steps 1–4 entirely.
- Tell the user: "You're already on `<branch-name>`. Ready to develop — no new branch needed."
- Proceed directly to making changes.

**If on `dev` or `main`:** continue to Step 1.

**If on an unrecognized branch name** (doesn't match the required format):
- Warn the user: "Branch `<name>` doesn't follow the `feat/` / `fix/` / `chore/` / `hotfix/` format. Do you want to rename it or start fresh from `dev`?"
- Wait for user input before continuing.

## Process

### Step 1 — Sync with origin/dev

```bash
git fetch origin
git checkout dev
git rebase origin/dev
```

**If `git rebase` reports conflicts:**
- Stop immediately. Do NOT continue.
- List which files have conflicts (output of `git status`)
- Tell the user: "There are conflicts between your local `dev` and `origin/dev`. Resolve them manually, then run `git rebase --continue`. Come back when done."
- Do not proceed to Step 2.

**If rebase succeeds:** confirm "Local `dev` is up to date with `origin/dev`." and continue.

### Step 2 — Determine branch name

If the user provided a branch name in their message, use it directly (still validate in Step 3).

Otherwise, ask based on the task:
- What type of change? Feature / Bug fix / Chore / Hotfix
- Brief description in English (kebab-case)

Suggest a name following the format:
```
feat/short-kebab-description
fix/short-kebab-description
chore/short-kebab-description
hotfix/short-kebab-description
```

Examples:
- `feat/property-filter-by-date`
- `fix/kanban-partner-visibility`
- `chore/eslint-config-update`

### Step 3 — Validate branch name format

The branch name MUST start with one of these prefixes:
- `feat/` — new feature or user-visible capability
- `fix/` — bug fix
- `chore/` — config, tooling, dependencies, refactoring
- `hotfix/` — urgent production fix (rare, usually dev team only)

**If the name does NOT match this format:**
- Reject it. Do not create the branch.
- Tell the user: "Branch name `<name>` doesn't follow the required format. It must start with `feat/`, `fix/`, `chore/`, or `hotfix/`. Example: `feat/your-description`"
- Ask for a corrected name and repeat Step 3.

**If the name is valid:** confirm and continue.

### Step 4 — Create branch

```bash
git checkout -b <branch-name>
```

Verify the branch was created:
```bash
git branch --show-current
```

### Step 5 — Confirm to user

Report success:

```
Branch ready:

  Branch: <branch-name>
  Based on: origin/dev (up to date)
  Status: ready to develop

Next steps:
- Make your changes
- Run post-change-checks before committing
- Use create-pr to push and open the PR
```

## Notes

- Origin branch is always `dev` — never branch from `main`
- Never skip the rebase step, even if you think `dev` is already up to date
- If the user is already on a feature branch (not `dev` or `main`), warn them and ask if they want to start fresh from `dev` anyway
- The `hotfix/` prefix is reserved for urgent production fixes — if used, remind the user that hotfix PRs target `main`, not `dev`

## Skill Chain

- After development is done → run **post-change-checks**
- After checks pass → run **create-pr**
