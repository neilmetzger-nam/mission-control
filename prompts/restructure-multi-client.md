# Prompt: Mission Control — Multi-Client Architecture

## Goal

Restructure Mission Control from a single-page dashboard into a multi-page app with a portfolio home and per-client project dashboards. Each client gets a scoped view. Access is URL-based for now (full auth later).

---

## Route Architecture

```
/                    Portfolio home — all clients, high-level
/client/ai-r         AI-R full dashboard (Obie + Neil)
/client/studio       Studio full dashboard (Neil only)
```

---

## Page 1: Portfolio Home (`/`)

**Neil's home base. Clean, crisp, no clutter.**

### Layout
- Top: Agency header — "NextGen Agency" + tagline + today's date
- Middle: Client portfolio cards (one per client)
- Bottom: Agency-level intelligence panel

### Client Cards
Each card shows:
- Client name + icon + vertical (e.g., "Restaurant Management")
- Status badge (active / onboarding / planned)
- 3 key metrics: Agents active, MCP tools, Health score
- 2-3 highlight bullets (latest wins or blockers)
- "Open Dashboard →" button → links to `/client/[id]`

Keep cards minimal. Details live inside the client dashboard.

### Agency Intelligence Panel
Below the client cards — a slim panel showing cross-project value:

```
🧠 Agency Knowledge Layer
─────────────────────────────────────────────────────
  Total agent learnings: 43      Shared across projects: 12
  MCP tools built: 39            Reusable patterns: 7
  Claude Code sessions: 23       Avg session: ~45 min
```

This represents the "rising tide" — as each project grows, the agency's shared knowledge and reusable patterns grow with it. Humans see their own project details; the system benefits from all of them.

### No issue tracker on home. No activity feed. No token spend breakdown.
Just the portfolio overview and the intelligence summary.

---

## Page 2: Per-Client Dashboard (`/client/[id]`)

**The full dashboard. Currently exists as the single page — move all content here.**

Use tabs or sections to organize. Suggested sections:

1. **Overview** — client summary, health, highlights, key metrics
2. **Issues** — full issue tracker for this project only
3. **Agents** — agents assigned to this project only
4. **MCP** — MCP deployments for this project
5. **Activity** — recent activity for this project
6. **Claude Code** — session log for this project

All data is filtered to the specific client. An AI-R viewer never sees Studio data, even if they know the Studio URL.

For access control (simple, no auth yet):
- Add a comment block at the top of each client page: `// ACCESS: neil, obie` or `// ACCESS: neil`
- This is documentation-level for now — real auth (Clerk or simple password) can be added later
- Obie gets the `/client/ai-r` URL. He doesn't need to know `/client/studio` exists.

### Back navigation
Clean breadcrumb at top: `← Agency Portfolio` → links back to `/`

---

## Page 3: Knowledge Layer (optional, `/intelligence`)

**Optional stretch goal — skip if time-constrained.**

A read-only view of what's been learned and shared across projects:
- Agent learnings by topic (MCP patterns, prompt engineering, architecture decisions)
- Reusable MCP tool specs that were built for one project and can apply to others
- Claude Code patterns that worked well
- Cross-project timeline (when did AI-R benefit from Studio learnings, or vice versa)

This page is Neil-only. It's the meta-view of the agency's accumulated intelligence.

---

## Data Scoping

Move all the data constants to a shared data file: `src/data/agency.ts`

Structure:

```typescript
// src/data/agency.ts

export const AGENCY = {
  name: "NextGen Agency",
  tagline: "AI-first staffing agency — building, deploying, and operating AI agents",
};

export const CLIENTS = [...]; // all clients

// Each client has an id. Filter everything else by clientId.

export const AGENTS = [...]; // all agents, each has: project field
export const ISSUES = [...]; // all issues, each has: project field
export const ACTIVITY = [...]; // all activity, each has: project field
export const CLAUDE_CODE_LOG = [...]; // each has: project field
export const MCP_DEPLOYMENTS = [...]; // each has: project field
```

On each client page, filter all arrays by `project === clientId`.

---

## Navigation

Simple top nav on all pages:
- `NextGen Agency` logo/wordmark (links to `/`)
- Breadcrumb when inside a client dashboard

No sidebar. Clean top bar only.

---

## Styling

Keep existing dark theme, HeroUI components, Tailwind. Don't change the visual language — just restructure the layout into pages.

---

## Files to Create/Modify

- **Create:** `src/data/agency.ts` — move all data constants here, keep existing data intact
- **Modify:** `src/app/page.tsx` — replace with portfolio home (client cards + intelligence panel)
- **Create:** `src/app/client/[id]/page.tsx` — per-client dashboard (move all current content here, filtered by clientId)
- **Create:** `src/app/client/[id]/layout.tsx` — layout with back nav + client header
- **Optionally create:** `src/app/intelligence/page.tsx` — agency knowledge layer view

---

## Important

- Keep ALL existing data. Don't delete anything — just move it to `src/data/agency.ts` and filter it per client.
- The AI-R client page should look nearly identical to the current single-page dashboard, just scoped.
- The home page should be dramatically simpler than the current page — cards only, no tables.
- Don't add auth yet. URL-based scoping is sufficient for now.
