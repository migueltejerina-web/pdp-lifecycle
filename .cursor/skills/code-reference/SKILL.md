---
name: code-reference
description: Extract clean type definitions, interfaces, and schemas from existing code for documentation and reuse. Use when the user says "PARTY MODE: Code Reference", needs to extract types, or wants a clean API surface from implementation code.
---

# Code Reference (PM12)

Extract clean type definitions, interfaces, and schemas from existing code for documentation and reuse.

## Activation

User says: `PARTY MODE: Code Reference`

## Input Format

```
PARTY MODE: Code Reference
Source: [File path or component name]
Goal: Extract [TypeScript interfaces / API schema / Component props / Database schema / Hook API]
```

## Workflow

1. Locate source file/component, confirm it exists
2. Analyze structure: identify types, interfaces, enums, related types
3. Extract clean definition: ONLY public API, NO implementation details
4. Format for reuse: source path in comment, inline comments per field, usage example, related types

## Output MUST Include

- Source file path as comment header
- Inline comments explaining each field
- Usage example (how to use the extracted type/interface)
- Related types and enums

## Output MUST NOT Include

- Implementation code (function bodies, business logic)
- Private or internal types
- Full file dumps
- Unrelated code

## Communication

When presenting extracted references, include a plain-language summary:
- "This defines what data a [feature] needs to work" (for types/interfaces)
- "This is the structure of [entity] in the database — these are the fields users fill in and the system tracks" (for schemas)
- "These are the settings/options available for [component]" (for props)

Avoid dumping raw TypeScript without context. Always start with a 1-2 sentence business explanation before showing code.

---

## Vistral-Specific Extraction Patterns

### Supabase Generated Types

Source: `lib/supabase/types.ts` (auto-generated from Supabase schema)

```
PARTY MODE: Code Reference
Source: lib/supabase/types.ts
Goal: Extract the database schema for [table_name] — columns, types, and relationships
```

The agent should:
- Find the table's `Row`, `Insert`, and `Update` types
- Explain which fields are required vs optional
- Note any enum types used
- Show how to use the type with `supabase.from('table').select()`

### Custom Hook API

Source: `hooks/use*.ts`

```
PARTY MODE: Code Reference
Source: hooks/usePropertyData.ts
Goal: Extract the hook's return type — what data and functions it provides
```

The agent should:
- Extract the return type (data, loading, error states)
- Show the parameters the hook accepts
- Provide a usage example in a component
- Note any dependencies (auth context, Supabase client)

### API Route Schema

Source: `app/api/*/route.ts`

```
PARTY MODE: Code Reference
Source: app/api/contracts/route.ts
Goal: Extract the API contract — request params, response shape, auth requirements
```

The agent should:
- Extract Zod validation schemas (request body/params)
- Show the response shape
- Note auth requirements (which roles can access)
- Show example request/response

### Migration File (Database Schema)

Source: `supabase/migrations/*.sql`

```
PARTY MODE: Code Reference
Source: supabase/migrations/20260424_1430_add_geolocation_columns.sql
Goal: Extract what this migration changes — tables, columns, policies
```

The agent should:
- List tables created/modified
- List columns with their types
- Show RLS policies added
- Translate to business terms: "This adds location tracking to properties"

### Design Tokens

Source: `app/prophero.css`

```
PARTY MODE: Code Reference
Source: app/prophero.css
Goal: Extract available design tokens — colors, spacing, typography
```

The agent should:
- Group tokens by category (colors, spacing, typography, radii)
- Show the CSS variable name and its value
- Note which tokens map to Figma values

### i18n Translation Keys

Source: `lib/i18n/translations.ts`

```
PARTY MODE: Code Reference
Source: lib/i18n/translations.ts
Goal: Extract all translation keys for [section/domain]
```

The agent should:
- List all keys for the requested section
- Show both Spanish and English values
- Note any missing translations

---

## Use Cases

- Extract API request/response types for frontend consumption
- Document database table schemas from migration files
- Extract component prop interfaces for design system documentation
- Map domain models for understanding business logic
- Extract hook APIs for component developers
- Audit i18n coverage for a feature

Extracted definitions feed into: User Story technical specs, Epic documentation, design system docs, onboarding materials.

## Skill Chain

- Use extracted types to inform **feature-development** planning
- Use extracted API contracts when writing **form-creation** forms
- Use extracted schemas when reviewing **deployment-safety** database changes
