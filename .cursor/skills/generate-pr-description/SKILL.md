---
name: generate-pr-description
description: Generate a concise PR description in markdown for the commits in this branch. Detects and uses the project's PR template if one exists. Saves to PR_DESCRIPTION.md and outputs for copy-paste.
---

# Generate PR Description

Generates a PR description from the current branch's commits, using the project's PR template when available.

## Procedure

### Step 1 — Gather git context

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
git diff main...HEAD
```

Also check for a project PR template:

```bash
ls .github/PULL_REQUEST_TEMPLATE.md 2>/dev/null && echo "template found" || echo "no template"
```

Store the result as `PROJECT_TEMPLATE` for use in Step 3.

### Step 2 — Ask for User Flow

Ask the user:

> "Do you need a **User Flow** section describing how users interact with this change? If not, just say skip."

If the user says skip or it doesn't apply, omit the `### User Flow` section from the output.

### Step 3 — Generate the PR description

**If `PROJECT_TEMPLATE` was found (`.github/PULL_REQUEST_TEMPLATE.md` exists):**

- Read the template file.
- Use its sections as the structure — do not add, remove, or reorder sections.
- Replace every HTML comment placeholder (`<!-- … -->`) with real content derived from the git diff.
- Fill every checklist item — check `[x]` when confirmed safe/done, leave `[ ]` when it requires human verification.
- Keep all section headers, icons, and dividers exactly as they appear in the template.
- Never leave a placeholder empty. If a section doesn't apply (e.g. "Database changes" with no migrations), write "None." instead of leaving the comment.
- If the template doesn't have a User Flow section and the user requested one, append it before the technical details section.
- Ask the user for any section that cannot be inferred from the diff (e.g. ClickUp task ID, non-technical verification steps, pros/cons business rationale).

**If no template exists — use the fallback structure below:**

```markdown
## [Title - brief summary of the PR]

[One or two sentence overview of what this PR does]

### Changes

- **Key change 1**: Description
- **Key change 2**: Description
- **Key change 3**: Description

### User Flow

[Step-by-step description of how users interact with the new/modified features]

- Step 1: User action/interaction
- Step 2: System response/next action
- Step 3: Final outcome/result

### Technical Details

[Notable implementation details, bug fixes, architectural decisions, or important context]

### Ticket related

[ClickUp ticket link]

### Image/Video

[Attach image or video if applicable]
```

Omit `### User Flow` if the user said skip.
Omit `### Ticket related` if no ticket was provided.
Omit `### Image/Video` if not applicable.

### Step 4 — Ask for ticket and media

If the project template doesn't already have a ticket section, ask:

> "Do you have a ClickUp ticket link for this PR?"

> "Should we include an image or video? If yes, drop the link or note here."

Include their answers in the relevant sections.

### Step 5 — Save and output

- Save the final description to `PR_DESCRIPTION.md` in the project root.
- Output the full content directly (without code fences) for easy copy-paste to GitHub.

---

## After PR Description Is Generated

Once saved, ask the user:

> **"Do you want to generate QA test cases for product?"**

If the user says **yes**, read and follow the skill at `/qa-test-cases`.

Pass the following context forward so the skill can skip re-gathering it:

- **Branch changes**: the `git log`, `git diff --stat`, and `git diff` output from Step 1 — the skill should skip its Step 1.
- **Ticket info**: any ticket titles, descriptions, or ClickUp links collected above — the skill should skip that question.

Do **not** re-ask the user for information already collected in this session.
