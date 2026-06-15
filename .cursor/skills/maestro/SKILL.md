# Skill: Maestro Mode (PM8)

Orchestrate multi-step workflows with checkpoints. Use when the user says "MAESTRO MODE:", needs a multi-tool workflow, or wants step-by-step orchestration with rollback safety.

## Activation

User says: `MAESTRO MODE: [Multi-step workflow name]`

## Input Format

```
MAESTRO MODE: [workflow]
Steps (in order):
1. [Tool/action] -> [Expected outcome]
2. [Tool/action] -> [Expected outcome]
3. [Tool/action] -> [Expected outcome]
Success: All steps green
Failure: Stop at first red, surface blocker
```

## Rules

- Checkpoint after EVERY step: "Step N complete" (green) or "Step N blocked: [reason]" (red).
- Parallel execution ONLY when steps are truly independent.
- Rollback protocol: Document failure, undo destructive steps (DB changes, deploys), present blocker, wait for human decision.
- No side quests during orchestration. No "while I'm here" additions.
- Post-maestro: All green OR clear blocker documented. No dangling state.

## Dev Redirect

Before starting, scan the workflow for steps that touch: database schema, auth/permissions, infrastructure, or deployment config. Flag those steps as "Needs dev review" and suggest: "Steps N and M involve [technical area]. I recommend syncing with dev before those steps. Here's a summary to share: [business context + what changes]."

## Communication

At each checkpoint, report in business language:
- What was done (in user/feature terms, not file names)
- What it means for the product (who benefits, what changes)
- Risk level of next step (low/medium/high — high = dev review recommended)

## GSD Integration

When a Maestro workflow reaches an implementation step that involves writing code:
- For planned phase work, hand off to `/gsd-execute-phase`
- For quick implementation tasks, use `/gsd-quick`
- For debugging during orchestration, use `/gsd-debug`

## PropHero Workflows

**Initiative Launch:**
ClickUp MCP create doc > Cursor draft content > Review > ClickUp create Epics > Cursor User Stories > Notify

**Figma to Prod:**
Figma MCP extract > Cursor component+hook > Supabase MCP verify > Browser MCP screenshot > Compare > Error handling > Git commit > Vercel staging > Vercel production

**DB Schema Change:**
Supabase MCP tables+RLS > Cursor types+service+hook+page > Browser MCP test > Git > Deploy

## Skill Chain

- For individual implementation steps, use **feature-development** or **execute-user-story**
- Before shipping, run **post-change-checks** at each checkpoint
- Use **create-pr** to ship completed work
- Use **deployment-safety** for the deploy steps
- See **mcp-guide** for the full MCP reference and power combos
