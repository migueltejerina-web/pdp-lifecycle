---
name: figma-to-code
description: Implement a Figma design into production-ready React/Next.js code using Figma MCP, PropHero design system, and Vistral Lab standards
---

# Figma to Code (Vibe Coding Edition)

## When to Use This Skill

Use this skill when:

- You have a Figma design that needs to be implemented
- You want to ensure you use the correct design system components
- You need guidance translating Figma tokens to code

## Prerequisites

Before starting, have ready:

- **Figma frame URL** (with node-id if possible)
- **Component/page name** to implement
- **Route in the app** where it will go (new page, existing component, modal)

---

## Step 1 — Extract Design with Figma MCP

**Prompt to use:**

```markdown
"I have this Figma design: [URL of the frame]

Use Figma MCP to extract:
1. Layout structure (flex/grid, direction, gaps)
2. Typography (font-size, font-weight, line-height, color)
3. Spacing (padding, margin on each element)
4. Colors (fills, backgrounds, borders)
5. Components used (buttons, inputs, cards, badges)
6. Responsive breakpoints (if there are mobile/tablet variants)

Give me a structured summary before I start coding."
```

**Expected output:**

- List of elements with their CSS properties
- DS components it recognized
- Breakpoints identified

---

## Step 2 — Map to PropHero Components

**Prompt:**

```markdown
"With the extracted design, identify:

1. Which PropHero components are used?
   - Check: https://react.design.prophero.com/
   - Look for: Button, Input, Card, Badge, Dialog, Select, etc.

2. For each design element, tell me:
   - PropHero component to use (or null if it doesn't exist)
   - Required props (variant, size, etc.)
   - If it doesn't exist -> candidate to create locally

3. Map Figma values to Prophero tokens:
   - fontSize 16 -> --prophero-font-size-md
   - padding 16 -> --prophero-margin-md
   - color #0066CC -> --prophero-blue-500
   - borderRadius 8 -> --prophero-radius-lg"
```

---

## Step 3 — Implement the Layout

**Prompt:**

```markdown
"Implement the layout of [ComponentName].

Following 02-design-system.mdc:
1. Use container-margin for responsive margins
2. Use gutter classes for spacing between items
3. Use CSS variables --prophero-* for custom values
4. Use cn() from @/lib/utils for conditional classes

Responsive grid:
- Mobile (<576px): [mobile layout description]
- Tablet (769px-992px): [tablet description]
- Desktop (1200px+): [desktop description]

Don't invent values - use prophero.css tokens"
```

---

## Step 4 — Implement Components

**Prompt for each component:**

```markdown
"Implement [ComponentName] with these Figma specs:

Layout: [extracted from Step 1]
Typography: [extracted from Step 1]
Colors: [extracted from Step 1]

Rules:
1. Use PropHero components where they exist
2. Use cn() for conditional classes
3. forwardRef if wrapping native element
4. Export as named export
5. Typed Props interface

Show me the complete component code."
```

---

## Step 5 — Visual Comparison with Browser MCP

**Prompt:**

```markdown
"Use Browser MCP to compare implementation with Figma:

1. Open localhost:3000/[component route]
2. Screenshot of current state
3. Compare with Figma: [URL]

Report differences in:
- Spacing (too close/too far)
- Typography (size, weight, color)
- Colors (backgrounds, borders)
- Layout (alignment, grid)
- Responsive behavior

List needed adjustments with High/Medium/Low priority"
```

---

## Step 6 — Adjustments and Polish

**Prompt for each adjustment:**

```markdown
"Adjust [specific element]:

Actual: [describe what you see]
Expected: [describe what it should look like per Figma]

Rules:
- Don't hardcode values - use tokens
- Verify on mobile too
- Screenshot before and after"
```

---

## Step 7 — Responsive Check

**Prompt:**

```markdown
"Use Browser MCP to verify responsive:

1. Screenshot at 375px (iPhone SE - mobile)
2. Screenshot at 768px (iPad - tablet)
3. Screenshot at 1280px (laptop - desktop)
4. Screenshot at 1920px (large screen)

For each breakpoint verify:
- Layout adapts correctly
- Typography is legible
- No horizontal overflow
- Buttons/inputs are touchable on mobile (min 44px)"
```

---

## Delivery Checklist

- [ ] Figma MCP extracted specs correctly
- [ ] PropHero components identified and used
- [ ] Prophero tokens used (no hardcoded values)
- [ ] cn() used for conditional classes
- [ ] forwardRef on components wrapping HTML
- [ ] Props interface typed with TypeScript
- [ ] Responsive verified with Browser MCP
- [ ] Matches Figma visual comparison
- [ ] No custom CSS that duplicates design system

---

## Troubleshooting

### Figma MCP doesn't find the node

```markdown
"Figma MCP gives 'node not found'.
Current URL: [URL]
Try:
1. Extract the node-id from URL (format: 123-456)
2. Reformat to 123:456
3. If it still fails, use the parent frame
4. Fallback: describe the design by screenshot"
```

### Component doesn't exist in PropHero

```markdown
"[ComponentName] doesn't exist in @prophero-ds/react-components.
Create a local component in components/ui/[component-name].tsx
Document as DS candidate in a comment:
// TODO: Candidate for PropHero DS - [description]"
```

### Tokens don't match exactly

```markdown
"The Figma value [X] doesn't map exactly to a token.
Options:
1. Is there a close token? (+/-2px is acceptable)
2. Is it a one-off value? -> use inline value with comment
3. Does it repeat a lot? -> propose new token to design team"
```
