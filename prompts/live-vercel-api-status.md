# Claude Code Prompt: Live API Status from Vercel
_Priority: P1 — eliminates manual status updates forever_

## Problem
API status table is hardcoded. Every time a key is added to Vercel, someone has to
manually update Mission Control. Nobody will remember. Build auto-detection instead.

## Solution
Pull Vercel env var names (not values — never expose secrets) via Vercel API.
Cross-reference against a known list of expected keys.
Show green if the key EXISTS in Vercel, red if missing.

## New API Route: GET /api/vercel/env-status

Use Vercel REST API to list env var names for the air-web-neil project.
Vercel API endpoint: GET https://api.vercel.com/v9/projects/{projectId}/env
Auth: Bearer token from VERCEL_TOKEN env var in Mission Control.

Response: for each expected key, return { key, exists: boolean, environments: string[] }

### Expected Keys to Check
```js
const EXPECTED_KEYS = [
  // Payments
  { key: "STRIPE_SECRET_KEY", label: "Stripe", category: "payments" },
  { key: "STRIPE_TERMINAL_LOCATION_ID", label: "Stripe Terminal Location", category: "payments" },
  { key: "SQUARE_ACCESS_TOKEN", label: "Square", category: "payments" },
  { key: "SQUARE_LOCATION_ID", label: "Square Location", category: "payments" },
  // Google
  { key: "GOOGLE_API_KEY", label: "Google APIs (Places/Business/Ads)", category: "google" },
  { key: "GEMINI_API_KEY", label: "Gemini AI", category: "google" },
  // Auth & DB
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", label: "Clerk Auth", category: "auth" },
  { key: "CLERK_SECRET_KEY", label: "Clerk Secret", category: "auth" },
  // AI
  { key: "ANTHROPIC_API_KEY", label: "Anthropic (Claude)", category: "ai" },
  { key: "OPENAI_API_KEY", label: "OpenAI", category: "ai" },
  { key: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID", label: "ElevenLabs", category: "ai" },
  // Infrastructure
  { key: "PI_BOX_URL", label: "Pi Print Server", category: "infra" },
  { key: "PLAID_CLIENT_ID", label: "Plaid", category: "fintech" },
];
```

## Settings Page Update
Replace the hardcoded API_STATUS array with a live fetch to /api/vercel/env-status.

Show:
- ✅ green if key exists in production
- ⚠️ yellow if exists in preview/dev but not production  
- 🔴 red if missing everywhere
- Loading spinner while fetching

Group by category: Payments | Google | Auth | AI | Infrastructure | Fintech

## Mission Control .env.local
Add to ~/Desktop/mission-control/.env.local:
```
VERCEL_TOKEN=        # Vercel personal access token
VERCEL_PROJECT_ID=   # air-web-neil project ID
```

## Instructions for Neil (show on Config page if token missing)
"To enable live API status: create a Vercel token at vercel.com/account/tokens
and add VERCEL_TOKEN + VERCEL_PROJECT_ID to Mission Control's .env.local"

## Acceptance Criteria
- [ ] /api/vercel/env-status returns live key existence data
- [ ] AI-R Settings page shows live status (no hardcoded data)
- [ ] Auto-refreshes every 60 seconds
- [ ] Grouped by category with counts ("Payments: 2/3 configured")
- [ ] Config page shows setup instructions if VERCEL_TOKEN missing
- [ ] Never exposes key VALUES — only existence (boolean)
