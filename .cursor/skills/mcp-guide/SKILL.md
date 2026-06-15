---
name: mcp-guide
description: Reference guide for available MCP integrations in Cursor. Use when the user asks about MCPs, wants to combine multiple MCP tools, or needs guidance on which MCP to use for a task.
---

# MCP Integration Guide

## Available MCPs

| MCP | Use For | Status |
|-----|---------|--------|
| **Figma MCP** | Extract designs, layouts, typography, spacing, components | Configured |
| **Supabase MCP** | Create/modify tables, verify RLS, query data, manage migrations | Configured |
| **Playwright MCP** | Visual testing, screenshots, simulate user flows, browser automation | Configured |
| **ClickUp MCP** | Read/create docs, tasks, search workspace | Configured |
| **Context7 MCP** | Look up latest library/framework docs and code examples | Configured |
| **GitHub MCP** | Issues, PRs, repo operations, code search | Configured |
| **Memory MCP** | Persistent key-value storage across sessions | Configured |
| **Sequential Thinking MCP** | Break down complex problems step by step | Configured |
| **Exa MCP** | Web search, research, find real-time information | Configured |

---

## Prompt Patterns by MCP

### Figma MCP

```
"Use Figma MCP on [URL] to extract layout, typography, spacing.
Map values to --prophero-* design tokens (see app/prophero.css)."
```

### Supabase MCP

```
"Use Supabase MCP to:
- Check if table [name] exists
- Verify RLS policies
- Run a query: SELECT ... FROM ...
- List columns on [table]"
```

### Playwright MCP (Browser)

```
"Use Playwright MCP to:
- Open localhost:3000/[route]
- Screenshot at 375px / 768px / 1920px
- Click [element], fill [field], verify [result]"
```

### Context7 MCP (Docs Lookup)

```
"Use Context7 to look up the latest docs for [library/framework].
I need: [specific API, pattern, or example]."
```

Use this instead of guessing API signatures — it fetches current documentation.

### ClickUp MCP

```
"Use ClickUp MCP to search for [doc/task], read content, create task."
```

### GitHub MCP

```
"Use GitHub MCP to:
- List open PRs / issues
- Check CI status on [branch]
- Search code for [pattern]"
```

### Memory MCP

```
"Save to memory: [key] = [value]"
"Recall from memory: [key]"
```

Useful for persisting decisions, preferences, or context across sessions.

---

## Power Combos

### Figma → Code → Verify → Deploy

1. **Figma MCP** extract design + tokens
2. Implement component using `--prophero-*` tokens
3. **Playwright MCP** screenshot + compare with Figma
4. **create-pr** skill to ship

### Database → UI → Test

1. **Supabase MCP** create table + RLS policies
2. Generate types → build hook → create component
3. **Playwright MCP** verify data renders correctly

### Research → Implement → Document

1. **Context7 MCP** look up latest API docs
2. Implement following current best practices
3. **Memory MCP** save decisions for future reference

### Debug Production Issue

1. **GitHub MCP** check recent PRs + CI status
2. **Supabase MCP** verify data + RLS
3. **Playwright MCP** reproduce the issue visually

---

## Token Mapping (Figma → PropHero)

| Figma Value | PropHero Token |
|-------------|----------------|
| fontSize 14 | `--prophero-font-size-sm` |
| fontSize 16 | `--prophero-font-size-md` |
| padding 8 | `--prophero-spacing-2` |
| padding 16 | `--prophero-spacing-4` |
| borderRadius 8 | `--prophero-radius-2` |
| Primary blue | `--prophero-color-primary-500` |
| Background | `--prophero-color-bg-default` |

Full token list: `app/prophero.css`

---

## MCP Checklist per Feature Lifecycle

| Phase | MCPs to use |
|-------|-------------|
| **Pre-dev** | Figma MCP (extract design), Supabase MCP (verify schema), Context7 (check latest docs) |
| **During dev** | Playwright MCP (visual testing), Supabase MCP (verify queries) |
| **Pre-deploy** | Playwright MCP (full user flow test), GitHub MCP (check CI) |
| **Post-deploy** | Playwright MCP (smoke test production URL) |

---

## Troubleshooting

### MCP tool call fails

- Check if the MCP server is running (Cursor may need restart)
- Verify credentials/auth for the specific MCP (Supabase, GitHub)
- Try a simpler call first to confirm connectivity

### Figma MCP returns no data

- Verify the Figma URL is a valid file/frame link
- Check that the Figma file is shared with the MCP's access

### Supabase MCP connection issues

- Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Check if the Supabase project is online
- Try a simple `SELECT 1` query to test connectivity
