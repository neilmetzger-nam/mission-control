# Dave Console — Mission Control Rebuild

Rebuild this Next.js app from a single-page dashboard into a multi-page "Dave Console" — a management UI for an AI agent (Dave) and his projects.

## Current State
- Single page at `src/app/page.tsx` with hardcoded data arrays (CLIENTS, AGENCY_STATS)
- Next.js 15, Tailwind, Lucide icons, dark theme (#0a0a0a bg, zinc cards, blue/purple accents)
- No database — all data comes from reading markdown files on disk via API routes

## Architecture

### Layout
- **Sidebar nav** (collapsible on mobile): logo + nav links + status indicator
- **Main content area** with page header + content
- Keep the dark theme exactly as-is

### Pages to Build

**1. `/` — Dashboard (simplify current page)**
- 2 project cards (Studio, AI-R) — keep but make them compact, clickable
- 4 stat boxes (agents, tools, learnings, sessions) — keep
- Remove the doc library link and long intelligence panel text
- Add a "Recent Activity" feed (reads from latest memory/*.md file)

**2. `/memory` — Memory Browser**
- Left: list of all files in Dave's workspace `memory/` directory, sorted by date desc
- Right: rendered markdown content of selected file
- Also show MEMORY.md at the top as "Long-Term Memory"
- Search box that filters files by content
- API route: `GET /api/memory` — reads files from disk, returns list + content

**3. `/projects` — Project Hub**  
- Cards for each project with status, description, key links
- Data source: read from `/agency/PORTFOLIO.md` and `/agency/projects/` directory
- Each card links to project detail (future page, just link to # for now)

**4. `/agents` — Agent Roster**
- Table/grid of all agents across projects
- Columns: name, emoji, project, domain, status, version
- Data source: read from `/agency/ROSTER.md`
- API route: `GET /api/agents` — parses ROSTER.md markdown table

**5. `/config` — Configuration**
- Show which env vars are set (check process.env, show ✅/❌, NEVER show values)
- Key list: ANTHROPIC_API_KEY, OPENAI_API_KEY, CLERK_SECRET_KEY, SQUARE_ACCESS_TOKEN, STRIPE_SECRET_KEY, ELEVENLABS_API_KEY, NEON_DATABASE_URL, BRAVE_API_KEY
- Show installed skills (read from ~/.nvm/versions/node/v22.21.1/lib/node_modules/openclaw/skills/)
- Show cron jobs if possible (read from openclaw CLI or just link to docs)

**6. `/tracker` — Issue Tracker**
- Parse and display `/agency/TRACKER.md`
- Filter by project (Studio, AI-R), status (blocked, ready, in-progress, done, backlog)
- Color-coded status badges matching the emoji key in the file
- API route: `GET /api/tracker` — parses TRACKER.md

### API Routes Pattern
All API routes read from Dave's workspace at: `/Users/neilmetzger/.openclaw/workspace/`

```typescript
// Example: GET /api/memory
import fs from 'fs';
import path from 'path';

const WORKSPACE = '/Users/neilmetzger/.openclaw/workspace';

export async function GET() {
  const memoryDir = path.join(WORKSPACE, 'memory');
  const files = fs.readdirSync(memoryDir)
    .filter(f => f.endsWith('.md'))
    .sort()
    .reverse();
  // ... return file list + content
}
```

### Technical Requirements
- Next.js App Router
- Tailwind CSS (already configured)
- Lucide icons (already installed)
- No new dependencies unless absolutely needed
- Mobile-responsive (sidebar collapses to hamburger)
- Dark theme only — no light mode
- All data from markdown files on disk — no database

### Sidebar Nav
```
🧠 Dave Console

📊 Dashboard
🧠 Memory
📁 Projects  
🤖 Agents
📋 Tracker
⚙️ Config
```

### Don't
- Don't add authentication
- Don't add a database
- Don't change the color scheme
- Don't over-engineer — this is an internal tool, not a product

### Do
- Make it fast and clean
- Reuse the existing component patterns (StatusBadge, HealthBar)
- Keep components in `src/components/`
- Keep API routes in `src/app/api/`

Commit after each page is working: "feat: add [page name] to Dave Console"
Final commit: "feat: Dave Console v1 — sidebar nav + 6 pages"
