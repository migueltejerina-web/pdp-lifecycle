---
name: mixpanel-tracking
description: >-
  Adds Mixpanel analytics tracking to this project. Use when creating a new
  page, screen, button, form, or feature and you need to track it in Mixpanel.
  Also use when setting up Mixpanel from scratch, adding new event constants,
  checking how to differentiate environments in analytics data, or creating
  Mixpanel dashboards via the MCP.
---

# Mixpanel Tracking — PDP Lifecycle

## Step 0 — Is Mixpanel already set up?

Check whether `lib/analytics/mixpanel.ts` exists.

- **Yes** → skip to [Architecture](#architecture-already-set-up).
- **No** → follow [Setup from scratch](#setup-from-scratch) below, then continue.

---

## Mixpanel MCP — Connection Setup

The Mixpanel MCP lets you create dashboards, run queries, and manage reports directly from the agent. Follow these steps every time you need to use MCP tools.

### 1. Check the MCP endpoint (EU vs US)

This Mixpanel project lives in the **EU region** (`eu.mixpanel.com`). The default MCP server (`mcp.mixpanel.com`) will fail with a region error. The config must point to `mcp-eu.mixpanel.com`.

Verify and update `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mixpanel": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp-eu.mixpanel.com/mcp"]
    }
  }
}
```

If it still says `mcp.mixpanel.com`, change it and restart Cursor.

### 2. Restart Cursor completely

After any change to `mcp.json`, do a **full restart** — not just reload window:

- macOS: **Cmd+Q** then reopen Cursor
- The MCP reconnects automatically on startup; a simple window reload is not enough

### 3. Verify the connection

Run any MCP call (e.g. `Get-Business-Context` with `project_id: 4024494`). Known error messages:

| Error | Cause | Fix |
|-------|-------|-----|
| `Not connected` | MCP server not started | Full restart of Cursor (Cmd+Q) |
| `Regional access restriction … eu.mixpanel.com` | Wrong endpoint in `mcp.json` | Change to `mcp-eu.mixpanel.com`, restart |
| `organization_id is required` | Called without `project_id` | Always pass `project_id: 4024494` |
| `Unexpected keyword argument` | Schema doesn't accept that param | Check tool schema — some tools don't take `project_id` at top level |

### 4. Authenticate if prompted

If a tool call returns an auth/permission error, run `mcp_auth` for the `user-mixpanel` server, then retry. Do not call `mcp_auth` preemptively.

---

## Creating Mixpanel Dashboards via MCP

### Before you start — ask for the dashboard prefix

Multiple people work on this project in different functional areas. Dashboard names **must** start with a prefix so they stay organised. **Always ask the user:**

> "¿Qué prefijo quieres usar para los dashboards? (e.g. `Supply`, `Settlement`, `B2B2C`, `Ops`)"

Then name every dashboard `<Prefix> — <Dashboard Name>`, for example:
- `Supply — Project Phase Funnel`
- `Settlement — Document Processing`
- `B2B2C — Buyer Engagement`

### Dashboard creation workflow

1. **Call `Get-Business-Context`** first (`project_id: 4024494`) to load vocabulary and existing events.
2. **Call `Get-Events`** (`project_id: 4024494`) to get the **verified list of event names that actually exist in Mixpanel**. Keep this list for the entire session.
3. **Get schemas** for the report types you need (`Get-Query-Schema` with `report_type: "funnels"` or `"insights"`). Do this only once per type per session.
4. **Create all queries** with `skip_results: true` using `Run-Query` — these are just saved configs, not live data. Run them in parallel.
5. **Create each dashboard** with `Create-Dashboard`, passing the `query_id` values from step 4.
6. **Use `project_id: 4024494`** in every `Run-Query` and `Create-Dashboard` call.
7. **Set a time filter** on each dashboard (e.g. last 3 months) so it opens with a sensible default.

### ⚠️ CRITICAL — Only use events that exist in Mixpanel

**Never invent or guess event names** when creating reports. An event defined in `events.ts` does NOT necessarily appear in Mixpanel — it only shows up once it has fired at least once in production.

The `Get-Events` call (step 2) is the only source of truth. If an event from `events.ts` is not in that list:
- The tracking code exists but the action hasn't happened in production yet (e.g. no project has been advanced to a new phase yet)
- OR the tracking code is in a branch not yet merged/deployed

**Rules:**
- ✅ Only use event names returned by `Get-Events`
- ❌ Do not use event names from `events.ts` that are absent from `Get-Events`
- ❌ Do not assume an event name — always verify
- ℹ️ If a step in a funnel/bar chart has no matching event yet, omit the step and add a description note explaining it will appear once that action occurs in production

**Common trap:** An event appears in `events.ts` and in the codebase with a `track()` call, but the action it tracks has never happened in production (e.g. first project phase advance, first financial close). These will show zero until a real user performs the action.

### ⚠️ CRITICAL — Always check property names in source code before using breakdowns

Before adding a `breakdown` or `filter` by a property name, **look at the actual `track()` call in the code** to confirm the exact key sent. Property names are easy to guess wrong and will silently return zero data.

**How to check:**
1. `Grep` for the event constant in the codebase (e.g. `PROJECT_CHECKLIST_SECTION_CHANGED`)
2. Read the `track()` call — the object passed is the exact set of properties available
3. Use those exact key names in breakdowns and filters

**Real example that caused zero data:**
```
// Code sends:
track(EVENTS.PROJECT_CHECKLIST_SECTION_CHANGED, {
  from_section: activeSection,
  to_section: nextSection,   // ← correct property name
});

// Dashboard used:
breakdown by "section"        // ← wrong — doesn't exist, shows nothing
breakdown by "to_section"     // ✅ correct
```

**Other confirmed property names (grep before using any new one):**

| Event | Key properties |
|-------|---------------|
| `Project Tab Switched` | `from_tab`, `to_tab` |
| `Project Phase Advanced` | `from_phase`, `to_phase` |
| `Project Opportunity Stage Changed` | `from_stage`, `to_stage`, `kanban_phase` |
| `Project Checklist Section Changed` | `from_section`, `to_section`, `overall_completion_pct` |
| `Project Financial CTA Clicked` | `action` (new / edit / view) |
| `Project Financial Type Changed` | `from_type`, `to_type` |
| `Project Kanban Card Clicked` / `Kanban Card Clicked` | `column_phase` |

### ⚠️ CRITICAL — Never use Mixpanel built-in events for filtered charts

Mixpanel built-in events (`$session_start`, `$pageview`, etc.) do **not** carry custom super-properties like `environment`. Filtering by `environment = production` will exclude all of them, resulting in zero data.

**Rule:** For any chart filtered by `environment = production`, only use **custom events** (those tracked via our `track()` wrapper). For DAU / active-user metrics, use `Page Viewed` — it is our custom event and correctly receives `environment`.

| Event | Carries `environment`? | Use for DAU? |
|-------|----------------------|-------------|
| `$session_start` (Mixpanel built-in) | ❌ No | ❌ |
| `$pageview` (Mixpanel built-in) | ❌ No | ❌ |
| `Page Viewed` (our custom event) | ✅ Yes | ✅ |
| `Supply Home Viewed` (our custom event) | ✅ Yes | ✅ |

### Report types quick reference

| Type | When to use |
|------|-------------|
| `funnels` | Conversion through sequential steps (min 2 steps, max 30-day window) |
| `insights` | Trends, breakdowns, bar/line/pie charts, metric totals |
| `flows` | Sankey of paths before/after an event |
| `retention` | How many users return to do an action after a first action |

### Existing dashboards (Supply prefix)

| Dashboard | Mixpanel ID | What it shows |
|-----------|-------------|---------------|
| Supply — Project Creation Funnel | `11209996` | Supply Home → Project Add Clicked; project creation rate and time |
| Supply — User Behaviour | `11210000` | DAU, most used features, sections, role breakdown |
| Supply — Friction & Blockers | `11210003` | Edit → Submit steps, abandonment, retention |
| Supply — Project Phase Funnel | `11213261` | Submission → Accepted → Commercial Readiness → In Commercialisation + discards + blockers |
| Supply — Section Engagement | `11213262` | Most visited tabs, key actions per section, weekly trend |
| Supply — Financial Estimation Activity | `11213263` | Estimation steps, all financial actions, CSV/template usage |
| Supply — Checklist Progress | `11213264` | Checklist steps, section navigation, avg completion % at submission |

### Events that exist in Mixpanel (production — verified 2026-05-21)

These are the only events safe to use in dashboard queries:

```
Supply Home Viewed        Supply Home Session Ended   Supply Tab Switched
Project Home Viewed       Project Kanban Viewed        Project Kanban Card Clicked
Project Add Clicked       Project Detail Viewed        Project Detail Session Ended
Project Tab Switched      Project Submitted to Review  Project Accepted
Project Opportunity Stage Changed
Project Financial CTA Clicked   Project Financial Saved
Project Financial Table Tab Switched   Project Financial Type Changed
Project Financial Typology Opened      Project Financial Typology Applied
Project Checklist Viewed   Project Checklist Section Changed   Project Checklist Saved
Financial Estimate CTA Clicked   Financial Estimate Viewed
Kanban Viewed   Kanban Card Clicked   Kanban Session Ended
Go to Kanban Clicked   Page Viewed
Property Detail Viewed   Property Detail Session Ended   Property Tab Switched
```

### Events tracked in code but NOT yet in Mixpanel (will appear once triggered)

These are correctly implemented — they just haven't been triggered in production yet:

| Event | Fires when | Tracked in |
|-------|-----------|------------|
| `Add Property Form Started` | User opens the add-property modal | `components/supply/add-property-form.tsx:77` |
| `Add Property Form Completed` | Form submitted successfully | `components/supply/add-property-form.tsx:373` |
| `Property Created` | Property created in the database | `components/supply/add-property-form.tsx:379` |
| `Project Phase Advanced` | "Avanzar a preparación comercial" or "Avanzar a en comercialización" button clicked and succeeds | `app/proyecto/[id]/page.tsx` |
| `Project Phase Advance Blocked` | Advance button clicked but conditions not met | `app/proyecto/[id]/page.tsx` |
| `Project Discarded` | Project discarded | `app/proyecto/[id]/page.tsx` |
| `Project Recovered` | Discarded project recovered | `app/proyecto/[id]/page.tsx` |
| `Project Financial Closed` | Financial editor closed/locked | financial editor component |
| `Project Checklist Submitted` | Checklist "send for review" button clicked | `app/proyecto/[id]/checklist/page.tsx` |
| Renovation budget events | Budget mode selected / draft saved / locked | `app/proyecto/[id]/budget/page.tsx` |
| Deck / readiness / document / gantt events | Various actions | respective tab components |

---

---

## Setup from scratch

Run once when the project has no Mixpanel integration yet.

### 1. Install the SDK
```bash
npm install mixpanel-browser
npm install --save-dev @types/mixpanel-browser
```

### 2. Add env vars

In `.env.local`:
```
NEXT_PUBLIC_MIXPANEL_TOKEN=<token from Mixpanel → Settings → Project Token>
NEXT_PUBLIC_ENV=development
```

In Vercel (or your deployment platform):
- Preview / staging deploys: `NEXT_PUBLIC_ENV=staging` (or `NEXT_PUBLIC_APP_ENV=staging`)
- Production: `NEXT_PUBLIC_ENV=production`

`lib/config/environment.ts` reads **either** `NEXT_PUBLIC_APP_ENV` or `NEXT_PUBLIC_ENV` (Vercel docs use the latter).

> **EU region?** Check if the project URL is `eu.mixpanel.com`. If so, keep `api_host: "https://api-eu.mixpanel.com"` in the wrapper below. For US, remove that line.

> **MCP endpoint (EU project):** The Mixpanel MCP must connect to `https://mcp-eu.mixpanel.com/mcp`. The global default (`mcp.mixpanel.com`) will return a region error. Config lives in `~/.cursor/mcp.json`:
> ```json
> "mixpanel": {
>   "command": "npx",
>   "args": ["-y", "mcp-remote", "https://mcp-eu.mixpanel.com/mcp"]
> }
> ```
> After changing the URL, restart Cursor completely (Cmd+Q) to reconnect.

### 3. Create `lib/analytics/events.ts`
```ts
export const EVENTS = {
  USER_IDENTIFIED: "User Identified",
  USER_LOGGED_OUT: "User Logged Out",
  PAGE_VIEWED: "Page Viewed",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];
```
Add more events as you instrument the app (see [Adding a new event](#adding-a-new-event)).

### 4. Create `lib/analytics/mixpanel.ts`

> **Important — event queue pattern**: `track()` is synchronous and buffers events before init
> completes. This prevents silent drops when users click quickly after page load.
> Pass `environment` to `initMixpanel()` so the super-property is registered immediately,
> not waiting for user auth to resolve.

```ts
"use client";
import type { EventName } from "./events";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MixpanelInstance = any;
type Properties = Record<string, unknown>;

let mpInstance: MixpanelInstance | null = null;
let initStarted = false;

type QueuedCall =
  | { type: "track"; event: string; properties?: Properties }
  | { type: "identify"; userId: string; traits?: Properties }
  | { type: "register"; properties: Properties }
  | { type: "time_event"; event: string }
  | { type: "reset" };

const queue: QueuedCall[] = [];

function flushQueue(): void {
  const pending = queue.splice(0);
  for (const call of pending) {
    try {
      if (call.type === "track") mpInstance!.track(call.event, call.properties);
      else if (call.type === "identify") {
        mpInstance!.identify(call.userId);
        if (call.traits && Object.keys(call.traits).length > 0) mpInstance!.people.set(call.traits);
      } else if (call.type === "register") mpInstance!.register(call.properties);
      else if (call.type === "time_event") mpInstance!.time_event(call.event);
      else if (call.type === "reset") mpInstance!.reset();
    } catch (err) { console.error("[Mixpanel] flush error:", err); }
  }
}

export async function initMixpanel(environment?: string): Promise<void> {
  if (typeof window === "undefined" || initStarted) return;
  initStarted = true;
  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === "development")
      console.warn("[Mixpanel] NEXT_PUBLIC_MIXPANEL_TOKEN not set.");
    return;
  }
  try {
    const mp = (await import("mixpanel-browser")).default;
    mp.init(token, {
      track_pageview: false,
      persistence: "localStorage",
      debug: process.env.NODE_ENV === "development",
      api_host: "https://api-eu.mixpanel.com", // remove for US region
    });
    mpInstance = mp;
    if (environment) mp.register({ environment }); // register BEFORE flushing queue
    flushQueue();
    console.log("[Mixpanel] ✅ Initialized");
  } catch (err) { console.error("[Mixpanel] init error:", err); }
}

export function track(event: EventName, properties?: Properties): void {
  if (typeof window === "undefined") return;
  if (!mpInstance) { queue.push({ type: "track", event, properties }); return; }
  try { mpInstance.track(event, properties); } catch (err) { console.error("[Mixpanel] track error:", err); }
}
export function timeEvent(event: EventName): void {
  if (typeof window === "undefined") return;
  if (!mpInstance) { queue.push({ type: "time_event", event }); return; }
  try { mpInstance.time_event(event); } catch {}
}
export function identify(userId: string, traits?: Properties): void {
  if (typeof window === "undefined") return;
  if (!mpInstance) { queue.push({ type: "identify", userId, traits }); return; }
  try { mpInstance.identify(userId); if (traits) mpInstance.people.set(traits); } catch {}
}
export function reset(): void {
  if (typeof window === "undefined") return;
  if (!mpInstance) { queue.push({ type: "reset" }); return; }
  try { mpInstance.reset(); } catch {}
}
export function registerSuperProperties(properties: Properties): void {
  if (typeof window === "undefined") return;
  if (!mpInstance) { queue.push({ type: "register", properties }); return; }
  try { mpInstance.register(properties); } catch {}
}
```

### 5. Create `components/providers/mixpanel-provider.tsx`

Replace `useAppAuth` and `config.environment` with however this project exposes the current user and environment:

```tsx
"use client";
import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { initMixpanel, identify, reset, track, registerSuperProperties } from "@/lib/analytics/mixpanel";
import { EVENTS } from "@/lib/analytics/events";

// Adapt this import to however the project exposes the current user + role
import { useAppAuth } from "@/lib/auth/app-auth-context";
import { config } from "@/lib/config/environment";

export function MixpanelProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAppAuth();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const prevUserIdRef = useRef<string | null>(null);

  // Pass environment immediately — registered before user auth resolves
  useEffect(() => { initMixpanel(config.environment); }, []);

  useEffect(() => {
    if (!user) {
      if (prevUserIdRef.current) { reset(); prevUserIdRef.current = null; }
      return;
    }
    if (user.id === prevUserIdRef.current) return;
    prevUserIdRef.current = user.id;
    identify(user.id, { $email: user.email, role });
    registerSuperProperties({
      role,
      user_id: user.id,
      environment: config.environment,
      app_url: typeof window !== "undefined" ? window.location.origin : undefined,
    });
  }, [user, role]);

  useEffect(() => {
    if (pathname === prevPathnameRef.current) return;
    prevPathnameRef.current = pathname;
    track(EVENTS.PAGE_VIEWED, {
      page: pathname,
      environment: config.environment,
      referrer: typeof document !== "undefined" ? document.referrer : undefined,
    });
  }, [pathname]);

  return <>{children}</>;
}
```

### 6. Wire the provider in `app/providers.tsx`

Add `<MixpanelProvider>` **inside** your auth provider so `useAppAuth()` is available:

```tsx
import { MixpanelProvider } from "@/components/providers/mixpanel-provider";

// Inside AppProviders:
<AppAuthProvider>
  <MixpanelProvider>
    {children}
  </MixpanelProvider>
</AppAuthProvider>
```

### 7. Verify

Reload the app → check browser console for `[Mixpanel] ✅ Initialized`. Open DevTools → Network → filter `mixpanel` → navigate between pages and confirm `track/` requests return 200.

---

## Architecture (already set up)

```
lib/analytics/events.ts          ← Event name constants
lib/analytics/mixpanel.ts        ← SDK wrapper (EU endpoint, debug in dev)
components/providers/mixpanel-provider.tsx  ← Auto page views + identify
app/providers.tsx                ← MixpanelProvider wired in the tree
```

The provider auto-tracks `Page Viewed` on every route change and identifies the user from Supabase auth. All events include `environment` and `role` as super-properties.

## Environments

| Env | Variable | Value |
|-----|----------|-------|
| localhost | `.env.local` | `NEXT_PUBLIC_ENV=development` (default if unset) |
| staging | Vercel → Preview / custom staging | `NEXT_PUBLIC_ENV=staging` |
| production | Vercel → Production | `NEXT_PUBLIC_ENV=production` |

Filter any Mixpanel report by `environment` to isolate real data. **Localhost events are always `development`** unless you set `NEXT_PUBLIC_ENV=staging` in `.env.local`.

---

## Checklist: tracking a new feature

When you build a new page, button, form, or flow, run through this list:

- [ ] **New screen/page** → add `Page Viewed` fires automatically via router hook. Add a dedicated `[ScreenName] Viewed` event in `useEffect` if you need screen-specific properties (entity id, status, etc.).
- [ ] **New button/action** → add `track(EVENTS.YOUR_EVENT, { ...props })` in the `onClick` / mutation success handler.
- [ ] **New form** → track `Form Started` (on first field focus + `timeEvent`), `Form Completed` (on submit success), `Form Abandoned` (on close/navigate away without submit).
- [ ] **Time-sensitive flow** → call `timeEvent(EVENTS.YOUR_EVENT)` before the start; Mixpanel auto-adds `$duration` when you call `track` for that event.
- [ ] **New entity lifecycle** (created / updated / deleted / status changed) → track at the mutation call site (after await resolves).
- [ ] **New event constant** → add to `lib/analytics/events.ts` before using. Never use raw strings.

---

## Adding a new event

**Step 1 — Add the constant** in `lib/analytics/events.ts`:
```ts
export const EVENTS = {
  // ... existing events ...
  MY_NEW_EVENT: "My New Event",
} as const;
```

**Step 2 — Track it** wherever the action happens:
```ts
import { track, timeEvent } from "@/lib/analytics/mixpanel";
import { EVENTS } from "@/lib/analytics/events";

// Simple click
track(EVENTS.MY_NEW_EVENT, {
  entity_id: id,
  status: currentStatus,
  role,
});

// With duration (e.g. form or multi-step flow)
timeEvent(EVENTS.MY_NEW_EVENT);   // call at start
// ... user does the action ...
track(EVENTS.MY_NEW_EVENT, { completed: true });  // $duration auto-added
```

---

## Patterns by component type

### New page (`app/.../page.tsx`)
```ts
// Page view with entity data (after load)
useEffect(() => {
  if (!data) return;
  track(EVENTS.MY_PAGE_VIEWED, { entity_id: data.id, status: data.status });
  timeEvent(EVENTS.MY_PAGE_SESSION_ENDED);
  return () => { track(EVENTS.MY_PAGE_SESSION_ENDED, { entity_id: data.id }); };
}, [data?.id]); // eslint-disable-line react-hooks/exhaustive-deps
```

### New button / action
```ts
const handleAction = async () => {
  await doSomething();
  track(EVENTS.ACTION_DONE, { entity_id: id, result: "success" });
};
```

### New form
```ts
const startedRef = useRef(false);
const handleFirstFocus = () => {
  if (startedRef.current) return;
  startedRef.current = true;
  track(EVENTS.FORM_STARTED, { context });
  timeEvent(EVENTS.FORM_COMPLETED);
};

// onSubmit success:
track(EVENTS.FORM_COMPLETED, { entity_id: newId, ...formSummary });

// onClose without submit:
track(EVENTS.FORM_ABANDONED, { last_field: lastFocused });
```

### Status / phase change
```ts
// After the mutation resolves
track(EVENTS.ENTITY_STATUS_CHANGED, {
  entity_id: id,
  from: previousStatus,
  to: newStatus,
  actor_role: role,
});
```

---

## SDK reference

All functions are **synchronous** (they return void immediately). Events fired before
Mixpanel finishes loading are queued and flushed automatically once init completes.
All functions are no-ops in SSR.

| Function | When to use |
|----------|-------------|
| `track(event, props?)` | Track any user action |
| `timeEvent(event)` | Start a timer before a flow; `track` auto-adds `$duration` |
| `identify(userId, traits?)` | Already handled by MixpanelProvider |
| `reset()` | Already handled on logout |
| `registerSuperProperties(props)` | Add props to every future event (use sparingly) |

### Common pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Events appear in Mixpanel but fail `environment = production` filter | `environment` super-property not registered before event fires | Pass `environment` to `initMixpanel(config.environment)` in the provider |
| Events for early clicks (e.g. kanban card) are missing | Race condition: `track()` was async and dropped events before init | Fixed by event queue — `track()` is now synchronous |
| An event is defined in `events.ts` but shows zero data | `track()` is never actually called, OR the action hasn't happened yet in production | Search the codebase for the event constant; verify it exists in `Get-Events` output |
| Dashboard chart shows zero / event name doesn't appear in Mixpanel property picker | Event is in `events.ts` and has a `track()` call, but no user has triggered it in production yet | Normal — the chart will populate once real users perform the action; do not rename the event |
| Button click shows zero data | Event fires before `environment` super-property is registered | Include `environment: config.environment` directly in the track call as a fallback |

For the full list of existing events, see [events-reference.md](events-reference.md).

---

## Proyecto / Projects — coverage map

### Already implemented (do NOT add again)

| Area | Files |
|------|-------|
| Project detail page — viewed, session, all tabs, lifecycle (submit/accept/discard/recover/advance), CRM fields, assignees, financial CTAs | `app/proyecto/[id]/page.tsx` |
| Kanban — viewed, card click, filter, view toggle, add project | `app/proyecto/kanban/page.tsx`, `hooks/use-proyecto-kanban-board-data.ts` |
| Home dashboard | `components/supply/home/projects-dashboard.tsx` |
| Financial wizard — save, close/lock, packs dialog, typology open/apply, yield↔flip, table tabs, template download, CSV import/error | `app/proyecto/add/page.tsx`, `financial-section-actions-menu.tsx`, `flip-profitability-table.tsx`, `property-profitability-table.tsx` |
| Renovation budget — mode chooser, draft save, approve & lock, total-only submit | `app/proyecto/[id]/budget/page.tsx`, `components/proyecto/unit-budget-editor.tsx` |
| Deck management — regenerate, open editor, copy link, open public view | `components/proyecto/project-deck-management-tab.tsx`, `components/proyecto/project-deck-editor-screen.tsx` |
| Commercial readiness — scope change, requirement toggle, CTA clicks | `components/proyecto/commercial-readiness-tab.tsx` |
| Documents — upload, delete, preview, download | `components/proyecto/project-documents-tab.tsx` |
| Gantt / timeline — zoom, export (json/png/pdf), fullscreen toggle | `components/proyecto/pipeline-gantt/pipeline-gantt-tab.tsx` |
| Checklist — viewed (with completion %), section changed, saved, submitted | `app/proyecto/[id]/checklist/page.tsx` |

### Still missing (priority order)

1. **Phase0 checklist** (`app/proyecto/[id]/phase0-checklist/page.tsx`) — save, submit
2. **Corrections panel** (`components/proyecto/project-corrections-panel.tsx`) — create, reply, resolve
3. **Unit breakdown tab** (`components/proyecto/unit-breakdown-tab.tsx`) — channel toggle (PropHero ↔ B2B2C)

### Property naming conventions for proyecto events

- Always include `project_id` and `kanban_phase`
- Use `from_X` / `to_X` for status/phase/tab transitions
- Use `is_autosave: boolean` to distinguish manual saves from programmatic ones
- Use `blocker: "checklist" | "financial" | "rentals"` for blocked actions
- Use `project_type: "yield" | "flip"` on all financial events
- Use `table: "flip" | "yield_nb"` on table tab events

### `switchTab` helper (proyecto PDP only)

`app/proyecto/[id]/page.tsx` exposes a `switchTab(next, project)` helper that wraps `setActiveTab` + `track(EVENTS.PROJECT_TAB_SWITCHED, ...)` in one call. Always use `switchTab` instead of bare `setActiveTab` for tab buttons in that file.

---

## Lessons learned — what NOT to do

These patterns caused zero-data events in the past:

| Mistake | Why it fails | Correct pattern |
|---------|-------------|-----------------|
| Calling `track()` inside an SSR component or server action | `typeof window === "undefined"` guard returns early | Only call `track()` inside `"use client"` components or hooks |
| Using `setActiveTab()` directly on tab buttons | State updates silently, no analytics | Wrap in a helper that also calls `track()` |
| Adding a constant to `events.ts` but forgetting the `track()` call | Event appears in autocomplete but never fires | Always grep for the constant after adding it |
| Tracking auto-saves and manual saves with the same event | Can't separate intent from background noise | Pass `is_autosave: boolean` or skip tracking auto-saves entirely |
| Not including `from_X` on transitions | Can't compute funnel drop-offs | Always include current state as `from_X` before changing it |
| Tracking inside the render, outside `useEffect` / handlers | Fires on every re-render | Only track in event handlers or `useEffect` with a stable dep |
| Tracking in a child component that has no `project_id` prop | Event arrives with no entity context | Either pass `project_id` down as a prop, or track in the parent that owns it |

---

## How to audit a new area for missing tracking

1. Open the page/component file.
2. Search for `onClick`, `onValueChange`, `onSubmit`, mutation `await` calls, `router.push`.
3. For each: does the handler call `track()`? If not, add it.
4. Check whether the component is `"use client"` — if not, move the `track()` call to the closest client boundary.
5. Add the new event constant to `events.ts` first, then use it.
6. Update `events-reference.md` with the new event, where it fires, and key properties.
