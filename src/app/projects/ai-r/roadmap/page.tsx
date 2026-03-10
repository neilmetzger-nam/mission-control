"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

type Status = "done" | "in-progress" | "planned" | "blocked";
type Owner = "Obie" | "Claude Code" | "Dave" | "Neil" | "Maestro";

interface Task {
  title: string;
  status: Status;
  notes?: string;
}

interface Feature {
  id: string;
  name: string;
  status: Status;
  owner: Owner;
  description: string;
  tasks: Task[];
}

interface FeatureGroup {
  label: string;
  emoji: string;
  features: Feature[];
}

const ROADMAP: FeatureGroup[] = [
  {
    label: "Core Platform",
    emoji: "🏗️",
    features: [
      {
        id: "menu-mgmt",
        name: "Menu Management",
        status: "in-progress",
        owner: "Obie",
        description: "Upload, clean, AI-analyze, modifiers, photos",
        tasks: [
          { title: "Square CSV upload + parser", status: "done" },
          { title: "527-item Red Bar menu seeded", status: "done" },
          { title: "AI menu analysis (Liam)", status: "done" },
          { title: "Modifier groups (Protein + Spice)", status: "done" },
          { title: "Food photos synced to Shopify CDN", status: "done" },
          { title: "Add restaurant_id to modifier_options", status: "planned", notes: "Obie sprint" },
          { title: "Add restaurant_id to menu_item_modifier_groups", status: "planned", notes: "Obie sprint" },
          { title: "Menu edit UI (add/edit/delete items)", status: "in-progress" },
        ],
      },
      {
        id: "online-ordering",
        name: "Online Ordering",
        status: "in-progress",
        owner: "Obie",
        description: "Gloria page, public URL, cart, checkout, SEO",
        tasks: [
          { title: "Gloria ordering page layout", status: "done" },
          { title: "Public menu API endpoint", status: "done" },
          { title: "Category pills + item grid", status: "done" },
          { title: "JSON-LD Restaurant schema + sitemap", status: "done" },
          { title: "Cart + checkout flow", status: "planned" },
          { title: "Online payment (Stripe)", status: "planned" },
          { title: "Order confirmation email", status: "planned" },
        ],
      },
      {
        id: "pos",
        name: "POS / Tableside",
        status: "in-progress",
        owner: "Obie",
        description: "PWA, seat tracking, split checks, mixed tender payments",
        tasks: [
          { title: "PWA shell (SwipeContainer, tabs)", status: "done" },
          { title: "Table + seat assignment", status: "done" },
          { title: "Order by seat, PAID badges", status: "done" },
          { title: "Split check flow", status: "done" },
          { title: "Square Terminal integration", status: "done" },
          { title: "Stripe WisePOS integration", status: "done" },
          { title: "Tableside tipping (autocomplete)", status: "done" },
          { title: "Two-device mode (phone server + iPad station)", status: "in-progress" },
          { title: "Manager PIN gate (Tab 4)", status: "planned" },
        ],
      },
      {
        id: "printing",
        name: "Kitchen Printing",
        status: "in-progress",
        owner: "Dave",
        description: "Pi device, ESC/POS, station routing, remote print",
        tasks: [
          { title: "Pi print server (Node HTTP)", status: "done" },
          { title: "ESC/POS format confirmed on Red Bar printers", status: "done" },
          { title: "7-printer station map", status: "done" },
          { title: "MCP print queue (no ngrok)", status: "done" },
          { title: "Pi poller v2 deployed to Red Bar", status: "done" },
          { title: "Remote print from home confirmed working", status: "done" },
          { title: "Pi as systemd service (auto-start on boot)", status: "planned" },
          { title: "Local config cache (offline fallback)", status: "planned" },
          { title: "Smart routing (direct vs MCP queue)", status: "planned" },
          { title: "Pre-ship Pi setup script", status: "planned" },
        ],
      },
      {
        id: "receipts",
        name: "Receipt System",
        status: "planned",
        owner: "Claude Code",
        description: "Customer bill, auth slip x2, kitchen ticket x4",
        tasks: [
          { title: "Customer bill (itemized + QR pay)", status: "planned" },
          { title: "Auth slip (tip box + signature + QR review)", status: "planned" },
          { title: "Kitchen ticket (course-sorted, double-height, bold mods)", status: "planned" },
          { title: "ESC/POS receipt renderer", status: "planned" },
        ],
      },
    ],
  },
  {
    label: "Intelligence Layer",
    emoji: "🧠",
    features: [
      {
        id: "maestro",
        name: "Maestro Voice Agent",
        status: "in-progress",
        owner: "Dave",
        description: "Phone AI, tableside upsells, 3-phase caller model",
        tasks: [
          { title: "ElevenLabs agent wired", status: "done" },
          { title: "FloatingMaestroButton in PWA", status: "done" },
          { title: "3-phase system prompt (Explorer/Buyer/Operator)", status: "done" },
          { title: "MCP tools wired (get_restaurant_config, create_task)", status: "done" },
          { title: "Trust model + confirmation flow", status: "done" },
          { title: "Role-based delegation (Owner → GM → Manager)", status: "done" },
          { title: "Phone number provisioned for Red Bar", status: "planned" },
        ],
      },
      {
        id: "mcp",
        name: "MCP Task Queue",
        status: "done",
        owner: "Dave",
        description: "Intent routing, confirmation queue, agent delegation",
        tasks: [
          { title: "POST /api/tasks — create + classify intent", status: "done" },
          { title: "Intent router (natural language → taskType)", status: "done" },
          { title: "Agent router (taskType → specialist agent)", status: "done" },
          { title: "Confirmation queue with 60s TTL", status: "done" },
          { title: "Destructive action detection (2-layer)", status: "done" },
          { title: "Role-based delegation schema", status: "done" },
          { title: "Wire requireInternalAuth() into all route handlers", status: "planned", notes: "Security sprint" },
        ],
      },
      {
        id: "liam",
        name: "Liam — Kitchen Intelligence",
        status: "in-progress",
        owner: "Claude Code",
        description: "86 tracking, specials, photo upgrades, menu optimization",
        tasks: [
          { title: "LLM-based menu analysis", status: "done" },
          { title: "Photo sync (Google Drive → Shopify CDN)", status: "done" },
          { title: "Claude Vision photo ID + upload", status: "done" },
          { title: "86 item via MCP task", status: "planned" },
          { title: "Add special via MCP task", status: "planned" },
          { title: "Proactive low-stock alerts", status: "planned" },
        ],
      },
      {
        id: "magellan",
        name: "Magellan — Analytics",
        status: "planned",
        owner: "Claude Code",
        description: "Shift reports, KPIs, anomaly detection, weekly summaries",
        tasks: [
          { title: "Shift summary on demand", status: "planned" },
          { title: "Daily revenue waterfall", status: "planned" },
          { title: "Anomaly detection (slow night, high comps)", status: "planned" },
          { title: "Weekly email digest", status: "planned" },
        ],
      },
    ],
  },
  {
    label: "Owner Tools",
    emoji: "📊",
    features: [
      {
        id: "dashboard",
        name: "Owner Dashboard",
        status: "in-progress",
        owner: "Obie",
        description: "Command Center, revenue waterfall, delivery fees",
        tasks: [
          { title: "Revenue waterfall (What's Left / Prime)", status: "done" },
          { title: "Delivery statement upload (DD + UE parsers)", status: "done" },
          { title: "Effective commission rate + chargeback alerts", status: "done" },
          { title: "Chargeback dispute templates", status: "done" },
          { title: "V2: Command Center / Action Center / Numbers Room", status: "planned" },
        ],
      },
      {
        id: "cfo",
        name: "CFO View",
        status: "planned",
        owner: "Claude Code",
        description: "P&L, cost savings, delivery reconciliation, food cost %",
        tasks: [
          { title: "Cost savings calculator", status: "done" },
          { title: "Delivery statement reconciliation", status: "done" },
          { title: "Full P&L view", status: "planned" },
          { title: "Food cost % by category", status: "planned" },
          { title: "Labor cost tracking", status: "planned" },
        ],
      },
      {
        id: "value-tracker",
        name: "Value Tracker",
        status: "in-progress",
        owner: "Obie",
        description: "30-day ROI dashboard, go-live button, PDF export",
        tasks: [
          { title: "Running dollar ticker", status: "done" },
          { title: "ROI calculator", status: "done" },
          { title: "Chargebacks recovered tracker", status: "done" },
          { title: "Go Live button", status: "planned" },
          { title: "PDF export", status: "planned" },
        ],
      },
      {
        id: "delivery",
        name: "Delivery Integration",
        status: "in-progress",
        owner: "Neil",
        description: "DoorDash, UberEats, Grubhub — inbound orders + statement parsing",
        tasks: [
          { title: "DoorDash statement parser", status: "done" },
          { title: "UberEats statement parser", status: "done" },
          { title: "Grubhub parser (stubbed)", status: "in-progress" },
          { title: "UberEats Marketplace API applied", status: "in-progress", notes: "Applied 2/22 — pending" },
          { title: "DoorDash Drive API portal active", status: "in-progress", notes: "Needs sandbox test deliveries" },
          { title: "DoorDash Marketplace API", status: "planned", notes: "Not yet applied" },
          { title: "Grubhub Marketplace API", status: "in-progress", notes: "Applied, no response" },
          { title: "Inbound order injection from all 3 platforms", status: "planned" },
        ],
      },
    ],
  },
  {
    label: "Growth Features",
    emoji: "🚀",
    features: [
      {
        id: "loyalty",
        name: "Loyalty & QR",
        status: "planned",
        owner: "Claude Code",
        description: "Repeat customer rewards, QR pay-at-table, QR review",
        tasks: [
          { title: "QR code generation per table", status: "planned" },
          { title: "QR pay-at-table flow", status: "planned" },
          { title: "Loyalty points system", status: "planned" },
          { title: "QR review prompt (post-payment)", status: "planned" },
        ],
      },
      {
        id: "reservations",
        name: "Reservations",
        status: "planned",
        owner: "Neil",
        description: "OpenTable / Resy integration",
        tasks: [
          { title: "OpenTable API applied", status: "in-progress", notes: "Pending approval" },
          { title: "Resy API", status: "planned", notes: "Not yet applied" },
          { title: "Reservation widget on website", status: "planned" },
          { title: "Floor plan integration", status: "planned" },
        ],
      },
      {
        id: "molly",
        name: "Molly — Marketing",
        status: "planned",
        owner: "Claude Code",
        description: "Social posts from sprint completions, ad platform sync",
        tasks: [
          { title: "Draft posts from sprint completions → review queue", status: "planned" },
          { title: "Google Ads API", status: "planned", notes: "Need to apply" },
          { title: "Meta Marketing API", status: "planned", notes: "Need to apply" },
          { title: "Smart specials engine (expiring → auto ad)", status: "planned" },
        ],
      },
      {
        id: "website",
        name: "Restaurant Website",
        status: "in-progress",
        owner: "Claude Code",
        description: "Gloria ordering page, AI-generated photos, SEO, Google Business sync",
        tasks: [
          { title: "Gloria ordering page (SEO + JSON-LD)", status: "done" },
          { title: "Gloria cart + checkout (Stripe, guest)", status: "in-progress" },
          { title: "AI hero + category photo generation (gpt-image-1, ~$0.32/restaurant)", status: "planned" },
          { title: "Shopify Taste theme integration", status: "planned" },
          { title: "Google Business Profile sync", status: "planned" },
          { title: "One-click website from menu data", status: "planned" },
        ],
      },
    ],
  },
  {
    label: "Operations",
    emoji: "⚙️",
    features: [
      {
        id: "staff",
        name: "Staff & Scheduling",
        status: "planned",
        owner: "Claude Code",
        description: "Clock in/out, time punch fixes, scheduling",
        tasks: [
          { title: "Time punch fix via Maestro (MCP task type defined)", status: "done" },
          { title: "Staff clock in/out UI", status: "planned" },
          { title: "Schedule builder", status: "planned" },
          { title: "Check payroll integration (checkhq.com)", status: "planned", notes: "Need to apply" },
        ],
      },
      {
        id: "inventory",
        name: "Inventory",
        status: "planned",
        owner: "Claude Code",
        description: "Recipe costs, expiring items, smart specials engine",
        tasks: [
          { title: "Recipe table in DB", status: "planned" },
          { title: "Food cost % per item", status: "planned" },
          { title: "Expiring inventory alerts", status: "planned" },
          { title: "Smart special: expiring → auto-special → auto-ad", status: "planned" },
          { title: "Add restaurant_id to recipes + recipe_ingredients", status: "planned", notes: "Obie sprint" },
        ],
      },
      {
        id: "floor-plan",
        name: "Floor Plan",
        status: "planned",
        owner: "Claude Code",
        description: "Table map, seat assignment, move table",
        tasks: [
          { title: "Floor plan import via MCP task", status: "planned" },
          { title: "Visual table map UI", status: "planned" },
          { title: "Move table via Maestro (MCP task type defined)", status: "done" },
          { title: "Add restaurant_id to floor_plan_elements", status: "planned", notes: "Obie sprint" },
        ],
      },
      {
        id: "printer-setup",
        name: "Printer Setup",
        status: "in-progress",
        owner: "Dave",
        description: "Auto-discovery, MAC-based naming, 7-language test print",
        tasks: [
          { title: "Network port scan (8008/80/9100)", status: "done" },
          { title: "ARP MAC lookup + auto-naming", status: "done" },
          { title: "7-language test print", status: "done" },
          { title: "Epson (WebSocket) + Star (HTTP) drivers", status: "done" },
          { title: "PWA setup UI (4 screens)", status: "done" },
          { title: "Move printer config from localStorage → Neon DB", status: "planned" },
        ],
      },
    ],
  },
  {
    label: "Infrastructure",
    emoji: "🔧",
    features: [
      {
        id: "multitenancy",
        name: "Multi-tenancy",
        status: "in-progress",
        owner: "Obie",
        description: "restaurant_id on all 9 missing tables, tenant isolation",
        tasks: [
          { title: "restaurant_id on core tables", status: "done" },
          { title: "modifier_options", status: "planned", notes: "Obie sprint" },
          { title: "menu_item_modifier_groups", status: "planned", notes: "Obie sprint" },
          { title: "recipes + recipe_ingredients", status: "planned", notes: "Obie sprint" },
          { title: "purchase_order_items", status: "planned", notes: "Obie sprint" },
          { title: "floor_plan_elements", status: "planned", notes: "Obie sprint" },
          { title: "transaction_items + payments + transaction_discounts", status: "planned", notes: "Obie sprint" },
          { title: "integration_sync_logs", status: "planned", notes: "Obie sprint" },
        ],
      },
      {
        id: "payments-infra",
        name: "Payments",
        status: "in-progress",
        owner: "Obie",
        description: "Square terminal, Stripe, tip flow, Plaid bank sync",
        tasks: [
          { title: "Square Terminal integration", status: "done" },
          { title: "Stripe WisePOS integration", status: "done" },
          { title: "Tableside tipping (autocomplete)", status: "done" },
          { title: "Terminal adapter (Square + Stripe unified)", status: "done" },
          { title: "Plaid bank sync (sandbox)", status: "done" },
          { title: "Plaid production approval", status: "in-progress" },
          { title: "Receipt printing post-payment", status: "planned" },
        ],
      },
      {
        id: "security",
        name: "Security",
        status: "in-progress",
        owner: "Dave",
        description: "Sentinel scans, auth middleware, role delegation",
        tasks: [
          { title: "Sentinel v1 (6-check scanner)", status: "done" },
          { title: "Credentials cleaned from memory files", status: "done" },
          { title: "ORION_INTERNAL_KEY rotated", status: "done" },
          { title: "Dependabot on 8 repos", status: "done" },
          { title: "lib/auth.ts + requireInternalAuth()", status: "done" },
          { title: "Wire requireInternalAuth() into all route handlers", status: "planned" },
          { title: "Add restaurant_id to 9 DB tables", status: "planned" },
          { title: "Re-run Sentinel → target score 60+", status: "planned" },
        ],
      },
      {
        id: "onboarding",
        name: "Restaurant Onboarding",
        status: "in-progress",
        owner: "Claude Code",
        description: "7-min self-serve pipeline, 3-track flow",
        tasks: [
          { title: "Menu upload (Step 1)", status: "done" },
          { title: "7-step demo wizard", status: "done" },
          { title: "3-track onboarding spec", status: "planned" },
          { title: "Go Live button → import to production DB", status: "planned" },
          { title: "Pi pre-ship setup script", status: "planned" },
          { title: "Maestro onboarding flow (Buyer phase)", status: "planned" },
        ],
      },
    ],
  },
];

const STATUS_CONFIG: Record<Status, { label: string; color: string; bg: string }> = {
  done: { label: "Done", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
  "in-progress": { label: "In Progress", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
  planned: { label: "Planned", color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700" },
  blocked: { label: "Blocked", color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
};

const OWNER_COLOR: Record<Owner, string> = {
  Obie: "text-violet-400",
  "Claude Code": "text-blue-400",
  Dave: "text-indigo-400",
  Neil: "text-amber-400",
  Maestro: "text-emerald-400",
};

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={"text-xs px-2 py-0.5 rounded-full border font-medium " + cfg.color + " " + cfg.bg}>
      {cfg.label}
    </span>
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  const [open, setOpen] = useState(false);
  const done = feature.tasks.filter((t) => t.status === "done").length;
  const total = feature.tasks.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden mb-2">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900 hover:bg-zinc-800/50 transition-colors text-left"
      >
        <span className="text-zinc-500 shrink-0">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <span className="font-medium text-sm flex-1">{feature.name}</span>
        <span className={"text-xs font-medium shrink-0 " + OWNER_COLOR[feature.owner]}>{feature.owner}</span>
        <span className="text-xs text-zinc-500 shrink-0 hidden sm:block">{done}/{total}</span>
        <div className="w-20 h-1.5 bg-zinc-800 rounded-full shrink-0 hidden sm:block">
          <div className="h-full bg-indigo-500 rounded-full" style={{ width: pct + "%" }} />
        </div>
        <StatusBadge status={feature.status} />
      </button>

      {open && (
        <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
          <p className="text-xs text-zinc-500 mb-3">{feature.description}</p>
          <div className="space-y-1.5">
            {feature.tasks.map((task, i) => {
              const cfg = STATUS_CONFIG[task.status];
              return (
                <div key={i} className="flex items-start gap-2">
                  <span className={"text-xs mt-0.5 shrink-0 " + cfg.color}>
                    {task.status === "done" ? "✓" : task.status === "in-progress" ? "◐" : task.status === "blocked" ? "✗" : "○"}
                  </span>
                  <span className="text-xs text-zinc-300">{task.title}</span>
                  {task.notes && <span className="text-xs text-zinc-600 italic ml-1">— {task.notes}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function RoadmapPage() {
  const [filter, setFilter] = useState<Status | "all">("all");

  const allFeatures = ROADMAP.flatMap((g) => g.features);
  const allTasks = allFeatures.flatMap((f) => f.tasks);
  const doneFeatures = allFeatures.filter((f) => f.status === "done").length;
  const inProgress = allFeatures.filter((f) => f.status === "in-progress").length;
  const doneTasks = allTasks.filter((t) => t.status === "done").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Product Roadmap</h1>
        <p className="text-zinc-500 text-sm">Every feature to get Red Bar fully live on AI-R</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Features Done", value: doneFeatures + "/" + allFeatures.length, color: "text-emerald-400" },
          { label: "In Progress", value: inProgress, color: "text-blue-400" },
          { label: "Tasks Done", value: doneTasks + "/" + allTasks.length, color: "text-indigo-400" },
          { label: "Complete", value: Math.round((doneTasks / allTasks.length) * 100) + "%", color: "text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3">
            <div className={"text-2xl font-bold " + s.color}>{s.value}</div>
            <div className="text-xs text-zinc-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "done", "in-progress", "planned", "blocked"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={"text-xs px-3 py-1.5 rounded-full border transition-colors " + (filter === s ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300" : "border-zinc-700 text-zinc-400 hover:border-zinc-500")}
          >
            {s === "all" ? "All" : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {ROADMAP.map((group) => {
          const filtered = filter === "all" ? group.features : group.features.filter((f) => f.status === filter);
          if (filtered.length === 0) return null;
          return (
            <div key={group.label}>
              <div className="flex items-center gap-2 mb-3">
                <span>{group.emoji}</span>
                <h2 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">{group.label}</h2>
              </div>
              {filtered.map((feature) => (
                <FeatureRow key={feature.id} feature={feature} />
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
