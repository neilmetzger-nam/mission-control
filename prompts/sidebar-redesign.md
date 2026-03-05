# Claude Code Prompt: Mission Control Sidebar Redesign
_Priority: P0 — run next_

## Goal
Reorganize the sidebar into Global → Projects → System sections.
Neil needs to visually see the structure — he can't navigate a flat list mentally.

## New Sidebar Structure

### Section: GLOBAL
- 📊 Dashboard → /
- 🧠 Memory → /memory
- 🤖 Agents → /agents

### Section: PROJECTS
Each project is an expandable item in the sidebar.
Click project name → expands inline to show sub-pages.
Active project stays expanded.

**AI-R** (🍽️) expands to:
  - 🎯 Sprint → /projects/ai-r/sprint
  - 📄 Docs → /projects/ai-r/docs
  - 🐛 Issues → /projects/ai-r/issues

**Studio** (🎬) expands to:
  - 🎯 Sprint → /projects/studio/sprint
  - 📄 Docs → /projects/studio/docs
  - 🐛 Issues → /projects/studio/issues

Projects are hardcoded for now (no dynamic loading needed).

### Section: SYSTEM
- ⚙️ Config → /config

---

## AI-R Sprint Page (/projects/ai-r/sprint)

This is the main new feature. Build a sprint board for the March 15 beta.

### Layout
- Header: "AI-R Beta Launch — March 15, 2026" + live countdown (days + hours)
- Two columns: Week 1 (left) | Week 2 (right)
- Progress bar per week: "X / 5 complete"

### Tasks (hardcode as initial data)

**Week 1 — Core Loop (due Mar 9):**
1. Beta onboarding flow (signup → login → welcome email → checklist) — Owner: Dave
2. Menu CSV upload → real data in dashboard — Owner: Dave
3. Invoice photo capture (snap → AI extracts costs) — Owner: Dave
4. Voice purchase logging ("8 bucks of carrots") — Owner: Dave
5. Dashboard kills all mocks — real data or empty states — Owner: Dave

**Week 2 — Wow Factor (due Mar 15):**
6. Delivery economics (upload DD/UE statement → real margins) — Owner: Dave
7. Plate costing (5-10 items, real food cost %) — Owner: Dave
8. Maestro voice demo working end-to-end — Owner: Dave
9. Beta landing page at ai-restaurant.net/beta — Owner: Dave
10. Stripe subscription wired (trial → paid) — Owner: Dave/Neil

### Task Card
Each task shows:
- Position number + title
- Status badge (click to cycle): 🔴 Not Started → 🟡 In Progress → 🟢 Done → ✅ Verified → 🔴
- Owner pill: Dave / Neil / Obie
- Last updated (relative: "2 hours ago")
- One-line notes field (click to edit inline)

### Persistence
Save state to localStorage (key: `air-sprint-tasks`).
No database needed — filesystem app, keep it simple.
Seed with the 10 tasks above on first load if localStorage is empty.

### Activity Log
Below the columns: last 5 status changes.
"Dave marked Invoice capture → Done — just now"
Store in localStorage (key: `air-sprint-activity`).

---

## Sidebar Component Changes

### Visual
- Add section labels (GLOBAL, PROJECTS, SYSTEM) as small uppercase zinc-500 labels
- Project rows have a chevron (▶/▼) indicating expand/collapse
- Sub-items indented with a left border accent line
- Active route highlighted as before

### State
- Expanded projects stored in localStorage (`mc-expanded-projects`)
- Auto-expand the project whose sub-route is currently active

---

## Files to Create/Modify
- `src/components/Sidebar.tsx` — full rewrite with sections + expandable projects
- `src/app/projects/ai-r/sprint/page.tsx` — new sprint board
- `src/app/projects/ai-r/docs/page.tsx` — placeholder (list of spec files)
- `src/app/projects/ai-r/issues/page.tsx` — placeholder
- `src/app/projects/studio/sprint/page.tsx` — placeholder
- Keep existing pages (/, /memory, /agents, /tracker, /config) unchanged

## Acceptance Criteria
- [ ] Sidebar shows 3 clear sections: GLOBAL, PROJECTS, SYSTEM
- [ ] AI-R and Studio expand/collapse in sidebar
- [ ] AI-R Sprint page loads at /projects/ai-r/sprint
- [ ] All 10 sprint tasks visible with correct week grouping
- [ ] Click status → cycles → persists to localStorage
- [ ] Countdown shows correct days to Mar 15
- [ ] Activity log updates on every status change
- [ ] Existing pages still work
