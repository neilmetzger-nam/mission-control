export default function BriefingPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-mono text-sm text-zinc-300 space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-white mb-1">AI-R Project Briefing</h1>
        <p className="text-zinc-500">Read this before starting any work. Last updated: auto.</p>
      </div>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## WHO YOU ARE</h2>
        <p>You are Claude Code working on AI-R — an AI-powered restaurant operating system replacing Toast/Square for independent restaurants. You are building in ~/Desktop/AIR-Web (Next.js 15, App Router, TypeScript, Tailwind v4, HeroUI v2, Drizzle ORM, Neon Postgres, Clerk auth, Vercel).</p>
        <p className="mt-2">You report to Dave (AI COO). Neil is the human founder. You build, Dave reviews, Neil approves PRs.</p>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## RULES</h2>
        <ul className="space-y-1 list-none">
          <li>- Never auto-merge. Always leave a PR for Neil to approve.</li>
          <li>- Never hardcode restaurant data. Always use restaurantId from context.</li>
          <li>- All DB tables must have restaurant_id for multi-tenancy.</li>
          <li>- Tailwind v4 + lucide-react only. No new UI libraries.</li>
          <li>- Dark zinc theme: zinc-900/800/700 backgrounds.</li>
          <li>- Working branch: feature/beta-onboarding. Never push to main directly.</li>
          <li>- Test files live in ~/Desktop/AIR-Web/tests/</li>
          <li>- If uncertain, write a comment and move on. Don&apos;t block on ambiguity.</li>          <li>- <strong>BEFORE ENDING ANY SESSION:</strong> Update ~/Desktop/mission-control/data/sprints/ai-r.json — mark completed tasks as done, add new tasks if built. No silent changes.</li>          <li>- Every feature built = sprint entry. Every bug fixed = sprint entry. Dave reads this to brief Neil each morning.</li>          <li>- <strong>Always git push after committing.</strong> Never leave commits unpushed. Vercel auto-deploys on push — if you don't push, nothing deploys.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## STACK</h2>
        <ul className="space-y-1">
          <li>- Frontend: Next.js 15 App Router, TypeScript, Tailwind v4, HeroUI v2</li>
          <li>- Auth: Clerk (middleware at middleware.ts)</li>
          <li>- DB: Neon Postgres via Drizzle ORM (schema at lib/db/schema.ts)</li>
          <li>- Payments: Square Terminal + Stripe WisePOS (lib/payments/terminal-adapter.ts)</li>
          <li>- MCP: orion-mcp.vercel.app (task queue, intent router, Pi queue)</li>
          <li>- Printing: Raspberry Pi at restaurant, polls MCP every 3s</li>
          <li>- Voice: ElevenLabs Maestro (agent_0001kc8gjjmkf55stbfh65ch5y7c)</li>
          <li>- Deploy: Vercel (branch: feature/beta-onboarding → preview, main → prod)</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## KEY FILES</h2>
        <ul className="space-y-1">
          <li>- lib/db/schema.ts — Drizzle schema (all tables)</li>
          <li>- lib/payments/terminal-adapter.ts — Square + Stripe unified interface</li>
          <li>- lib/printers/routing-config.ts — 7 printer stations</li>
          <li>- app/(main)/home/ — Owner dashboard pages</li>
          <li>- app/(pwa)/ — Tableside PWA (phone + iPad modes)</li>
          <li>- app/(public)/ — Gloria ordering page (public, no auth)</li>
          <li>- app/api/demo/ — All API routes</li>
          <li>- middleware.ts — Clerk auth + public route bypass</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## RED BAR SUSHI (TEST RESTAURANT)</h2>
        <ul className="space-y-1">
          <li>- restaurantId: 7</li>
          <li>- Tax rate: 6.5% (Leesburg VA)</li>
          <li>- 527 menu items, 24 categories</li>
          <li>- 7 printers: Thai Receipt (.239), Thai Kitchen (.238), Japan Kitchen (.231), Sushi Bar (.234), Expo (.237), Bar (.172), Host Stand (.229) — all port 9100</li>
          <li>- Square Terminal device ID: env SQUARE_TERMINAL_DEVICE_ID</li>
          <li>- Pi at restaurant: polls orion-mcp.vercel.app/api/pi/heartbeat every 3s</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## CURRENT SPRINT — START HERE</h2>
        <p className="text-amber-400">Read the active sprint before writing any code:</p>
        <ul className="space-y-1 mt-2">
          <li>- Roadmap: <a href="/projects/ai-r/roadmap" className="text-indigo-400 underline">localhost:3001/projects/ai-r/roadmap</a></li>
          <li>- Timeline: <a href="/projects/ai-r/timeline" className="text-indigo-400 underline">localhost:3001/projects/ai-r/timeline</a></li>
          <li>- Sprint files: ~/Desktop/mission-control/data/sprints/ai-r.json</li>
          <li>- Docs: ~/Desktop/AIR-Web/docs/specs/</li>
          <li>- Claude Code prompts: ~/.openclaw/workspace/prompts/</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## MCP TASK QUEUE</h2>
        <ul className="space-y-1">
          <li>- Base URL: https://orion-mcp.vercel.app</li>
          <li>- Auth header: x-orion-key (value in env ORION_INTERNAL_KEY)</li>
          <li>- POST /api/tasks — create task with natural language intent</li>
          <li>- GET /api/tasks?restaurantId=7 — list tasks</li>
          <li>- POST /api/tasks/confirm — confirm/cancel destructive actions</li>
          <li>- POST /api/pi/queue — queue a print job</li>
          <li>- GET /api/pi/config?restaurantId=7 — full restaurant config</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## WHAT NOT TO TOUCH</h2>
        <ul className="space-y-1">
          <li>- lib/payments/terminal-adapter.ts — payments are working, don&apos;t break them</li>
          <li>- app/api/demo/square/terminal/ — Square Terminal routes, working in prod</li>
          <li>- Any file with &quot;// DO NOT MODIFY&quot; comment</li>
          <li>- .env.local — never read or log env vars</li>
          <li>- SECRETS.md — never read this file</li>
        </ul>
      </section>

      <section>
        <h2 className="text-indigo-400 font-bold mb-2">## WHEN YOU FINISH A TASK</h2>
        <ul className="space-y-1">
          <li>1. Run: npm run build — must pass with zero errors</li>
          <li>2. Commit to feature/beta-onboarding with a clear message</li>
          <li>3. Push — Vercel auto-deploys preview</li>
          <li>4. Output a summary: what you built, files changed, how to test</li>
          <li>5. Flag anything Neil needs to test at Red Bar (hardware, printing, payments)</li>
        </ul>
      </section>

    </div>
  );
}
