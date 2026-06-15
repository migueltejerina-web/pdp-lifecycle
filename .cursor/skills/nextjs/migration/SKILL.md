---
name: nextjs/migration
description: Create a Supabase migration with RLS, search_path, and staging verification. Use when adding a new table, column, policy, or function to the database.
---

# Supabase Migration

Checklist for creating a safe database migration in this codebase.

## Before you write SQL

1. Check the highest existing migration timestamp: `ls supabase/migrations/ | sort | tail -5`
2. Name your file using the format **`YYYYMMDDHHmmSS_short_description.sql`** — 14 digits (seconds precision), no underscore between date and time.
   - Example: `20260508143000_add_contract_signed_at.sql`
   - The Supabase CLI version regex `^([0-9]+)_` stops at the first underscore. Any format with an inner underscore (e.g. `20260508_0930_*`) causes version collisions. The `YYYYMMDDHHmmSS_` format gives each migration a unique, second-level version key — even if two developers commit in the same minute.
3. Run **both** collision checks **immediately after creating the file** (before writing any SQL):
   ```bash
   # Check 1: exact duplicate version keys
   for f in supabase/migrations/*.sql; do basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'; done | sort | uniq -d
   # Check 2: prefix overlap (12-digit key is prefix of a 14-digit key)
   for f in supabase/migrations/*.sql; do basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'; done | sort | while read v; do
     if [ ${#v} -eq 12 ]; then
       grep -q "^${v}" <<< "$(for f2 in supabase/migrations/*.sql; do basename "$f2" | sed -E 's/^([0-9]+)_.*/\1/'; done | grep -v "^${v}$")" && echo "PREFIX_OVERLAP: ${v}"
     fi
   done
   ```
   If either check produces output, rename the new file to a different timestamp before continuing. The prefix overlap check catches a critical CLI bug where a 12-digit key (e.g. `202605191200`) and a 14-digit key sharing the same first 12 chars (e.g. `20260519120000`) make `supabase db push` fail with "Remote migration versions not found."
4. NEVER modify an existing migration — always create a new one

## Pre-Write Conflict Check (MANDATORY before writing any SQL)

Before writing the SQL for a new migration, the agent MUST inspect both the live database and prior migration files to detect conflicts. The inspection queries depend on what the migration will touch — the agent decides which checks to run based on the intent.

### How to decide what to check

| If the migration will… | Check in live DB | Check in prior migrations |
|---|---|---|
| Create a table | `SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename='my_table'` | `grep -r "CREATE TABLE.*my_table" supabase/migrations/` |
| Add a column | `SELECT column_name FROM information_schema.columns WHERE table_name='t' AND column_name='col'` | `grep -r "ADD COLUMN.*col" supabase/migrations/` |
| Add/replace a CHECK constraint | `SELECT pg_get_constraintdef(con.oid) FROM pg_constraint con JOIN pg_class r ON r.oid=con.conrelid WHERE r.relname='t' AND con.conname='constraint_name'` | `grep -r "constraint_name" supabase/migrations/` |
| Add enum value | `SELECT enumlabel FROM pg_enum WHERE enumtypid=(SELECT oid FROM pg_type WHERE typname='my_enum')` | `grep -r "ADD VALUE" supabase/migrations/` |
| Create/replace a function | `SELECT proname FROM pg_proc WHERE proname='my_fn'` | `grep -r "CREATE.*FUNCTION.*my_fn" supabase/migrations/` |
| Create a policy | `SELECT policyname FROM pg_policies WHERE tablename='t' AND policyname='my_policy'` | `grep -r "my_policy" supabase/migrations/` |
| Create an index | `SELECT indexname FROM pg_indexes WHERE tablename='t' AND indexname='my_idx'` | `grep -r "my_idx" supabase/migrations/` |

Run the live DB checks via the Supabase MCP (`execute_sql`, read-only SELECT only, against the staging project `jstxpfiutqmlrwhbyfjt`).

### What to do with the results

- **Object does not exist in DB or prior migrations** → safe to create. Use `IF NOT EXISTS` / `DROP … IF EXISTS` guards anyway for retry safety.
- **Object exists in DB but not in a migration file** → it was created manually. The migration must account for it (e.g. use `IF NOT EXISTS`, or drop-and-recreate safely).
- **Object exists in a prior migration already applied** → do NOT recreate it from scratch. Write an `ALTER` or additive statement instead.
- **Constraint or enum being replaced** → the new definition MUST include everything already live. Replacing a CHECK constraint with a partial list silently drops the omitted values. Always query the current definition first and extend it — never rewrite from memory.
- **Conflict found in an unapplied migration on another branch** → flag it. The two migrations may need to be sequenced or merged before either can land safely.

## Idempotency Rules (MANDATORY)

Every migration must be safe to re-read and must not break if the object already exists.
Use the safest available form for each statement type:

| Operation | Required form |
|---|---|
| Create table | `CREATE TABLE IF NOT EXISTS` |
| Add column | `ALTER TABLE t ADD COLUMN IF NOT EXISTS col type` |
| Create index | `CREATE INDEX IF NOT EXISTS` |
| Create policy | `DROP POLICY IF EXISTS "name" ON t; CREATE POLICY "name" ON t ...` |
| Drop constraint | `ALTER TABLE t DROP CONSTRAINT IF EXISTS name` |
| Add constraint | Drop first (above), then add |
| Add enum value | Wrap in `DO $$ BEGIN ALTER TYPE ... ADD VALUE ...; EXCEPTION WHEN duplicate_object THEN NULL; END $$` |
| Add role/check | Same as constraint: `DROP CONSTRAINT IF EXISTS`, then `ADD CONSTRAINT` |
| DELETE/UPDATE data | Wrap in a CTE or `WHERE EXISTS` guard so re-running is a no-op |

**Why this matters:** the Supabase CLI tracks applied migrations in `schema_migrations`. If a migration partially fails and is retried, non-idempotent statements throw errors that block all subsequent deployments. Idempotent migrations can be retried safely.

## Migration Template

```sql
-- ============================================
-- Migration: {description}
-- {date}
-- ============================================

-- 1. DDL changes — always IF NOT EXISTS
CREATE TABLE IF NOT EXISTS my_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL
);

-- Adding a column to an existing table
ALTER TABLE existing_table ADD COLUMN IF NOT EXISTS new_col TEXT;

-- 2. REQUIRED: Enable RLS on every new table
ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

-- 3. REQUIRED: Policies — always DROP IF EXISTS first so re-runs are clean
DROP POLICY IF EXISTS "Users can view own records" ON my_table;
CREATE POLICY "Users can view own records"
  ON my_table
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role IN ('supply_admin', 'supply_lead')
    )
  );

DROP POLICY IF EXISTS "Users can insert own records" ON my_table;
CREATE POLICY "Users can insert own records"
  ON my_table
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 4. Indexes — always IF NOT EXISTS
CREATE INDEX IF NOT EXISTS idx_my_table_user_id ON my_table(user_id);
CREATE INDEX IF NOT EXISTS idx_my_table_created_at ON my_table(created_at DESC);

-- 5. Constraints — drop first, then add (idempotent pattern)
ALTER TABLE my_table DROP CONSTRAINT IF EXISTS my_table_name_check;
ALTER TABLE my_table ADD CONSTRAINT my_table_name_check CHECK (char_length(name) > 0);

-- 6. Enum values — guard against duplicate_object
DO $$
BEGIN
  ALTER TYPE my_enum ADD VALUE 'new_value';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END$$;

-- 7. Data mutations — guard so re-run is a no-op
UPDATE my_table SET status = 'active' WHERE status IS NULL AND created_at < '2026-01-01';
-- For DELETE, use a CTE to make intent explicit and auditable:
-- DELETE FROM my_table WHERE id IN (SELECT id FROM my_table WHERE condition);
```

## Functions — Require search_path

Any `SECURITY DEFINER` function MUST set `search_path`:

```sql
CREATE OR REPLACE FUNCTION my_function(p_user_id UUID)
RETURNS TABLE(id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- REQUIRED: prevents schema injection
AS $$
BEGIN
  RETURN QUERY
    SELECT t.id, t.name
    FROM my_table t
    WHERE t.user_id = p_user_id;
END;
$$;
```

## Real codebase reference

`supabase/migrations/018_update_properties_rls.sql` — shows the full pattern: DROP old policies → CREATE new policies with role-based USING clauses → trigger for auto-setting created_by.

`supabase/migrations/040_fix_user_roles_rls_recursion.sql` — shows how to fix RLS recursion when policies reference user_roles.

## Staging Verification Checklist

> **Current state (May 2026):** Supabase Branches is configured on `kqqobbxjyrdputngvxrf` ("vistral-dev") but the `dev` branch has `MIGRATIONS_FAILED`. Migrations are **not** auto-applying. A dev senior must apply them manually after merging: `supabase link --project-ref dryxwoffrfrtgavcrrgz && supabase db push --include-all`.

Before merging a migration PR, verify it will apply cleanly:

- [ ] Migration file committed on a feature branch and PR open to `dev` (never applied directly via MCP or terminal)
- [ ] Collision check passed: exact duplicates (`uniq -d`) AND prefix overlap check → both empty
- [ ] SQL is idempotent (uses `IF NOT EXISTS`, `DROP … IF EXISTS`, etc.)
- [ ] RLS enabled on any new table with at least one policy

After the dev senior applies the migration, verify:

- [ ] Via MCP: `SELECT column_name FROM information_schema.columns WHERE table_name='...' AND column_name='...'` returns the new column
- [ ] RLS is enabled: Dashboard → Table Editor → [table] → RLS shows "Enabled"
- [ ] Policies are visible: Dashboard → Authentication → Policies → [table]
- [ ] TypeScript types regenerated: `supabase gen types typescript --local > lib/supabase/types.ts`
- [ ] Tested with a real user session (not service role) to verify RLS allows/blocks correctly

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Table with no RLS | `ALTER TABLE t ENABLE ROW LEVEL SECURITY` |
| SECURITY DEFINER without search_path | Add `SET search_path = public, pg_temp` |
| Policy references user_roles causing recursion | Use `auth.jwt() ->> 'role'` or a security definer helper function |
| Modifying an existing migration | Create a new migration that corrects it with `ALTER TABLE` |
| Using `YYYYMMDD_HHMM_` or `YYYYMMDDHHMM_` format | Use `YYYYMMDDHHmmSS_` (14 digits with seconds) — inner underscores cause version collisions; 12-digit format is superseded |
| Two files with the same numeric prefix (e.g. two `153_*`) | Rename the newer one to a full timestamp with `git mv` — run collision check after |
| 12-digit key is prefix of a 14-digit key (e.g. `202605191200` and `20260519120000`) | Rename the 12-digit file to a unique 14-digit timestamp — the Supabase CLI can't resolve the shorter key when the longer one exists, blocking all `db push` |
| `CREATE TABLE` without `IF NOT EXISTS` | Always `CREATE TABLE IF NOT EXISTS` — migration may be retried after partial failure |
| `ADD COLUMN` without `IF NOT EXISTS` | `ALTER TABLE t ADD COLUMN IF NOT EXISTS col type` |
| `CREATE POLICY` without dropping first | `DROP POLICY IF EXISTS "name" ON t` before every `CREATE POLICY` |
| `ADD CONSTRAINT` without dropping first | `DROP CONSTRAINT IF EXISTS name` then `ADD CONSTRAINT` |
| `ALTER TYPE ADD VALUE` without guard | Use `IF NOT EXISTS` check in `DO $$` block — safer than `EXCEPTION WHEN duplicate_object` |
| Replacing any CHECK constraint with a partial value list | Query the live constraint definition first — new list MUST include ALL existing values or valid inserts start failing silently |
| Public URL for contract files | Use signed URLs (see `00-core.mdc` security section) |
