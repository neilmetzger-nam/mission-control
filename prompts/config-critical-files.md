# Claude Code Prompt: Config Page — Critical Files Registry + AI-R Issues Fix
_Priority: P1 — run after project-settings_

## Part 1: Config Page — Critical Files Registry

Add a "Critical Files" section to the Config page (/config).

### Purpose
List all files that are irreplaceable. Claude Code must NEVER overwrite these without
explicit instruction. Visible reminder for both Neil and Dave.

### Display
A table with:
- File path (relative to home or workspace)
- What it contains
- Last modified date (read from filesystem via API)
- Status dot: green = exists, red = missing

### Critical Files to Register

| File | What It Contains |
|------|-----------------|
| ~/.openclaw/workspace/MEMORY.md | Dave's long-term memory — curated decisions, context, history |
| ~/.openclaw/workspace/agency/TRACKER.md | All project issues across AI-R and Studio |
| ~/.openclaw/workspace/agency/ROSTER.md | All agents across all projects |
| ~/.openclaw/workspace/agency/PORTFOLIO.md | All client projects |
| ~/.openclaw/workspace/agency/IDEAS.md | Future initiatives backlog |
| ~/.openclaw/workspace/agency/projects/ai-r/deadlines.md | Beta sprint deadlines |
| ~/.openclaw/workspace/agency/projects/ai-r/SPRINT-QUEUE.md | Sprint task queue |
| ~/Desktop/AIR-Web/prompts/ | All Claude Code prompts for AI-R |
| ~/Desktop/mission-control/prompts/ | All Claude Code prompts for Mission Control |

### API Route
GET /api/config/critical-files
- Reads each file path
- Returns: { path, label, exists, lastModified, sizeKb }

### Warning Banner
If any critical file is MISSING → show red warning banner at top of Config page:
"⚠️ Critical file missing: [path]"

---

## Part 2: AI-R Issues Page — Pull from TRACKER.md

Replace the placeholder at /projects/ai-r/issues with a real filtered view.

### What to Build
- Fetch from /api/tracker (already exists)
- Filter to project = "AI-R" only
- Same table UI as /tracker but scoped to AI-R
- Filter bar: All | Blocked | Ready | In Progress | Done | Backlog
- "Open in full tracker →" link at top right

### Same for Studio
- /projects/studio/issues — filter to project = "STUDIO"

### API Change
Add optional ?project=AI-R query param to /api/tracker
Returns only issues matching that project when param is provided.

## Acceptance Criteria
- [ ] Config page shows critical files table with green/red status dots
- [ ] Missing file triggers red warning banner
- [ ] /projects/ai-r/issues shows only AI-R issues from TRACKER.md
- [ ] /projects/studio/issues shows only Studio issues
- [ ] Status filter works on both pages
- [ ] "Open in full tracker" link works
