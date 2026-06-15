---
name: sync-prisma-schema
description: Update supabase/schema.prisma to reflect new migrations — run after creating any SQL migration file
---

# Sync Prisma Schema

## When to Use This Skill

Run this skill **every time you create a new migration** in `supabase/migrations/` that contains any of:

- `CREATE TABLE`
- `DROP TABLE`
- `ALTER TABLE ... ADD COLUMN`
- `ALTER TABLE ... DROP COLUMN`
- `ALTER TABLE ... RENAME COLUMN`
- `ALTER TABLE ... RENAME TO`
- `ALTER TYPE ... ADD VALUE`
- `ALTER COLUMN ... TYPE`

Skip it for migrations that only contain RLS policies, triggers, functions, indexes, or data backfills.

---

## Context

`supabase/schema.prisma` is NOT used at runtime — the app uses `@supabase/supabase-js`.
It exists for cross-repo diffs and ERD visualization.
Full process documented in `docs/how-to-update-prisma-schema.md`.

---

## Step 1 — Identify the Migration(s) to Apply

Read the `// Last updated:` comment at the top of `supabase/schema.prisma` to find the last applied migration.

Then list new migrations:

```bash
ls supabase/migrations/ | sort
```

For each migration file created after the last update, scan for DDL:

```bash
grep -i "CREATE TABLE\|DROP TABLE\|ALTER TABLE\|ALTER TYPE\|RENAME TO\|RENAME COLUMN\|ALTER COLUMN" \
  supabase/migrations/<filename>.sql
```

If no DDL found → skip this migration. If DDL found → continue to Step 2.

---

## Step 2 — Apply Changes to `supabase/schema.prisma`

For each DDL statement found, apply the corresponding Prisma change:

### CREATE TABLE → add a `model` block

```prisma
model my_new_table {
  // Added via YYYYMMDDHHNN_migration_name.sql
  id         String    @id @default(uuid()) @db.Uuid
  my_column  String
  created_at DateTime? @default(now()) @db.Timestamptz
}
```

Rules for new models:
- Use `@id @default(uuid()) @db.Uuid` for UUID PKs
- Use `@id` alone for text PKs (e.g. `key TEXT PRIMARY KEY`)
- Use `@id` with `@default(autoincrement())` for `bigserial` / `serial` PKs
- `NOT NULL` without a default → no `?` in Prisma
- `NOT NULL DEFAULT x` → keep no `?`, add `@default(x)`
- Nullable → add `?`
- `jsonb` → `Json`
- `timestamptz` → `DateTime @db.Timestamptz`
- `date` → `DateTime @db.Date`
- `numeric(p,s)` → `Decimal @db.Decimal(p, s)`
- `text[]` → `String[]`
- If the table has FK columns, add `@relation` fields and back-relations on referenced models

### DROP TABLE → remove the `model` block

Add a note to the file header `// Limitations` section:
```
// - `my_table` was dropped in migration YYYYMMDDHHNN_name.sql — excluded here.
```

Also remove any `@relation` back-references pointing to the dropped model.

### ADD COLUMN → add field to the existing model

```prisma
// Added via YYYYMMDDHHNN_migration_name.sql
new_field  String?
```

### DROP COLUMN → remove the field from the model

### RENAME COLUMN → rename the field (keep `@map("old_name")` if it has a legacy alias)

### RENAME TABLE → rename the `model` block, update all `@relation` references pointing to it

### ALTER TYPE ADD VALUE → add the value to the `enum` block

```prisma
enum my_enum {
  existing_value
  // Added via YYYYMMDDHHNN_migration_name.sql
  new_value
}
```

### ALTER COLUMN TYPE → update the Prisma type

---

## Step 3 — Add Inline Comments

Every field or model added from a migration must have a comment:

```prisma
// Added via 202605141610_add_lifted_kpi_columns.sql
total_investment_eur  Decimal?  @db.Decimal(14, 2)
```

For new models, add the comment on the first line inside the block.

---

## Step 4 — Update the File Header

At the top of `supabase/schema.prisma`, update:

1. `// Last updated:` — set to today's date and the last migration applied
2. `// Update log:` — add a new entry:

```
//   YYYY-MM-DD — applied migrations YYYYMMDDHHNN through YYYYMMDDHHNN_last_migration_name
```

---

## Step 5 — Verify

Do a quick sanity check:

- Every `@relation` field points to a model that exists in the file
- No model references a dropped table
- New enums are referenced only by models that use them
- `@@id`, `@@unique`, `@@index` composite attributes match the SQL constraints

---

## Quick Reference: SQL → Prisma Type Mapping

| SQL | Prisma |
|---|---|
| `uuid` | `String @db.Uuid` |
| `text` | `String` |
| `integer` / `int` | `Int` |
| `bigint` / `bigserial` | `Int` (use `BigInt` only if values exceed 2³¹) |
| `boolean` | `Boolean` |
| `timestamptz` | `DateTime @db.Timestamptz` |
| `date` | `DateTime @db.Date` |
| `numeric` / `numeric(p,s)` | `Decimal @db.Decimal(p, s)` |
| `float8` / `double precision` | `Float` |
| `jsonb` | `Json` |
| `text[]` | `String[]` |
| `vector` | `Unsupported("vector")` |
| Custom enum | `enum` block + use type by name |

---

## Example — Full Run

**New migration:** `202605200900_add_notes_to_projects.sql`

```sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS internal_notes text;
```

**Result in `schema.prisma`:**

```prisma
model projects {
  // ... existing fields ...
  // Added via 202605200900_add_notes_to_projects.sql
  internal_notes  String?
}
```

**Updated header:**
```
// Last updated: 2026-05-20 — applied migration 202605200900_add_notes_to_projects
```
