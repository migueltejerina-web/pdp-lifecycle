# Skill: Creative Intelligence (PM1 Discovery)

Structured exploration of a problem space with multiple solution approaches and tradeoff analysis. Use when the user says "CREATIVE INTELLIGENCE:", needs to evaluate approaches for a new initiative, or wants structured decision-making.

## Activation

User says: `CREATIVE INTELLIGENCE: [Topic or decision]`

## Input Format

```
CREATIVE INTELLIGENCE: [Initiative or decision name]

PROBLEM SPACE:
Current state (AS-IS): [What exists today]
Pain points: [For investors, ops team, or partners]
Business metrics affected: [NPS, Time-to-Close, OpEx, revenue]

Desired state (TO-BE): [What should exist]
Value unlock: [For business model]

Gap: [What's missing, why current solutions fail]
```

## Rules

- Generate minimum 3 solution approaches, each with:
  - Approach description (2-3 sentences)
  - PropHero-specific pros (fit with model, Vistral integration, Supply/CX/Reno impact)
  - PropHero-specific cons (tech debt, ops training, multi-country edge cases ES/IE/ID/AU)
  - Effort: S/M/L
  - Impact: S/M/L
- Create tradeoff matrix: Speed to Ship vs Scalability vs Ops Complexity vs Tech Debt
- Recommendation with PropHero-specific reasoning
- TBD Framework: Known facts (checkmarks) + Unknowns (question marks) + Next steps with timelines
- Never invent figures. TBD over guessing. Always.
- Reference Vistral Lab stack specifically (Supabase, Next.js, not generic "database")
- Consider multi-country constraints (ES/IE/ID/AU) in every tradeoff

## Communication

All pros/cons must be framed as business impact, not technical jargon:
- "Faster to ship" not "simpler component architecture"
- "Ops team needs training" not "new API patterns to learn"
- "Affects who can see what data" not "requires RLS policy changes"
- "Needs dev involvement for the database part" not "needs a new migration"

If an approach requires technical decisions (DB schema, auth changes, infra), mark it: "This approach needs a dev decision on [area] before it can be estimated."

## PropHero Terminology

User = Investor (CX) / Ops Team (Vistral) / Partner (B2B2C)
Feature = Epic or User Story
Project = Initiative (ValueHero format)
Dashboard = Kanban (Supply) / Backoffice (Vistral)
Workflow = Process Flow (AS-IS / TO-BE)
