---
name: nextjs/api-route
description: Create a Next.js API route following the Vistral Lab 4-step pattern — auth check → Zod → service → response. Use when adding a new endpoint in app/api/.
---

# Next.js API Route

Creates a type-safe API route following the mandatory 4-step order for this codebase.

## Step 1 — Pick the location

New routes go in `app/api/{domain}/{operation}/route.ts`.

Examples from this codebase:
- `app/api/admin/users/route.ts` — admin user management
- `app/api/checklist/route.ts` — project checklist updates
- `app/api/contracts/fetch-signed-pdf/route.ts` — contract operations

## Step 2 — Apply the 4-step pattern

Every handler must follow this exact order. Skipping or reordering breaks security.

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z, ZodError } from 'zod'

// Step 3: Define Zod schema near the top
const MySchema = z.object({
  propertyId: z.string().uuid(),
  status: z.enum(['captacion', 'analisis', 'oferta']),
})

export async function POST(request: NextRequest) {
  try {
    // STEP 1 — Auth check (always first, always getUser() not getSession())
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // STEP 2 — Role check (only for protected endpoints)
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    if (!['supply_admin', 'supply_lead'].includes(roleData?.role ?? '')) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // STEP 3 — Zod validation
    const body = await request.json()
    const input = MySchema.parse(body)

    // STEP 4 — Service call + response
    const { data, error } = await supabase
      .from('properties')
      .update({ status: input.status })
      .eq('id', input.propertyId)
      .select()
      .single()

    if (error) {
      console.error('[MyRoute] DB error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: error.errors }, { status: 400 })
    }
    console.error('[MyRoute] Unexpected error:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}
```

## Real codebase reference

`app/api/admin/users/route.ts` — shows the complete pattern with auth → role → service across GET, POST, PATCH, DELETE methods.

## Rules

- **Auth:** `getUser()` not `getSession()`. getSession trusts the client cookie; getUser re-validates with the server.
- **Env vars:** Use `config` from `@/lib/config/environment` — never `process.env` directly except in admin routes where `SUPABASE_SERVICE_ROLE_KEY` is a known exception.
- **Service role:** Only use in `app/api/**`. Never pass to client components.
- **Error log format:** `console.error('[RouteName] operation:', error)` — always include context in brackets.
- **Response shape:** Always `{ success: true/false, data/error: ... }`.

## Checklist before finishing

- [ ] Auth check is FIRST, before any body parsing
- [ ] Using `getUser()` not `getSession()`
- [ ] Zod schema defined and `.parse()` called (not `.safeParse()` unless you need error details)
- [ ] `console.error` uses `[RouteName]` prefix
- [ ] Route is GET/POST/PUT/PATCH/DELETE — no default exports
- [ ] Error returns `{ success: false, error: ... }` — not just `{ error: ... }`
