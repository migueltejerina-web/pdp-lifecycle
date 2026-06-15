# Skill: Execute User Story (PM10)

Execute a User Story through atomic commits following acceptance criteria. Use when the user says "PARTY MODE: Execute User Story", provides a ClickUp User Story link, or wants to implement a spec with disciplined commits.

## Activation

User says: `PARTY MODE: Execute User Story`

## Input Format

```
PARTY MODE: Execute User Story
User Story: [Link to ClickUp doc or paste acceptance criteria]
```

## Workflow

1. Read and parse ALL acceptance criteria (5-7 bullets)
2. Read technical specs (components, database tables, API endpoints)
3. Review UI mockup/description, note edge cases
4. Plan commits (3-8 typical), each = one atomic logical change
5. Execute each commit: implement change, verify it works, move to next
6. Final checklist: ALL criteria met, no console errors, follows existing patterns, ready for PR

## Commit Rules

Each commit MUST be:
- **Atomic:** One logical change per commit
- **Working:** Code runs after this commit
- **Descriptive:** Clear message, format `feat(domain): description`
- **Testable:** Can verify this change independently

MUST NOT: skip commits (no big bang), deviate from specs (no creative additions), commit broken code, leave commented-out code, add features not in acceptance criteria.

## GSD Integration

For implementation execution, this skill integrates with GSD:
- Use `/gsd-quick` for straightforward User Story implementation
- Use `/gsd-execute-phase` if the User Story is part of a planned GSD phase
- Use `/gsd-debug` if blockers are encountered during implementation

## Dev Redirect

Before step 4, scan the User Story for items requiring: database changes, new migrations, auth/permission changes, new API routes, or third-party integrations. For each, flag it:
"This story requires [change type]. This affects [business area — e.g., what users see, data access, deployment]. Recommend syncing with dev before I implement this part. Here's what to share with them: [1-2 sentence technical summary]."

## If User Story is Incomplete

ASK in business language: "What should the user be able to do when this is done?" "What does success look like?" "Which user roles are affected?"

## After Execution

Report in business terms:
- What was shipped (feature/behavior, not file names)
- Who benefits and how
- Any items flagged for dev review
- Risk assessment: what could go wrong, how easy to roll back

Create PR with: link to User Story doc, acceptance criteria checklist, screenshots if UI changes, review request.

## Skill Chain

- Run **post-change-checks** before committing final changes
- Use **create-pr** to open the PR with dual-audience description
- If the story includes forms, reference **form-creation** for patterns
- If the story includes new Supabase tables, reference **deployment-safety** for migration review
