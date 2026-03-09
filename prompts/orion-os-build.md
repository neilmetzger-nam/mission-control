# Orion OS — Mission Control Rebuild Spec

You are Claude Code working in ~/Desktop/mission-control.

This is a Next.js 16 app (App Router, Tailwind v4, TypeScript, no external DB — uses localStorage + API routes that read/write local JSON files in `data/` directory for now).

## What We're Building

Transform Mission Control into **Orion OS** — the operating system for a venture portfolio where AI agents build products and humans stay in the loop.

The core loop:
> Idea → Project Plan → Sprints → Agent Assignment → Agent Work → Human Review → Ship

---

## 1. Projects — Add All 6 Projects

Create `data/projects.json` with all 6 active projects (AI-R, PlateAI, Studio, Time Trek, Ember & Azure, Orion MCP). Each has: id, name, tagline, status, phase, url, repo, stack[], tags[], monetization, color.

---

## 2. Idea Intake → Project Plan Generator

New page: `src/app/idea/page.tsx`
- Full-width text area: "Describe your idea..."
- "Generate Project Plan" button
- POST to `/api/idea/generate`

API route: `src/app/api/idea/generate/route.ts`
- Call OpenAI gpt-4o with OPENAI_API_KEY env var
- System prompt: venture architect for Orion, generates structured project plan JSON
- Stack decision: Vercel-only (early/single-tenant) vs Vercel+Cloud Run (multi-tenant SaaS) vs Cloud Run primary (heavy AI compute)
- Always flag: does this need multi-tenancy? If multiple customers, YES
- Cross-reference existing Orion projects for shared capabilities (AI-R has Square payments, Clerk auth; PlateAI has menu intelligence; Studio has AI video gen; Time Trek has language learning; Orion MCP has agent orchestration)
- Return JSON: { name, tagline, problem, monetization{model,tiers,breakEvenUsers}, stack{recommendation,reason,multiTenant,services[]}, sharedCapabilities[], milestones[{id,name,description,sprints[{id,name,tasks[{id,title,assignee,effort,priority}]}]}], successMetrics[] }

Display result as structured view: name/tagline, monetization card, stack recommendation card (color-coded Vercel/Cloud Run badge), shared capabilities section, milestones accordion with sprints+tasks.

"Save as Project" button → POST to `/api/projects/create` → appends to `data/projects.json`, creates `data/sprints/{projectId}.json`

---

## 3. Sprint Board

`src/app/projects/[id]/sprints/page.tsx`
- Load from `data/sprints/{id}.json`
- Top: project name + phase badge + quick stats (total/done/in-progress/blocked)
- Milestone tabs
- Sprint cards with task list
- Task statuses: queued (gray) → agent-working (blue, pulse animation) → needs-review (yellow) → done (green) → blocked (red)
- Task row: title, assignee badge (🤖 Agent / 👤 Human / ❓ TBD), effort chip (S/M/L/XL), priority dot

---

## 4. Review Queue

`src/app/review/page.tsx`
- Load from `data/review-queue.json`
- Shows all tasks in `needs-review` status across all projects
- Each card: project badge, task title, what agent did, output link
- Action buttons: ✅ Approve / 🔄 Request Changes / ❌ Reject
- PATCH `/api/review/[id]` on action
- Show pending count badge on sidebar nav

---

## 5. Agent Activity Feed

`src/app/agents/page.tsx` (replace existing stub)
- Load from `data/agent-activity.json` — append-only log
- Timeline feed, newest first, filter by project
- Each entry: timestamp, agent name, project, action, status

---

## 6. Navigation Updates

Update sidebar in `src/app/layout.tsx`:
- 🏠 Dashboard (/)
- 💡 New Idea (/idea) — highlighted
- 📁 Projects (/projects)
- 🔄 Review Queue (/review) — with pending count badge
- 🤖 Agent Activity (/agents)
- 📊 Infrastructure (/infrastructure)
- 🧠 Memory (/memory)
- ⚙️ Config (/config)

---

## 7. Dashboard (/) Updates

Update `src/app/page.tsx`:
- Portfolio health bar: 6 projects, active tasks count, awaiting review count
- All 6 project cards with status + phase badge + quick links
- Review queue alert banner if items pending
- Last 5 agent activity entries
- Big prominent "💡 New Idea" button

---

## Data Layer

All data in `data/` directory at project root. API routes use Node `fs` to read/write (this is a local Mac mini tool, not public-facing).

Files:
- `data/projects.json`
- `data/sprints/{projectId}.json`
- `data/review-queue.json`
- `data/agent-activity.json`

---

## Seed Data

After building, seed realistic data:
- `data/projects.json`: all 6 projects
- `data/sprints/ai-r.json`: realistic current sprint breakdown for AI-R
- `data/review-queue.json`: 2 sample review items
- `data/agent-activity.json`: 5 sample activity entries

---

## Style

Keep existing dark theme (zinc-900/800/700). Tailwind v4 + lucide-react only (already installed). Smooth transitions, pulse animation for agent-working status.

---

When completely finished, run:
openclaw system event --text "Done: Orion OS Mission Control rebuild complete — idea intake, sprint board, review queue, agent feed, all 6 projects" --mode now
