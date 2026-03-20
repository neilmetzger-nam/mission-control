# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Mission Control ("Orion OS") is an internal operations dashboard for an AI staffing agency ("NextGen Agency"). It's a filesystem-indexed document browser + project portfolio viewer. All data comes from markdown files with YAML frontmatter on disk and JSON files in `data/` — there is no database. The app is evolving toward a multi-page "Dave Console" (see `prompts/dave-console-v1.md` for the spec).

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, Next.js core-web-vitals + TypeScript rules)
- `npm run pm2:start` — Build and start with PM2 on port 3001
- No test framework is configured yet

## Stack

- **Next.js 16** (App Router) with **React 19**, **TypeScript 5**
- **Tailwind CSS v4** (uses `@import "tailwindcss"` syntax, PostCSS plugin)
- **gray-matter** for YAML frontmatter parsing
- **OpenAI SDK** (`openai`) for idea generation (`/api/idea/generate`)
- **Lucide React** for icons
- Dark-only theme (`bg-[#0a0a0a]`, zinc/blue/purple/green accents, CSS variables in `globals.css`)

## Architecture

### Routing & Pages

All routes use the Next.js App Router under `src/app/`. All page components are `"use client"`.

**Global pages:** `/` (dashboard), `/docs`, `/projects`, `/briefing`, `/calendar`, `/agents`, `/config`, `/infrastructure`, `/security`, `/memory`, `/review`, `/roadmap`, `/planner`, `/idea`, `/tracker`, `/engineering`

**Dynamic pages:** `/projects/[id]` (project detail with sprints/tasks), `/client/[id]` (legacy, deprecated)

**Project sub-routes:** `/projects/ai-r/{roadmap,sprint,timeline,ideas,research,issues,marketing,docs,settings}`, similar for `/projects/studio/` and `/projects/plateai/` (with `customers` and `leads`)

**Nested dynamic:** `/projects/[id]/agents`, `/projects/[id]/docs`, `/projects/[id]/review`, `/projects/[id]/sprints`

### API Routes (~25 endpoints under `src/app/api/`)

| Area | Endpoints | Notes |
|------|-----------|-------|
| Docs | `GET /api/docs`, `GET /api/docs/content?path=` | Filesystem scan + path-whitelisted content fetch |
| Projects | `GET /api/projects`, `POST /api/projects/create` | Reads/writes `data/projects.json` |
| Sprints | `GET /api/sprints/[id]`, `PATCH /api/sprints/[id]/task/[taskId]` | Per-project sprint data from `data/sprints/*.json` |
| Calendar | `GET/POST/PATCH /api/calendar` | CRUD on `data/calendar.json` |
| Review | `GET /api/review`, `PATCH /api/review/[id]` | `data/review-queue.json` |
| Agents | `GET /api/agents`, `GET /api/agent-activity` | Parses ROSTER.md from workspace |
| Roadmap | `GET /api/roadmap` | Aggregates sprint data across projects |
| Config | `GET /api/config`, `GET /api/config/critical-files` | Env var status + critical file checks |
| Workspace | `GET /api/workspace`, `GET /api/workspace/files` | Reads workspace markdown files + file tree |
| Planner | `GET/POST /api/planner` | Parses PLANNER.md, supports add/remove/toggle |
| Memory | `GET /api/memory` | Reads memory files from workspace |
| Infra | `GET/PATCH /api/infrastructure` | `data/infrastructure.json` |
| Security | `GET/PATCH /api/security`, `GET/POST /api/sentinel` | Checklist + Sentinel scan results |
| Ideas | `POST /api/idea/generate` | OpenAI GPT-4o integration |
| Other | `GET /api/tracker`, `GET /api/conflict`, `GET /api/vercel/env-status` | Various data reads |

**Cloud mode:** Many API routes check `NEXT_PUBLIC_IS_CLOUD === "true"` and return empty data when deployed to Vercel (this is a local-first tool).

### Data Layer

All persistent data lives in `data/`:
- `projects.json` — Project portfolio (6 projects with id, name, status, phase, stack, color)
- `calendar.json` — Events
- `review-queue.json`, `agent-activity.json`, `infrastructure.json`, `security.json`, `security-scan.json`, `conflicts.json`
- `sprints/*.json` — Per-project sprint data (ai-r, studio, plateai, time-trek, ember-azure, orion-mcp)

External filesystem reads from `~/.openclaw/workspace/` (workspace markdown: PLANNER.md, ROSTER.md, MEMORY.md, etc.) and `~/Desktop/AIR-Web/prompts`.

### Shared Components

- `src/components/Sidebar.tsx` — The only shared component. Contains hardcoded `GLOBAL_NAV` (10 routes) and `PROJECTS` (6 projects) arrays with collapsible sub-navigation. Fetches pending review count badge.
- All other sub-components (StatusBadge, HealthBar, MarkdownRenderer, TaskRow) are defined **inline within page files**, not extracted.
- Custom lightweight markdown parser built with regex (no external markdown library).

### Key Data Types

**DocEntry** — indexed markdown document: `path`, `title`, `project`, `type`, `tags`, `status` (ready/draft/shipped/archived), `audience` (all/neil/obie/claude-code), `created`, `summary`, `hasFrontmatter`.

### Deployment

- **Vercel** for production (configured via `vercel.json`)
- **PM2** for local persistent server (`ecosystem.config.js`, port 3001)
- No authentication on API routes (internal tool)

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Commit Convention

Commits follow `<type>: <description>` — e.g., `feat:`, `docs:`, `sync:`, `fix:`.
