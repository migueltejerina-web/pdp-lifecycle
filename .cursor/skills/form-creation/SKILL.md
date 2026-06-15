---
name: form-creation
description: Create a complete, validated form with react-hook-form + Zod + Supabase integration following Vistral Lab standards
---

# Form Creation (Vibe Coding Edition)

## When to Use This Skill

Use this skill when:

- You need to create a new form (create/edit resource)
- You want robust validation with Zod
- You need to connect the form with Supabase or an API
- You want correct loading states and feedback

## Prerequisites

Define before starting:

- **What data** the form captures
- **Where it's saved** (Supabase table, API endpoint)
- **Who can see it** (roles/permissions)
- **Is it Create or Edit** (edit needs initial values)

---

## Step 1 — Define Schema with Zod

**Prompt:**

```markdown
"Create the Zod schema for a [resource] form:

Required fields:
- [field1]: [type] - [required/optional?] - [validations]
- [field2]: [type] - [required/optional?] - [validations]
- [field3]: enum([value1, value2, value3])

Real example:
- name: string - required - min 1 char
- email: string - optional - must be valid email
- price: number - required - positive, max 10,000,000
- status: enum(['draft', 'pending', 'approved']) - required
- notes: string - optional - max 500 chars

Generate:
1. The complete Zod schema
2. The FormValues type with z.infer
3. Error messages in Spanish"
```

**Expected output:**

```typescript
const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email invalido').optional(),
  price: z.number().positive('El precio debe ser positivo').max(10000000),
  status: z.enum(['draft', 'pending', 'approved']),
  notes: z.string().max(500, 'Maximo 500 caracteres').optional(),
})
type FormValues = z.infer<typeof formSchema>
```

---

## Step 2 — Create the Form Hook

**Prompt:**

```markdown
"Configure useForm for the [resource] form.

Following 05-forms-ui.mdc:
1. zodResolver with the schema
2. defaultValues for all fields

[For CREATE form:]
defaultValues: all fields empty/undefined

[For EDIT form:]
defaultValues: current resource data (prop 'initialData')

Is it create or edit? [CREATE/EDIT]
If EDIT, the component will receive: initialData: [TypeName]"
```

---

## Step 3 — Implement Form Fields

**Prompt:**

```markdown
"Implement the form fields using components from @/components/ui/form.

For EACH field, use:
- FormField with control={form.control}
- FormItem > FormLabel > FormControl > FormMessage
- The appropriate input (Input, Select, Textarea, Checkbox)

Fields to implement:
1. [field1] - type: text input
2. [field2] - type: select with options [A, B, C]
3. [field3] - type: textarea
4. [field4] - type: number input

Rules:
- FormLabel always in Spanish
- FormMessage shows error automatically
- Input disabled={form.formState.isSubmitting} during submit"
```

---

## Step 4 — Submit Handler with Error Handling

**Prompt:**

```markdown
"Implement onSubmit for the [resource] form.

[If CREATE - insert into Supabase:]
Table: [table_name]
Fields to insert: [field list]
Post-submit action: [reset form / redirect to /route / close modal]

[If EDIT - update in Supabase:]
Table: [table_name]
ID field: [id field]
Fields to update: [field list]
Post-submit action: [refresh data / redirect / close modal]

[If API endpoint:]
Endpoint: POST/PUT /api/[route]
Body: form fields

Following 08-error-handling.mdc:
1. Complete try/catch
2. toast.success('[resource] saved successfully')
3. toast.error('Error saving [resource]')
4. console.error('[Form Submit Error]:', error) with context
5. Loading state on Submit button"
```

---

## Step 5 — Visual Validation with Browser MCP

**Prompt:**

```markdown
"Use Browser MCP to test the form:

1. Open localhost:3000/[form route]
2. Screenshot of empty state

3. Validation test (without filling anything):
   - Click Submit
   - Screenshot: all errors should appear
   - Verify each field shows its error

4. Invalid field test:
   - Fill email with 'not-an-email'
   - Screenshot: should show 'Email invalido'

5. Happy path test:
   - Fill all fields with valid data
   - Click Submit
   - Screenshot: should show success toast
   - Verify in Supabase that data was saved

Report any bugs found."
```

---

## Step 6 — Edge Cases

**Prompt for each case:**

```markdown
"Test these edge cases on the [resource] form:

1. Fast double-click submit:
   - Button should disable after first click
   - Only one record should be created

2. Maximum value in numeric fields:
   - price = 10000001 -> should show validation error

3. Special characters in text:
   - name = '<script>alert(1)</script>'
   - Should save as plain text, without executing

4. Form with initial data (for Edit):
   - initialData values appear pre-filled
   - Submitting without changes saves correct data"
```

---

## Step 7 — Supabase Check

**Prompt:**

```markdown
"Use Supabase MCP to verify:

1. Table [table_name] has the correct fields
2. RLS policies allow:
   - INSERT: which roles can create? [roles]
   - UPDATE: which roles can edit? [roles]
3. Are there constraints that could fail?
   - unique constraints
   - not null without default
   - foreign keys

If there are gaps, tell me how to fix them before the form fails in production."
```

---

## Complete Reference Patterns

### Complete Create Form

```typescript
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createBrowserClient } from '@/lib/supabase/client'

const formSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email invalido').optional(),
})
type FormValues = z.infer<typeof formSchema>

export function CreateResourceForm({ onSuccess }: { onSuccess?: () => void }) {
  const supabase = createBrowserClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '', email: '' },
  })

  async function onSubmit(data: FormValues) {
    try {
      const { error } = await supabase.from('table_name').insert(data)
      if (error) throw error
      toast.success('Guardado correctamente')
      form.reset()
      onSuccess?.()
    } catch (error) {
      console.error('[Create Resource Error]:', error)
      toast.error('Error al guardar')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} disabled={form.formState.isSubmitting} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Delivery Checklist

- [ ] Zod schema with all fields and validations
- [ ] Error messages in Spanish
- [ ] FormField/FormItem/FormLabel/FormControl/FormMessage for each field
- [ ] Submit handler with try/catch
- [ ] toast.success and toast.error in submit
- [ ] console.error with context
- [ ] Button disabled during isSubmitting
- [ ] Loading text on button during submit
- [ ] Tested with Browser MCP (validation + happy path)
- [ ] Supabase RLS verified

---

## Input Types by Use Case

| Data | Component | Notes |
| --- | --- | --- |
| Short text | `<Input>` | max 255 chars |
| Long text | `<Textarea>` | notes, descriptions |
| Number | `<Input type="number">` | with min/max in Zod |
| Email | `<Input type="email">` | z.string().email() |
| Fixed select | `<Select>` from Radix | predefined options |
| Date | `<Input type="date">` | or date picker |
| Checkbox | `<Checkbox>` from Radix | boolean |
| Multi-select | `<MultiSelect>` custom | z.array() in schema |
