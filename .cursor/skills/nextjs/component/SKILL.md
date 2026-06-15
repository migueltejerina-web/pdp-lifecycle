---
name: nextjs/component
description: Create a React component following Vistral Lab standards — max 300 lines, no direct Supabase calls, data via hooks. Use when building any new UI component.
---

# Next.js Component

Rules and pattern for creating components in this codebase.

## Hard Rules

1. **Max 300 lines.** If a component grows beyond 300 lines, extract sections (see `10-progressive-refactor.mdc`).
2. **No direct Supabase calls in components.** Data fetching lives in `hooks/` — components receive data as props or via hooks.
3. **No business logic.** Components render UI and call handlers. Logic lives in hooks or lib services.
4. **Named exports.** No default exports for components. Exception: Next.js page files require `export default`.

## Component Template

```typescript
'use client'

import { useState } from 'react'
import { useAppAuth } from '@/lib/auth/app-auth-context'
import { useToast } from '@/components/ui/use-toast'
// Import from hooks — NEVER import supabase client directly here
import { usePropertyData } from '@/hooks/usePropertyData'

interface PropertyCardProps {
  propertyId: string
  onStatusChange?: (newStatus: string) => void
}

export function PropertyCard({ propertyId, onStatusChange }: PropertyCardProps) {
  const { role } = useAppAuth()
  const { toast } = useToast()
  const { property, isLoading, error, updatePropertyData } = usePropertyData()
  const [isSaving, setIsSaving] = useState(false)

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!property) return null

  async function handleStatusChange(status: string) {
    try {
      setIsSaving(true)
      await updatePropertyData({ status })
      onStatusChange?.(status)
      toast({ title: 'Status updated', variant: 'default' })
    } catch {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div>
      <h2>{property.data.address}</h2>
      {/* render UI here */}
    </div>
  )
}
```

## Real codebase patterns

- `hooks/usePropertyData.ts` — the canonical data hook pattern: typed return interface, loading/error states, `useAppAuth()` for user scope
- `hooks/useChecklist.ts` — hook that encapsulates all checklist CRUD, no Supabase in the component
- Components in `app/supply/kanban/` — show how Kanban cards consume hooks and render only UI

## What belongs where

| Code | Location |
|------|----------|
| Supabase queries | `lib/*.ts` service files or `hooks/` |
| Data fetching + state | `hooks/use*.ts` |
| Business rules, calculations | `lib/*.ts` |
| UI rendering + user interaction | `components/` |
| Form validation schemas | `lib/validators/` or co-located `.validators.ts` |

## Hook contract

When a component needs data, use or create a hook with this shape:

```typescript
interface UseXxxReturn {
  data: Xxx | null
  isLoading: boolean
  error: string | null
  update: (payload: Partial<Xxx>) => Promise<void>
}

export function useXxx(id: string): UseXxxReturn { ... }
```

The component only calls `useXxx(id)` — it never knows whether the data comes from Supabase, localStorage, or a mock.

## Checklist before finishing

- [ ] Component is under 300 lines
- [ ] No `import { createClient }` from supabase in this file
- [ ] Data comes from a hook in `hooks/`
- [ ] Loading and error states are handled
- [ ] Named export (not default, unless it's a page)
- [ ] Toast feedback on any user action that mutates data
- [ ] Role check if the component is role-restricted (use `useAppAuth()`)
