# Claude Code Prompt: Per-Project Settings Pages
_Priority: P1 — run after sidebar-redesign_

## Goal
Each project in the sidebar gets its own Settings sub-page with URLs, contacts,
deadlines, and environment info. Everything about a project lives inside that project.

## Add to Sidebar (under each project)
AI-R ▼
  🎯 Sprint → /projects/ai-r/sprint
  📄 Docs → /projects/ai-r/docs
  🐛 Issues → /projects/ai-r/issues
  ⚙️ Settings → /projects/ai-r/settings   ← NEW

Studio ▼
  🎯 Sprint → /projects/studio/sprint
  📄 Docs → /projects/studio/docs
  🐛 Issues → /projects/studio/issues
  ⚙️ Settings → /projects/studio/settings  ← NEW

---

## AI-R Settings Page (/projects/ai-r/settings)

### Sections:

**Environments**
| Label | URL | Status |
|---|---|---|
| Production | https://ai-restaurant.net | ping on load → green/red dot |
| Vercel Dev | https://air-web-neil-neil-metzgers-projects.vercel.app | ping on load |
| Local Dev | http://localhost:3001 | ping on load |

**Key Contacts**
- Neil Metzger — Owner / Product (neil@...) 
- Obie — Engineering / Cloud Run (his swim lane: backend + Cloud Run only)

**Infrastructure**
- Pi Print Server: http://192.168.1.74:3333/status — ping on load → show live status
- Dev Server: http://192.168.1.78:3000/pwa — ping on load
- Neon DB: Connected (show from env or hardcode "Neon Postgres")
- Vercel Project: air-web-neil

**Sprint Deadline**
- Beta Launch: March 15, 2026 (live countdown)

**Payment**
- Square: ✅ Connected (Production)
- Stripe: ✅ Key set (terminal location needed)
- STRIPE_TERMINAL_LOCATION_ID: ⚠️ Missing

**Third-Party API Status**
| API | Status |
|---|---|
| UberEats Marketplace | ⏳ Applied 2/22/26 — pending |
| Grubhub Marketplace | ⏳ Applied — pending |
| DoorDash Marketplace | 🔴 Not applied |
| DoorDash Drive | ✅ Portal active — needs sandbox test |
| OpenTable | ⏳ Applied — pending |
| Plaid | ✅ Approved |
| ElevenLabs | ✅ Connected |
| Clerk | ✅ Connected |

---

## Studio Settings Page (/projects/studio/settings)

### Sections:

**Environments**
- Prompt Studio: http://localhost:3001 — ping on load
- Production: https://ai-promptstudio.net — ping on load

**Infrastructure**
- OpenArt Worker: `pnpm run worker` from BuilderIO repo
- Source: ~/Desktop/BuilderIO/

**Engine Roster**
| Agent | Engine | Status |
|---|---|---|
| Rex | Kling | Active |
| Mira | Hailuo | Active |
| Sage | Seedream | Active |
| Echo | Seedance | Active |
| Nova | Veo | Active |
| Zip | Nano | Active |

---

## Implementation Notes
- All data hardcoded as constants in each settings page (no DB needed)
- Ping checks use fetch() with a short timeout (3s) — show spinner → green/red dot
- Settings pages are read-only for now (no editing)
- Clean table layout, dark theme matching rest of app

## Files to Create
- `src/app/projects/ai-r/settings/page.tsx`
- `src/app/projects/studio/settings/page.tsx`
- Update `src/components/Sidebar.tsx` to add Settings under each project

## Acceptance Criteria
- [ ] Settings sub-item appears under both AI-R and Studio in sidebar
- [ ] AI-R settings shows all sections above
- [ ] Ping checks run on page load — URLs show live green/red status
- [ ] Pi server status visible on AI-R settings page
- [ ] API status table shows correct states for all third-party APIs
- [ ] Studio settings shows engine roster + environment status
