# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Mission Control is an internal operations dashboard for an AI staffing agency ("NextGen Agency"). It's a filesystem-indexed document browser + project portfolio viewer. All data comes from markdown files with YAML frontmatter on disk — there is no database. The app is evolving toward a multi-page "Dave Console" (see `prompts/dave-console-v1.md` for the spec).

## Commands

- `npm run dev` — Start dev server (localhost:3000)
- `npm run build` — Production build
- `npm run lint` — ESLint (flat config, Next.js core-web-vitals + TypeScript rules)
- No test framework is configured yet

## Stack

- **Next.js 16** (App Router) with **React 19**, **TypeScript 5**
- **Tailwind CSS v4** (uses `@import "tailwindcss"` syntax, PostCSS plugin)
- **gray-matter** for YAML frontmatter parsing
- **Lucide React** for icons
- Dark-only theme (`bg-[#0a0a0a]`, zinc/blue/purple/green accents)

## Architecture

### Routing & Pages

All routes use the Next.js App Router under `src/app/`:

| Route | File | Purpose |
|-------|------|---------|
| `/` | `page.tsx` | Home dashboard with project cards and agency stats |
| `/docs` | `docs/page.tsx` | Document library viewer with built-in markdown renderer |
| `/client/[id]` | `client/[id]/page.tsx` | Dynamic client detail pages (Studio, AI-R) with trackers |

All page components are `"use client"` — client-side rendered with React hooks for state.

### API Routes

| Endpoint | File | Purpose |
|----------|------|---------|
| `GET /api/docs` | `api/docs/route.ts` | Scans filesystem for markdown files, parses frontmatter, returns `DocEntry[]` |
| `GET /api/docs/content?path=` | `api/docs/content/route.ts` | Fetches full markdown content with path-whitelist security |

The docs API scans workspace paths under `~/.openclaw/workspace/agency/projects/{ai-r,studio}/` and `~/Desktop/AIR-Web/prompts`. Files without frontmatter get their type inferred from directory name or filename patterns (e.g., `research/` → type "research", filename containing "spec" → type "spec").

### Key Data Types

**DocEntry** — represents an indexed markdown document with fields: `path`, `title`, `project`, `type`, `tags`, `status` (ready/draft/shipped/archived), `audience` (all/neil/obie/claude-code), `created`, `summary`, `hasFrontmatter`.

**CLIENTS[]** — hardcoded array in page components with project metadata: agents, MCP tools, health scores, highlights, token spend tracking.

### Component Patterns

- Components are **collocated with routes** — no separate `components/` directory
- Reusable sub-components (StatusBadge, HealthBar, MarkdownRenderer) are defined inline within page files
- Custom lightweight markdown parser built with regex (no external markdown library) — handles headings, code blocks, blockquotes, lists, inline formatting
- Constants use UPPERCASE (`CLIENTS`, `AGENCY_STATS`, `ALLOWED_ROOTS`)

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Commit Convention

Commits follow `<type>: <description>` — e.g., `feat:`, `docs:`, `sync:`, `fix:`.
