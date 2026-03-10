"use client";

import { useState } from "react";
import { X, ExternalLink, AlertTriangle, Link2, CheckCircle2, Circle } from "lucide-react";

type Status = "done" | "in-progress" | "planned" | "blocked";
type Owner = "Obie" | "Claude Code" | "Dave" | "Neil";

interface SprintTask {
  title: string;
  done: boolean;
  notes?: string;
}

interface Sprint {
  id: string;
  name: string;
  owner: Owner;
  status: Status;
  weekStart: number;
  durationWeeks: number;
  tasks: SprintTask[];
  dependsOn?: string[];
  feature: string;
  description?: string;
  blockers?: string[];
  links?: { label: string; href: string }[];
  promptFile?: string;
  notes?: string;
}

const SPRINTS: Sprint[] = [
  {
    id: "menu-upload", name: "Menu Upload + Parser", owner: "Obie", status: "done",
    weekStart: -8, durationWeeks: 1, feature: "Menu Management",
    description: "Ingests Square CSV export, parses 527 items across 24 categories, seeds Neon DB.",
    tasks: [
      { title: "Square CSV parser", done: true },
      { title: "527-item Red Bar menu seeded", done: true },
      { title: "24 categories organized", done: true },
    ],
    links: [{ label: "Demo wizard", href: "/projects/ai-r/docs" }],
  },
  {
    id: "menu-photos", name: "Food Photos + AI Analysis", owner: "Dave", status: "done",
    weekStart: -6, durationWeeks: 2, feature: "Menu Management",
    description: "650+ Red Bar Sushi photos synced from Google Drive to Shopify CDN. Claude Vision identifies dishes and matches to menu items.",
    tasks: [
      { title: "Google Drive → Shopify CDN sync", done: true },
      { title: "Claude Vision ID + upload (haiku)", done: true },
      { title: "Liam LLM menu analysis", done: true },
      { title: "imageUrl column added to MenuItem table", done: true },
    ],
    notes: "Cache at scripts/pegasus-cache.json — safe to resume if interrupted.",
  },
  {
    id: "pos-core", name: "POS Core + Payments", owner: "Obie", status: "done",
    weekStart: -5, durationWeeks: 2, feature: "POS / Tableside",
    description: "Full tableside PWA with seat tracking, split checks, Square Terminal, Stripe WisePOS, and autocomplete tipping.",
    tasks: [
      { title: "PWA shell (SwipeContainer, tabs)", done: true },
      { title: "Table + seat assignment", done: true },
      { title: "Order by seat, PAID badges + strikethrough", done: true },
      { title: "Split check flow", done: true },
      { title: "Square Terminal integration", done: true },
      { title: "Stripe WisePOS integration", done: true },
      { title: "Tableside tipping (autocomplete + smart_tipping)", done: true },
      { title: "Terminal adapter (Square + Stripe unified interface)", done: true },
    ],
    notes: "Tip flow: Square finalizes base+tip in one shot. No server-side capture needed. Portal pattern used for PosModal + PaymentModal to escape SwipeContainer CSS transform.",
  },
  {
    id: "pi-queue", name: "Pi MCP Print Queue", owner: "Dave", status: "done",
    weekStart: -2, durationWeeks: 1, feature: "Kitchen Printing",
    description: "Pi polls MCP outbound every 3s — no ngrok, no tunnels, no static IPs. Remote print from home confirmed working.",
    tasks: [
      { title: "POST /api/pi/heartbeat — Pi checks in, gets queued jobs", done: true },
      { title: "POST /api/pi/queue — app submits print jobs", done: true },
      { title: "POST /api/pi/confirm — Pi confirms printed/failed", done: true },
      { title: "GET /api/pi/status", done: true },
      { title: "GET /api/pi/config — full restaurant config on boot", done: true },
      { title: "pi-poller.sh v2 — ESC/POS, all 7 printer IPs", done: true },
      { title: "Thai receipt confirmed printing via MCP queue", done: true },
    ],
    notes: "Pi hardcoded values: MCP_URL, RESTAURANT_ID, PI_AUTH_TOKEN. Everything else pulled from /api/pi/config on boot.",
    links: [{ label: "Pi SSH", href: "#" }],
  },
  {
    id: "mcp-v2", promptFile: "prompts/claude-code-mcp-v2-task-queue.md", name: "MCP v2 Task Queue + Intent Router", owner: "Dave", status: "done",
    weekStart: 0, durationWeeks: 1, feature: "MCP Task Queue",
    description: "The nervous system of the platform. Natural language in → classified task → right agent → confirmation if destructive.",
    tasks: [
      { title: "POST /api/tasks — create + classify intent", done: true },
      { title: "Intent router (natural language → taskType)", done: true },
      { title: "Agent router (taskType → Liam/Magellan/Molly/Maestro/Dave)", done: true },
      { title: "Confirmation queue with 60s TTL auto-cancel", done: true },
      { title: "Destructive action detection — 2 layers (taskType + raw intent string)", done: true },
      { title: "Role-based delegation schema (Owner → GM → Manager)", done: true },
      { title: "LLM routing + model config endpoints (bonus)", done: true },
      { title: "Agent briefs + audit logs (bonus)", done: true },
    ],
    notes: "Test: POST /api/tasks with intent='delete all sushi items' → needsConfirmation: true, taskType: menu_delete, agent: Liam.",
    links: [{ label: "orion-mcp.vercel.app", href: "https://orion-mcp.vercel.app" }],
  },
  {
    id: "maestro-v2", name: "Maestro 3-Phase Prompt", owner: "Dave", status: "done",
    weekStart: 0, durationWeeks: 1, feature: "Maestro",
    description: "Maestro detects caller phase in first 30 seconds and adapts: Explorer (wow them), Buyer (remove friction), Operator (COO mode).",
    tasks: [
      { title: "Explorer phase — one quick win, no feature lists", done: true },
      { title: "Buyer phase — clear path, one step at a time", done: true },
      { title: "Operator phase — real-time ops via create_task", done: true },
      { title: "Trust model + confirmation for destructive actions", done: true },
      { title: "Role-based delegation (Owner → GM → Manager)", done: true },
      { title: "turn_eagerness: patient", done: true },
    ],
    notes: "Deployed to agent_0001kc8gjjmkf55stbfh65ch5y7c via ElevenLabs API.",
  },

  // IN PROGRESS
  {
    id: "multitenancy", name: "Multi-tenancy DB Migration", owner: "Obie", status: "in-progress",
    weekStart: 0, durationWeeks: 1, feature: "Infrastructure",
    description: "9 tables are missing restaurant_id. Without this, data from multiple restaurants can bleed together.",
    tasks: [
      { title: "modifier_options", done: false },
      { title: "menu_item_modifier_groups", done: false },
      { title: "recipes + recipe_ingredients", done: false },
      { title: "purchase_order_items", done: false },
      { title: "floor_plan_elements", done: false },
      { title: "transaction_items + payments + transaction_discounts", done: false },
      { title: "integration_sync_logs", done: false },
      { title: "Query audit across all affected endpoints", done: false },
    ],
    blockers: ["Blocks: printer config DB migration", "Blocks: second restaurant onboarding"],
    notes: "Sentinel flagged this as 9 MEDIUM findings. Sentinel score currently 10/100 — this sprint alone gets us to ~50.",
  },
  {
    id: "two-device", name: "Two-Device PWA Mode", owner: "Obie", status: "in-progress",
    weekStart: 0, durationWeeks: 1, feature: "POS / Tableside",
    description: "Phone = server mode (voice-first, their tables only). iPad = station mode (shared, split checks, Manager PIN on Tab 4).",
    tasks: [
      { title: "Phone server mode — login required, Maestro, upsells", done: false },
      { title: "iPad station mode — shared, no login, tabs 1-3 open", done: false },
      { title: "Manager PIN gate (Tab 4)", done: false },
    ],
    notes: "Spec at prompts/pwa-two-device-modes.md. Both modes must be demo-ready for Red Bar pitch.",
    links: [{ label: "Two-device spec", href: "/memory?file=prompts/pwa-two-device-modes.md" }],
  },
  {
    id: "gloria-cart", name: "Gloria Cart + Checkout", owner: "Obie", status: "in-progress",
    weekStart: 0, durationWeeks: 2, feature: "Online Ordering",
    description: "Cart flow, Stripe online payment, order confirmation email. Gloria page is live but non-transactional.",
    tasks: [
      { title: "Cart state management", done: false },
      { title: "Stripe online payment flow", done: false },
      { title: "Order confirmation email", done: false },
      { title: "Order injected to kitchen queue", done: false },
    ],
    blockers: ["Needs Stripe online keys (not terminal keys)"],
  },

  // PLANNED
  {
    id: "receipts", name: "Receipt System", owner: "Claude Code", status: "planned",
    weekStart: 1, durationWeeks: 1, feature: "Receipt System",
    description: "Three receipt types: Customer Bill (itemized + QR pay), Auth Slip x2 (tip + signature + QR review), Kitchen Ticket x4 (course-sorted, double-height, bold mods).",
    tasks: [
      { title: "Customer bill — itemized + QR pay link", done: false },
      { title: "Auth slip — tip box + signature line + QR review", done: false },
      { title: "Kitchen ticket — course-sorted, double-height header, bold mods", done: false },
      { title: "ESC/POS renderer (Init, cut, center, box W=44 margins=2)", done: false },
    ],
    notes: "ESC/POS constants confirmed: Init=\\x1b\\x40, cut=\\x1b\\x64\\x00, double-height=\\x1b\\x21\\x30, center=\\x1b\\x61\\x01. Prompt at prompts/print-routing-receipts.md.",
    links: [{ label: "Receipt spec", href: "/memory?file=prompts/print-routing-receipts.md" }],
  },
  {
    id: "pi-prod", name: "Pi Production Hardening", owner: "Dave", status: "planned",
    weekStart: 1, durationWeeks: 1, feature: "Kitchen Printing",
    description: "Make Pi bulletproof for production deployment. Auto-start, offline fallback, smart routing, zero-touch setup.",
    tasks: [
      { title: "systemd service (auto-start on boot)", done: false },
      { title: "Local config cache (offline fallback mid-shift)", done: false },
      { title: "Smart routing: direct Pi when on LAN (~50ms) vs MCP queue when remote (~3s)", done: false },
      { title: "Auto-discovery → push scan to MCP on boot", done: false },
      { title: "Pi URL auto-pushed to restaurant config on registration", done: false },
      { title: "Pre-ship Pi setup script (zero-touch for new restaurants)", done: false },
    ],
  },
  {
    id: "auth-wire", name: "Wire Auth Middleware", owner: "Claude Code", status: "planned",
    weekStart: 1, durationWeeks: 1, feature: "Security",
    description: "lib/auth.ts exists with requireInternalAuth() but it's not called in any route handler yet. One sprint, high security impact.",
    tasks: [
      { title: "Wire requireInternalAuth() into all orion-mcp route handlers", done: false },
      { title: "Re-run Sentinel scan", done: false },
      { title: "Target Sentinel score 60+", done: false },
    ],
    blockers: ["Currently all routes are unauthenticated — anyone with the URL can call them"],
    notes: "lib/auth.ts exists at ~/Desktop/orion-mcp/lib/auth.ts. Prompt at prompts/claude-code-sentinel.md.",
    links: [{ label: "Sentinel prompt", href: "/memory?file=prompts/claude-code-sentinel.md" }],
  },
  {
    id: "printer-db", name: "Printer Config → Neon DB", owner: "Obie", status: "planned",
    weekStart: 2, durationWeeks: 1, feature: "Printer Setup",
    description: "Printer config currently in localStorage — lost every time the URL changes (Vercel preview deploys). Move to Neon so config persists.",
    tasks: [
      { title: "Printer config table in Neon (with restaurant_id)", done: false },
      { title: "API: GET/POST /api/printers for tenant", done: false },
      { title: "PWA settings page syncs to DB instead of localStorage", done: false },
      { title: "Test settings survive across Vercel preview URL changes", done: false },
    ],
    dependsOn: ["multitenancy"],
    blockers: ["Blocked by multi-tenancy migration (needs restaurant_id on table)"],
  },
  {
    id: "dashboard-v2", name: "Owner Dashboard V2", owner: "Claude Code", status: "planned",
    weekStart: 2, durationWeeks: 1, feature: "Owner Dashboard",
    description: "3-page architecture: Command Center (/home), Action Center (/inbox), Numbers Room (/numbers).",
    tasks: [
      { title: "Command Center — KPIs, alerts, quick actions", done: false },
      { title: "Action Center — inbox, agent tasks, pending confirmations", done: false },
      { title: "Numbers Room — revenue waterfall, delivery fees, P&L", done: false },
      { title: "Revenue waterfall uses plain English (What's Left / Prime)", done: false },
    ],
    notes: "Prompt at prompts/owner-dashboard-v2.md (17KB) — ready for Claude Code.",
  },
  {
    id: "liam-ops", name: "Liam Live Ops (86 + Specials)", owner: "Claude Code", status: "planned",
    weekStart: 2, durationWeeks: 1, feature: "Liam",
    description: "Liam executes real-time kitchen ops via MCP task queue — 86 items, add specials, proactive low-stock alerts.",
    tasks: [
      { title: "86 item via MCP task (menu_86_item)", done: false },
      { title: "Add special via MCP task (menu_add_special)", done: false },
      { title: "Proactive low-stock alert push to owner", done: false },
      { title: "Liam responds via Maestro voice confirmation", done: false },
    ],
    dependsOn: ["mcp-v2"],
  },
  {
    id: "cfo-view", name: "CFO View (P&L + Food Cost)", owner: "Claude Code", status: "planned",
    weekStart: 3, durationWeeks: 2, feature: "CFO View",
    description: "Full P&L view, food cost % by category, labor cost tracking. Teaches owners to think in margins not just revenue.",
    tasks: [
      { title: "Full P&L view", done: false },
      { title: "Food cost % by category (using recipe table)", done: false },
      { title: "Labor cost tracking", done: false },
      { title: "Delivery commission reframed as Customer Acquisition cost", done: false },
    ],
    notes: "Cost savings calculator and delivery reconciliation already done. This is the full P&L layer on top.",
  },
  {
    id: "onboarding-spec", name: "3-Track Onboarding", owner: "Claude Code", status: "planned",
    weekStart: 3, durationWeeks: 2, feature: "Onboarding",
    description: "Three tracks: Operations, Revenue, Channels. Menu is always center. 7-min self-serve pipeline for new restaurants.",
    tasks: [
      { title: "Operations track — printers, staff, floor plan", done: false },
      { title: "Revenue track — delivery fees, loyalty, CFO view", done: false },
      { title: "Channels track — website, DoorDash, UberEats", done: false },
      { title: "Go Live button → clean JSON to production DB", done: false },
      { title: "Maestro onboarding flow (Buyer phase)", done: false },
    ],
    notes: "Spec: agency/projects/ai-r/docs/restaurant-intake-pipeline.md",
    links: [{ label: "Intake pipeline spec", href: "/memory?file=agency/projects/ai-r/docs/restaurant-intake-pipeline.md" }],
  },
  {
    id: "inventory", name: "Inventory + Smart Specials", owner: "Claude Code", status: "planned",
    weekStart: 4, durationWeeks: 2, feature: "Inventory",
    description: "Recipe costs, expiring inventory alerts, smart specials engine: expiring item → auto-special → auto-ad.",
    tasks: [
      { title: "Recipe table in DB (with restaurant_id)", done: false },
      { title: "Food cost % per item from recipe", done: false },
      { title: "Expiring inventory alerts", done: false },
      { title: "Smart special: expiring → auto-special → auto-ad", done: false },
      { title: "Delivery Conversion Engine: bag insert → call → 25% off direct", done: false },
    ],
    notes: "Delivery Conversion Engine spec: agency/projects/ai-r/research/delivery-conversion-engine.md",
  },
  {
    id: "magellan", name: "Magellan Analytics Agent", owner: "Claude Code", status: "planned",
    weekStart: 4, durationWeeks: 2, feature: "Magellan",
    description: "Shift summaries, KPI tracking, anomaly detection (slow night, high comps), weekly email digest.",
    tasks: [
      { title: "Shift summary on demand via Maestro", done: false },
      { title: "Daily revenue waterfall", done: false },
      { title: "Anomaly detection (slow night, high comps, unusual voids)", done: false },
      { title: "Weekly email digest", done: false },
    ],
    dependsOn: ["dashboard-v2"],
  },
  {
    id: "loyalty", name: "Loyalty + QR", owner: "Claude Code", status: "planned",
    weekStart: 6, durationWeeks: 2, feature: "Loyalty & QR",
    description: "QR per table, loyalty points, QR pay-at-table, QR review prompt post-payment.",
    tasks: [
      { title: "QR code generation per table", done: false },
      { title: "QR pay-at-table flow", done: false },
      { title: "Loyalty points system", done: false },
      { title: "QR review prompt (post-payment)", done: false },
    ],
  },
  {
    id: "molly", name: "Molly Marketing Agent", owner: "Claude Code", status: "planned",
    weekStart: 6, durationWeeks: 2, feature: "Molly",
    description: "Draft social posts from sprint completions, ad platform sync (Google, Meta), smart specials → auto ads.",
    tasks: [
      { title: "Draft posts from sprint completions → review queue", done: false },
      { title: "Google Ads API (need to apply)", done: false },
      { title: "Meta Marketing API (need to apply)", done: false },
      { title: "Smart special auto-ad from expiring inventory", done: false },
    ],
    blockers: ["Google Ads API — not yet applied", "Meta Marketing API — not yet applied"],
  },
  {
    id: "staff-sched", name: "Staff + Scheduling", owner: "Claude Code", status: "planned",
    weekStart: 8, durationWeeks: 2, feature: "Staff & Scheduling",
    description: "Clock in/out UI, schedule builder, Check payroll integration.",
    tasks: [
      { title: "Staff clock in/out UI", done: false },
      { title: "Schedule builder", done: false },
      { title: "Check payroll integration (checkhq.com)", done: false, notes: "Need to apply at checkhq.com" },
    ],
  },
  {
    id: "floor-plan", name: "Floor Plan + Reservations", owner: "Claude Code", status: "planned",
    weekStart: 8, durationWeeks: 2, feature: "Floor Plan",
    description: "Visual table map, OpenTable + Resy integration, Maestro can move tables via MCP.",
    tasks: [
      { title: "Visual table map UI", done: false },
      { title: "OpenTable integration", done: false, notes: "Applied — pending approval" },
      { title: "Resy integration", done: false, notes: "Not yet applied" },
      { title: "Floor plan import via MCP task", done: false },
    ],
    blockers: ["OpenTable API pending approval", "Resy API not yet applied"],
  },
  {
    id: "go-live", name: "🎯 Red Bar Go-Live", owner: "Neil", status: "planned",
    weekStart: 10, durationWeeks: 1, feature: "Launch",
    description: "Full production launch at Red Bar Sushi — all core features live, staff trained, payments and printing tested on real hardware.",
    tasks: [
      { title: "All core features live in production", done: false },
      { title: "Staff trained on PWA (phone + iPad)", done: false },
      { title: "Square Terminal + Stripe WisePOS tested on real hardware", done: false },
      { title: "All 7 printers routing correctly", done: false },
      { title: "Maestro answering phones", done: false },
      { title: "Online ordering live at redbarsushi.com", done: false },
    ],
  },
];

const STATUS_COLORS: Record<Status, string> = {
  done: "bg-emerald-500/80",
  "in-progress": "bg-blue-500/80",
  planned: "bg-zinc-600/80",
  blocked: "bg-red-500/80",
};

const STATUS_BADGE: Record<Status, string> = {
  done: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  "in-progress": "bg-blue-500/15 text-blue-400 border-blue-500/30",
  planned: "bg-zinc-800 text-zinc-400 border-zinc-700",
  blocked: "bg-red-500/15 text-red-400 border-red-500/30",
};

const OWNER_COLORS: Record<Owner, string> = {
  Obie: "text-violet-400",
  "Claude Code": "text-blue-400",
  Dave: "text-indigo-400",
  Neil: "text-amber-400",
};

const TOTAL_WEEKS = 12;
const PAST_WEEKS = 8;
const owners: Owner[] = ["Obie", "Claude Code", "Dave", "Neil"];

function getWeekLabel(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset * 7);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function TimelinePage() {
  const [selected, setSelected] = useState<Sprint | null>(null);
  const [ownerFilter, setOwnerFilter] = useState<Owner | "all">("all");
  const weeks = Array.from({ length: TOTAL_WEEKS }, (_, i) => i - PAST_WEEKS);
  const filtered = ownerFilter === "all" ? SPRINTS : SPRINTS.filter((s) => s.owner === ownerFilter);

  return (
    <div className="flex gap-6 relative">
      {/* Main chart */}
      <div className={selected ? "flex-1 min-w-0" : "w-full"}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Timeline</h1>
          <p className="text-zinc-500 text-sm">Sprints mapped to calendar weeks — <span className="text-amber-400 font-medium">~10 weeks to Red Bar Go-Live</span></p>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mb-4 flex-wrap text-xs">
          {(Object.entries(STATUS_COLORS) as [Status, string][]).map(([s, c]) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className={"w-3 h-3 rounded-sm " + c} />
              <span className="text-zinc-400 capitalize">{s.replace("-", " ")}</span>
            </div>
          ))}
          <div className="ml-2 flex items-center gap-1.5">
            <div className="w-0.5 h-3 bg-indigo-500" />
            <span className="text-zinc-400">Today</span>
          </div>
        </div>

        {/* Owner filter */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {(["all", ...owners] as const).map((o) => (
            <button key={o} onClick={() => setOwnerFilter(o as typeof ownerFilter)}
              className={"text-xs px-3 py-1.5 rounded-full border transition-colors " + (ownerFilter === o ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500")}>
              {o}
            </button>
          ))}
        </div>

        {/* Gantt */}
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Week headers */}
            <div className="flex mb-1">
              <div className="w-28 shrink-0" />
              <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}>
                {weeks.map((w) => (
                  <div key={w} className={"text-center " + (w === 0 ? "text-indigo-400 font-bold" : "text-zinc-600")} style={{ fontSize: "10px" }}>
                    {getWeekLabel(w)}
                  </div>
                ))}
              </div>
            </div>

            {/* Swim lanes */}
            {owners.map((owner) => {
              const ownerSprints = filtered.filter((s) => s.owner === owner);
              if (ownerSprints.length === 0) return null;
              return (
                <div key={owner} className="mb-5">
                  <div className={"text-xs font-semibold mb-1 " + OWNER_COLORS[owner]}>{owner}</div>
                  <div className="space-y-1">
                    {ownerSprints.map((sprint) => {
                      const startCol = sprint.weekStart + PAST_WEEKS;
                      const doneTasks = sprint.tasks.filter((t) => t.done).length;
                      const pct = sprint.tasks.length > 0 ? Math.round((doneTasks / sprint.tasks.length) * 100) : 0;
                      const isSelected = selected?.id === sprint.id;

                      return (
                        <div key={sprint.id} className="flex items-center">
                          <div className="w-28 shrink-0 text-xs text-zinc-500 truncate pr-2">{sprint.feature}</div>
                          <div className="flex-1 grid relative" style={{ gridTemplateColumns: `repeat(${TOTAL_WEEKS}, 1fr)` }}>
                            {Array.from({ length: TOTAL_WEEKS }).map((_, i) => (
                              <div key={i} className={"h-8 border-r border-zinc-800/40 " + (i - PAST_WEEKS === 0 ? "bg-indigo-500/5" : "")} />
                            ))}
                            {/* Today line */}
                            <div className="absolute top-0 bottom-0 w-px bg-indigo-500/30 pointer-events-none z-10"
                              style={{ left: `${(PAST_WEEKS / TOTAL_WEEKS) * 100}%` }} />
                            <button
                              onClick={() => setSelected(isSelected ? null : sprint)}
                              className={"absolute top-0.5 h-7 rounded flex items-center px-2 cursor-pointer transition-all overflow-hidden group " + STATUS_COLORS[sprint.status] + (isSelected ? " ring-2 ring-white/40" : " hover:brightness-110")}
                              style={{
                                left: `calc(${(startCol / TOTAL_WEEKS) * 100}% + 2px)`,
                                width: `calc(${(sprint.durationWeeks / TOTAL_WEEKS) * 100}% - 4px)`,
                              }}
                            >
                              <span className="text-white text-xs font-medium truncate flex-1">{sprint.name}</span>
                              {sprint.status === "done" && <span className="text-white/60 text-xs ml-1 shrink-0">✓</span>}
                              {sprint.status === "in-progress" && <span className="text-white/70 text-xs ml-1 shrink-0">{pct}%</span>}
                              {sprint.blockers && sprint.blockers.length > 0 && <span className="text-red-300 text-xs ml-1 shrink-0">⚠</span>}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-semibold mb-3 text-zinc-300">Key Milestones</h3>
          <div className="space-y-2">
            {[
              { week: 0, label: "MCP v2 + Maestro 3-Phase", status: "done" as Status },
              { week: 1, label: "Receipts + Pi hardening + Auth middleware", status: "planned" as Status },
              { week: 2, label: "Owner Dashboard V2 + Liam live ops", status: "planned" as Status },
              { week: 3, label: "CFO view + 3-track onboarding", status: "planned" as Status },
              { week: 5, label: "Inventory + Magellan analytics", status: "planned" as Status },
              { week: 7, label: "Loyalty + Molly marketing", status: "planned" as Status },
              { week: 10, label: "🎯 Red Bar Go-Live", status: "planned" as Status },
            ].map((m) => (
              <div key={m.week} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-20 shrink-0">{m.week === 0 ? "This week" : `Week +${m.week}`}</span>
                <div className={"w-2 h-2 rounded-full shrink-0 " + (m.status === "done" ? "bg-emerald-500" : "bg-zinc-600")} />
                <span className={"text-xs " + (m.status === "done" ? "text-zinc-500 line-through" : "text-zinc-300")}>{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detail panel — slides in from right */}
      {selected && (
        <div className="w-80 shrink-0 sticky top-6 self-start">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-zinc-800">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm leading-tight">{selected.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + STATUS_BADGE[selected.status]}>
                      {selected.status.replace("-", " ")}
                    </span>
                    <span className={"text-xs font-medium " + OWNER_COLORS[selected.owner]}>{selected.owner}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="text-zinc-500 hover:text-white p-1 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="px-4 py-3 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Meta */}
              <div className="text-xs text-zinc-500 space-y-0.5">
                <div>Feature: <span className="text-zinc-300">{selected.feature}</span></div>
                <div>Timing: <span className="text-zinc-300">{selected.weekStart >= 0 ? `Week +${selected.weekStart}` : `Week ${selected.weekStart}`} · {selected.durationWeeks}w duration</span></div>
                {selected.dependsOn && selected.dependsOn.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Link2 className="w-3 h-3" />
                    <span>Depends on: <span className="text-amber-400">{selected.dependsOn.join(", ")}</span></span>
                  </div>
                )}
              </div>

              {/* Description */}
              {selected.description && (
                <p className="text-xs text-zinc-300 leading-relaxed">{selected.description}</p>
              )}

              {/* Blockers */}
              {selected.blockers && selected.blockers.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-red-400 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Blockers
                  </div>
                  {selected.blockers.map((b, i) => (
                    <p key={i} className="text-xs text-red-300">{b}</p>
                  ))}
                </div>
              )}

              {/* Tasks */}
              <div>
                <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">
                  Tasks ({selected.tasks.filter(t => t.done).length}/{selected.tasks.length})
                </div>
                <div className="space-y-1.5">
                  {selected.tasks.map((t, i) => (
                    <div key={i} className="flex items-start gap-2">
                      {t.done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        : <Circle className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />}
                      <div>
                        <span className={"text-xs " + (t.done ? "text-zinc-500 line-through" : "text-zinc-300")}>{t.title}</span>
                        {t.notes && <p className="text-xs text-zinc-600 italic mt-0.5">{t.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider">Notes</div>
                  <p className="text-xs text-zinc-300 leading-relaxed">{selected.notes}</p>
                </div>
              )}

              {/* Prompt */}
              {selected.promptFile && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Claude Code Prompt</div>
                  <a
                    href={"/memory?file=" + encodeURIComponent(selected.promptFile)}
                    className="flex items-center justify-center gap-2 w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                  >
                    <span>🤖</span>
                    Open Prompt for Claude
                  </a>
                </div>
              )}

              {/* Links */}
              {selected.links && selected.links.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-zinc-400 mb-2 uppercase tracking-wider">Linked Docs</div>
                  <div className="space-y-1">
                    {selected.links.map((l, i) => (
                      <a key={i} href={l.href} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
