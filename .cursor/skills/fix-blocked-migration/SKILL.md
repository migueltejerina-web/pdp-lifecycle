---
name: fix-blocked-migration
description: >
  Diagnose and fix a Supabase migration that is blocking staging or prod deploys.
  Covers five root causes: (1) schema already applied outside migrations,
  (2) migration version key collision in schema_migrations, (3) constraint/policy
  violation from missing values, (4) ALTER/RENAME on a missing object,
  (5) prefix overlap between 12-digit and 14-digit version keys.
  Always runs a dry-run before opening a PR.
---

# Fix Blocked Migration

Use when the `apply-migrations-staging.yml` or `apply-migrations-prod.yml` workflow
fails with any of these errors:

- `ERROR: relation "..." already exists`
- `ERROR: column "..." already exists`
- `ERROR: check constraint "..." violated by some row`
- `Remote migration versions not found in local migrations directory`
- `ERROR: relation "..." does not exist` on an ALTER/RENAME statement

## Environments

| Environment | project_id                   |
|-------------|------------------------------|
| Staging     | `jstxpfiutqmlrwhbyfjt`       |
| Production  | `dryxwoffrfrtgavcrrgz`       |

---

## Step 0 — Identify the failure

Read the workflow log and extract:
- **Migration filename** (e.g. `202605141616_rename_project_unit_tenancies_to_tenancies.sql`)
- **Error message** and **statement number** (`At statement: N`)
- **Blocked environment** (staging / prod)

Read the failing migration file in full before proceeding.

---

## Step 1 — Diagnose root cause

Run read-only queries against the blocked environment to understand current state.
Never run DDL or DML via MCP — SELECT only.

### Root cause A — Object already exists (relation/column/index/policy)

```sql
-- Check if table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = '<table>';

-- Check if column exists
SELECT column_name FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = '<table>' AND column_name = '<col>';

-- Check if constraint exists
SELECT conname FROM pg_constraint WHERE conname = '<constraint_name>';

-- Check if policy exists
SELECT policyname FROM pg_policies
WHERE tablename = '<table>' AND policyname = '<policy>';

-- Check if index exists
SELECT indexname FROM pg_indexes
WHERE tablename = '<table>' AND indexname = '<index>';
```

**Fix:** Wrap the failing statement in an idempotency guard (see Step 2).

### Root cause B — CHECK constraint violation

```sql
-- Find rows that violate the new constraint list
SELECT DISTINCT role FROM user_roles
WHERE role NOT IN ('val1', 'val2', ...);
```

**Fix:** Add the offending value(s) to the `IN (...)` list in the migration.
Only add values that already exist as rows — do not invent new roles.

### Root cause C — Version key collision / "Remote version not found"

```sql
-- Inspect schema_migrations for the affected version range
SELECT version, name FROM supabase_migrations.schema_migrations
WHERE version LIKE '2026051316%'
ORDER BY version;
```

Run `supabase migration list` locally and look for rows where Local and Remote
are misaligned for the same version key.

**Fix:** Use `supabase migration repair` (see Step 3).

### Root cause E — Prefix overlap between 12-digit and 14-digit version keys

This occurs when a legacy 12-digit file (e.g. `202605191200_foo.sql`) shares its first 12 characters with a newer 14-digit file (e.g. `20260519120000_bar.sql`). The version keys are different (`202605191200` vs `20260519120000`) so the `uniq -d` collision check passes, but the Supabase CLI cannot resolve the 12-digit key to its local file when the 14-digit file is present.

```bash
# Detect prefix overlaps
for f in supabase/migrations/*.sql; do basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'; done | sort | while read v; do
  if [ ${#v} -eq 12 ]; then
    grep -q "^${v}" <<< "$(for f2 in supabase/migrations/*.sql; do basename "$f2" | sed -E 's/^([0-9]+)_.*/\1/'; done | grep -v "^${v}$")" && echo "PREFIX_OVERLAP: ${v}"
  fi
done
```

**Fix:**
1. Rename the 12-digit file to a unique 14-digit timestamp: `git mv supabase/migrations/202605191200_foo.sql supabase/migrations/20260519120030_foo.sql`
2. Repair both staging and prod:
   ```bash
   supabase link --project-ref <project_id>
   supabase migration repair --status reverted 202605191200
   supabase migration repair --status applied 20260519120030
   ```
3. Verify with `supabase db push --dry-run`

### Root cause D — ALTER/RENAME on an object that no longer exists

```sql
-- Check under old name
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = '<old_name>';

-- Check under new name
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = '<new_name>';
```

If the object is already under the new name: the rename was applied outside
migrations. Make the migration idempotent (see Step 2).

---

## Step 2 — Apply idempotency guards

### Pattern A — CREATE TABLE / INDEX / TYPE

Most `CREATE` statements already support `IF NOT EXISTS`. If not, add it:

```sql
-- Before
CREATE TABLE public.foo (...);
CREATE INDEX idx_foo ON public.foo(col);

-- After
CREATE TABLE IF NOT EXISTS public.foo (...);
CREATE INDEX IF NOT EXISTS idx_foo ON public.foo(col);
```

### Pattern B — ALTER TABLE ADD COLUMN

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'foo' AND column_name = 'bar'
  ) THEN
    ALTER TABLE public.foo ADD COLUMN bar text;
  END IF;
END$$;
```

### Pattern C — RENAME TABLE (most common blocking case)

Postgres does not support `ALTER TABLE ... RENAME TO ... IF EXISTS`.
Use a `DO $$` block:

```sql
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'old_name'
  ) THEN
    ALTER TABLE public.old_name RENAME TO new_name;
  END IF;
END$$;
```

Apply the same pattern to every dependent statement (RENAME CONSTRAINT,
RENAME INDEX via `ALTER INDEX IF EXISTS`, RENAME POLICY via `DO $$`):

```sql
-- Rename constraint (guarded)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'old_constraint_name'
  ) THEN
    ALTER TABLE public.new_table
      RENAME CONSTRAINT old_constraint_name TO new_constraint_name;
  END IF;
END$$;

-- Rename index (IF EXISTS is supported here)
ALTER INDEX IF EXISTS public.old_idx_name RENAME TO new_idx_name;

-- Rename policy (guarded)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'new_table' AND policyname = 'Old Policy Name'
  ) THEN
    ALTER POLICY "Old Policy Name" ON public.new_table
      RENAME TO "New Policy Name";
  END IF;
END$$;
```

### Pattern D — ADD CONSTRAINT with CHECK

When rows already exist that would violate the new constraint:

1. Identify all distinct values currently in the column.
2. Make sure every existing value is included in the `IN (...)` list.
3. Never remove values — only add.

```sql
-- Before (missing 'super_admin')
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('supply_partner', 'supply_analyst', ...));

-- After
ALTER TABLE user_roles
  ADD CONSTRAINT user_roles_role_check
  CHECK (role IN ('supply_partner', 'supply_analyst', ..., 'super_admin'));
```

### Pattern E — Placeholder (migration already fully applied outside system)

When ALL statements in the migration already ran outside the migration system
and re-running would be a complete no-op even with `IF NOT EXISTS`:

```sql
-- Placeholder: this migration was applied directly on <date>.
-- The SQL already ran; this file exists so that `supabase db push --include-all`
-- finds a matching local file for the remote version key <version>.
-- See: <context / related migration name>
```

Use this pattern sparingly — only when the original SQL is truly idempotent
AND the migration was confirmed applied via `schema_migrations` query.

---

## Step 3 — Repair version key collisions

Run locally against the blocked environment (staging or prod, per which is blocked):

```bash
# See full migration state
supabase migration list

# If a version appears as "remote only" (no local file) and you have confirmed
# it ran as part of a batch (check workflow logs):
supabase migration repair --status reverted <version>
# This removes the orphaned remote entry so the next push re-applies it
# (safe only if the SQL is idempotent or already applied as a different version)

# If a version appears as "local only" but was already applied:
supabase migration repair --status applied <version>
```

**When to use `reverted` vs `applied`:**

- `reverted` — removes the remote entry; the next `db push` will re-apply the local file. Use when the orphaned remote entry is a duplicate that collides with a correctly-named local file.
- `applied` — marks a local file as already applied remotely. Use when the migration ran but was not recorded (e.g. applied manually before the migration file was committed).

After any repair, always re-run the dry-run before committing anything.

---

## Step 4 — Dry run

```bash
supabase db push --linked --include-all --dry-run
```

- If it lists only expected pending migrations → proceed to Step 5.
- If it still errors with "Remote migration versions not found" → go back to Step 3.
- If it errors with a different migration → treat that as a new blocked migration and restart from Step 0.

---

## Step 5 — Verify prod safety

For every migration you modified, run a quick check against prod:

```sql
-- Confirm the object state in prod before the migration runs there
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('<old_name>', '<new_name>');
```

Confirm that:
- If you added idempotency guards: the guards correctly handle both the "already done" state (staging) AND the "not yet done" state (prod).
- If you used a placeholder: the original SQL is idempotent (uses `IF NOT EXISTS`) so prod won't fail if it re-runs.
- If you added values to a CHECK constraint: confirm prod does NOT have rows with those values already (to avoid adding phantom roles that weren't intended).

---

## Step 6 — Commit and PR

Branch naming: `fix/migration-<short-description>`

Commit message: `fix(migrations): <what was broken and how it was fixed>`

PR title: same format.

PR body must include:
- Which migration(s) were fixed
- Root cause (A/B/C/D/E from Step 1)
- Prod safety analysis (Step 5 result)
- Dry-run confirmation output

Base branch: `dev`.

---

## Anti-patterns (never do these)

- Never run DDL via MCP `execute_sql` — read-only only
- Never run `supabase db push` (without `--dry-run`) locally against staging or prod
- Never edit a migration that is already in `schema_migrations` for BOTH staging AND prod
- Never use `supabase migration repair` without first confirming via `schema_migrations` query what the actual DB state is
- Never add new role values to a CHECK constraint without first confirming those values exist as rows in the table

---

## Quick reference — collision checks

**Check 1 — Exact duplicate version keys:**

```bash
for f in supabase/migrations/*.sql; do
  basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'
done | sort | uniq -d
```

Empty output = no collisions.

**Check 2 — Prefix overlap (12-digit key is prefix of 14-digit key):**

```bash
for f in supabase/migrations/*.sql; do basename "$f" | sed -E 's/^([0-9]+)_.*/\1/'; done | sort | while read v; do
  if [ ${#v} -eq 12 ]; then
    grep -q "^${v}" <<< "$(for f2 in supabase/migrations/*.sql; do basename "$f2" | sed -E 's/^([0-9]+)_.*/\1/'; done | grep -v "^${v}$")" && echo "PREFIX_OVERLAP: ${v}"
  fi
done
```

Empty output = no overlaps. Non-empty = rename the 12-digit file to a unique 14-digit timestamp and repair remote `schema_migrations`.
