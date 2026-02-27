"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Brain,
  Building2,
  Users,
  Activity,
  BookOpen,
  Zap,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  Clapperboard,
  UtensilsCrossed,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  FileText,
  Cpu,
  GitBranch,
  Database,
  Search,
  Wrench,
  Shield,
  DollarSign,
  BarChart3,
  X,
  Copy,
  Check,
} from "lucide-react";

// ─────────────────────────────────────────────────────────
// DATA — This will eventually come from API/MCP
// ─────────────────────────────────────────────────────────

const TOKEN_SPEND = {
  today: {
    totalTokens: 285000,
    estimatedCost: 18.50,
    breakdown: [
      { label: "Dave (main session)", model: "Opus", tokens: 153000, cost: 11.50, color: "bg-blue-500" },
      { label: "Research agents (5)", model: "Opus", tokens: 108000, cost: 5.80, color: "bg-purple-500" },
      { label: "Sales agent", model: "Opus", tokens: 24000, cost: 1.20, color: "bg-green-500" },
    ],
  },
  modelStrategy: [
    { task: "Dave (orchestration)", current: "Opus", recommended: "Opus", savings: "$0" },
    { task: "Research sub-agents", current: "Opus", recommended: "Sonnet", savings: "~$4.60/batch" },
    { task: "Daily briefing", current: "—", recommended: "Sonnet", savings: "~$0.30/day" },
    { task: "Coding agents", current: "—", recommended: "Opus", savings: "$0" },
    { task: "QA / monitoring", current: "—", recommended: "Haiku", savings: "~$0.10/run" },
  ],
  weekProjection: {
    allOpus: 130.00,
    optimized: 45.00,
    savings: 85.00,
    savingsPercent: 65,
  },
};

const CLIENTS = [
  {
    id: "studio",
    name: "Prompt Studio",
    icon: Clapperboard,
    vertical: "Video Production",
    entity: "Internal",
    status: "active" as const,
    agents: 7,
    mcpTools: 32,
    knowledgeEntries: 43,
    health: 92,
    revenue: "$0",
    description: "AI-powered video production for structured storytelling",
    highlights: ["MCP fully wired", "Knowledge loop live", "6 engine experts deployed"],
  },
  {
    id: "ai-r",
    name: "AI-R",
    icon: UtensilsCrossed,
    vertical: "Restaurant Management",
    entity: "NextGen Restaurants LLC",
    status: "active" as const,
    agents: 5,
    mcpTools: 7,
    knowledgeEntries: 0,
    health: 87,
    revenue: "$0",
    description: "AI-native restaurant management replacing POS + website + 3rd party aggregators",
    highlights: [
      "Menu analysis + descriptions → Claude 3.5 Sonnet (Feb 25). OpenAI + Anthropic keys live.",
      "MCP architecture spec written — air-mcp repo, Cloud Run, 5 V1 tools, model routing strategy",
      "DB delta documented — 13 missing tables + migration SQL ready for Obie to apply",
      "Menu import finalize endpoint spec written (scripts/import-square-menu.js proven at Red Bar)",
      "Shopify demo sync prompt written — real storefront in wizard (waiting on Obie credentials)",
      "Square Terminal LIVE — end-to-end payment + tableside tipping at Red Bar Leesburg (Feb 24)",
      "Labor/scheduling wired to real DB — AI Payroll + AI Schedule + timeclock sync",
      "⚠️ AR-044: Remove stale captureWithTip($0) call in PaymentModal (autocomplete:true now)",
      "⚠️ AR-045: Delete debug endpoint /api/demo/square/debug before next deploy",
    ],
  },
];

const AGENTS = [
  // Agency
  { id: "dave", name: "Dave", emoji: "🧠", role: "COO / Orchestrator", project: "Agency", status: "active", type: "coordinator", docs: "", skills: [], statusDetails: "Orchestrating all agency operations, directing demo builds" },
  // Studio
  { id: "rex", name: "Rex", emoji: "🎬", role: "Kling Expert", project: "Studio", status: "training", type: "domain", docs: "/agency/projects/studio/agents/rex.yaml", skills: ["/skills/engine-kling/SKILL.md"], statusDetails: "Training on Kling engine parameters & prompt patterns" },
  { id: "mira", name: "Mira", emoji: "🎥", role: "Hailuo Expert", project: "Studio", status: "training", type: "domain", docs: "/agency/projects/studio/agents/mira.yaml", skills: [], statusDetails: "Training on Hailuo engine parameters & prompt patterns" },
  { id: "sage", name: "Sage", emoji: "🖼️", role: "Seedream Expert", project: "Studio", status: "training", type: "domain", docs: "/agency/projects/studio/agents/sage.yaml", skills: [], statusDetails: "Training on Seedream image generation workflows" },
  { id: "echo", name: "Echo", emoji: "🌊", role: "Seedance Expert", project: "Studio", status: "training", type: "domain", docs: "/agency/projects/studio/agents/echo.yaml", skills: [], statusDetails: "Training on Seedance motion generation" },
  { id: "nova", name: "Nova", emoji: "🔊", role: "Veo Expert", project: "Studio", status: "training", type: "domain", docs: "/agency/projects/studio/agents/nova.yaml", skills: [], statusDetails: "Training on Veo video generation" },
  { id: "zip", name: "Zip", emoji: "⚡", role: "Nano Expert", project: "Studio", status: "training", type: "domain", docs: "/agency/projects/studio/agents/zip.yaml", skills: [], statusDetails: "Training on Nano fast-generation pipeline" },
  // AI-R Agents
  { id: "maestro", name: "Maestro", emoji: "🎯", role: "Voice Orchestrator", project: "AI-R", status: "active", type: "coordinator", docs: "/agency/projects/ai-r/docs/menu-expert-agent.md", skills: [], statusDetails: "ElevenLabs ConvAI — live in demo wizard, passes menu context" },
  { id: "liam", name: "Liam", emoji: "👨‍🍳", role: "Kitchen Intelligence", project: "AI-R", status: "training", type: "domain", docs: "/agency/projects/ai-r/docs/menu-expert-agent.md", skills: ["/agency/projects/ai-r/agents/skills/menu-analysis-skill.md"], statusDetails: "Menu analysis on Claude 3.5 Sonnet (migrated Feb 25). Plate costing, market comparison ready. Waiting on MCP server to fully activate knowledge loop." },
  { id: "joe", name: "Joe", emoji: "📞", role: "Phone Ordering AI", project: "AI-R", status: "active", type: "domain", docs: "", skills: [], statusDetails: "ElevenLabs ConvAI (Gemini 2.0 Flash) — live on (833) 324-7207. 7 webhook tools, cart persistence in Neon, Stripe checkout + SMS. Global Food Brain: 386 aliases, progressive fallback resolver. Square Terminal checkout integrated." },
  { id: "molly", name: "Molly", emoji: "📣", role: "Marketing", project: "AI-R", status: "planned", type: "domain", docs: "", skills: [], statusDetails: "Video, ads, social content generation. Not yet built." },
  { id: "magellan", name: "Magellan", emoji: "🧭", role: "Business Analyst", project: "AI-R", status: "planned", type: "domain", docs: "", skills: [], statusDetails: "Cross-tenant data analysis, weekly reports, industry trends. Not yet built." },
  // Utility (planned)
  { id: "forge", name: "Forge", emoji: "⚙️", role: "Coding Agent", project: "Agency", status: "planned", type: "utility", docs: "", skills: [], statusDetails: "Needs: tool definitions, sandbox env, code review workflow" },
  { id: "scout", name: "Scout", emoji: "🔍", role: "Research Agent", project: "Agency", status: "planned", type: "utility", docs: "", skills: [], statusDetails: "Needs: search API integration, report templates" },
  { id: "flow", name: "Flow", emoji: "📋", role: "Workflow Agent", project: "Agency", status: "planned", type: "utility", docs: "", skills: [], statusDetails: "Needs: workflow engine, state machine, trigger definitions" },
  { id: "architect", name: "Architect", emoji: "📐", role: "MCP Design", project: "Agency", status: "planned", type: "utility", docs: "", skills: [], statusDetails: "Needs: MCP spec templates, validation tools" },
];

const ISSUES = [
  // Studio
  { id: "ST-001", title: "MCP server registered in OpenClaw config", project: "Studio", type: "config", assignee: "Neil", status: "done", priority: "high" },
  { id: "ST-002", title: "E2E test: dispatch → agent → learning saved", project: "Studio", type: "test", assignee: "Dave", status: "ready", priority: "high" },
  { id: "ST-003", title: "Wire engine agents into DavePanel dispatch", project: "Studio", type: "feature", assignee: "Claude Code", status: "ready", priority: "medium" },
  // AI-R
  { id: "AR-001", title: "Node.js MCP server scaffold (agency standard)", project: "AI-R", type: "feature", assignee: "Obie", status: "ready", priority: "critical" },
  { id: "AR-002", title: "agent_learnings table migration (Neon)", project: "AI-R", type: "feature", assignee: "Obie", status: "ready", priority: "critical" },
  { id: "AR-003", title: "Add API keys — OPENAI + ANTHROPIC (local + Vercel all 3 envs)", project: "AI-R", type: "config", assignee: "Dave", status: "done", priority: "critical" },
  { id: "AR-004", title: "Demo wizard steps 1-7 (upload → intel scan)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-005", title: "Smart upload + auto-detection", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-006", title: "Square multi-location detection + dedup fix", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-007", title: "Demo page consolidation (single /demo wizard)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-008", title: "Simplified navigation (audience-based)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "medium" },
  { id: "AR-009", title: "Intel scan: Brave Search (9 platforms)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-010", title: "Intel scan: Google/Yelp/social expansion", project: "AI-R", type: "feature", assignee: "Claude Code", status: "in-progress", priority: "high" },
  { id: "AR-011", title: "Intel scan: multi-location tabs", project: "AI-R", type: "feature", assignee: "Claude Code", status: "in-progress", priority: "medium" },
  { id: "AR-012", title: "AI menu analysis — migrated to Claude 3.5 Sonnet", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "critical" },
  { id: "AR-013", title: "Cost intelligence step (AI recipe + plate costing)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "high" },
  { id: "AR-014", title: "Website preview step (mock site from menu data)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-015", title: "Verification prompts at each wizard step", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "medium" },
  { id: "AR-016", title: "ElevenLabs Maestro — wizard context + Call Us", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "medium" },
  { id: "AR-017", title: "Food reference database (DoorDash scraping)", project: "AI-R", type: "research", assignee: "Dave", status: "backlog", priority: "medium" },
  { id: "AR-018", title: "Shopify Taste theme integration", project: "AI-R", type: "feature", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "AR-019", title: "Demo flow: voice-order a 4-top, split check", project: "AI-R", type: "feature", assignee: "Obie", status: "backlog", priority: "high" },
  { id: "AR-020", title: "Offline mode reliability", project: "AI-R", type: "feature", assignee: "Obie", status: "backlog", priority: "critical" },
  { id: "AR-021", title: "neil branch → staging merge", project: "AI-R", type: "devops", assignee: "Obie", status: "ready", priority: "medium" },
  { id: "AR-022", title: "Website messaging update (positioning)", project: "AI-R", type: "content", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "AR-023", title: "Savings calculator: industry-backed sliders", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "high" },
  { id: "AR-024", title: "Health report: loading UX + persistent context", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "medium" },
  { id: "AR-025", title: "Wizard step reorder (website=8, savings=9)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "medium" },
  // Mission Control
  // API Partnerships
  { id: "AR-028", title: "Plaid bank integration (cash flow, forecasting)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "high" },
  { id: "AR-029", title: "OpenTable API integration (reservations)", project: "AI-R", type: "integration", assignee: "Neil", status: "ready", priority: "medium" },
  { id: "AR-030", title: "Resy API integration (reservations)", project: "AI-R", type: "integration", assignee: "Neil", status: "backlog", priority: "medium" },
  { id: "AR-031", title: "Yelp Reservations API integration", project: "AI-R", type: "integration", assignee: "Neil", status: "backlog", priority: "medium" },
  // Big features
  { id: "AR-026", title: "Smart Menu system (channels, dayparts, specials, promos)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "in-progress", priority: "critical" },
  { id: "AR-027", title: "CFO demo analysis (price intel from menu data)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "high" },
  { id: "AR-032", title: "Loyalty system + gift cards", project: "AI-R", type: "feature", assignee: "Dave", status: "backlog", priority: "high" },
  { id: "AR-033", title: "QR table scan (DineLine competitor)", project: "AI-R", type: "feature", assignee: "Dave", status: "backlog", priority: "high" },
  { id: "AR-034", title: "Recharts + custom chart components", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "medium" },
  { id: "AR-035", title: "Operations: staff accounts, timeclock, scheduling", project: "AI-R", type: "feature", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "AR-036", title: "Reservations + real-time waitlist (native)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "AR-037", title: "Global Food Brain — alias learning system (3-tier)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "in-progress", priority: "critical" },
  { id: "AR-038", title: "PWA Page 3 — Staff Menu Browser + 86 toggle", project: "AI-R", type: "feature", assignee: "Claude Code", status: "in-progress", priority: "high" },
  { id: "AR-039", title: "Restaurant Settings page (coursing, tips, auto-grat)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "high" },
  { id: "AR-040", title: "PWA 5-page role-gated architecture", project: "AI-R", type: "feature", assignee: "Claude Code", status: "in-progress", priority: "high" },
  { id: "AR-041", title: "Joe → Gemini 2.0 Flash LLM upgrade", project: "AI-R", type: "config", assignee: "Dave", status: "done", priority: "medium" },
  { id: "AR-042", title: "Cart persistence (Neon DB)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "done", priority: "critical" },
  { id: "AR-043", title: "Credential rotation (Neon, Clerk, Brave)", project: "AI-R", type: "security", assignee: "Neil", status: "ready", priority: "critical" },
  { id: "AR-044", title: "PaymentModal audit — remove stale captureWithTip($0) after autocomplete:true", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "critical" },
  { id: "AR-045", title: "Delete debug endpoint /api/demo/square/debug (temporary route)", project: "AI-R", type: "devops", assignee: "Neil", status: "ready", priority: "high" },
  { id: "AR-046", title: "PWA restructure — 5 phases (nav, cockpit, owner tab, smart button, ambient)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "high" },
  { id: "AR-047", title: "POS Custom Price tile (pos-custom-price.md)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "medium" },
  { id: "AR-048", title: "KDS polling fix — cross-device via /api/pwa/orders (BroadcastChannel same-browser only)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "high" },
  { id: "AR-049", title: "FAQ page at /faq + PublicNav link", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "medium" },
  { id: "AR-050", title: "Per-channel category ordering/visibility (category-channel-settings.md)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "medium" },
  // Feb 25 sprint
  { id: "AR-051", title: "MCP server scaffold — air-mcp repo, Cloud Run deploy, V1 tools", project: "AI-R", type: "feature", assignee: "Obie", status: "ready", priority: "critical" },
  { id: "AR-052", title: "DB delta — apply 13 missing tables to staging Neon", project: "AI-R", type: "devops", assignee: "Obie", status: "ready", priority: "critical" },
  { id: "AR-053", title: "Switch to drizzle-kit generate migration workflow (stop using push)", project: "AI-R", type: "devops", assignee: "Obie", status: "ready", priority: "high" },
  { id: "AR-054", title: "Menu import finalize endpoint POST /api/menu/import/finalize", project: "AI-R", type: "feature", assignee: "Claude Code", status: "ready", priority: "critical" },
  { id: "AR-055", title: "Shopify demo store sync — real storefront in wizard preview", project: "AI-R", type: "feature", assignee: "Claude Code", status: "blocked", priority: "high" },
  { id: "AR-056", title: "Shopify demo store credentials (domain + Admin API token)", project: "AI-R", type: "config", assignee: "Obie", status: "ready", priority: "high" },
  { id: "AR-057", title: "Generate descriptions — migrated to Claude 3.5 Sonnet", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "medium" },

  // ── Feb 26 Red Bar night — completed ────────────────────────────
  { id: "AR-058", title: "PrinterStation DB table + DB-backed printer API routes (no more cold-start resets)", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "critical" },
  { id: "AR-059", title: "Printer settings scroll fix — remove min-h-dvh from embedded panel", project: "AI-R", type: "bug", assignee: "Johnny", status: "done", priority: "high" },
  { id: "AR-060", title: "Receipt: finalized tip from Square Terminal (no checkbox section), loyalty QR on customer copy", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "high" },
  { id: "AR-061", title: "Smart receipt page (/receipt/[token]) — review gate + loyalty signup + reorder CTA", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "high" },
  { id: "AR-062", title: "Kitchen ticket course grouping — DRINKS/APPS/SOUPS/ENTREES/DESSERTS with bold headers", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "high" },
  { id: "AR-063", title: "Native ESC/POS QR codes on receipts — GS ( k Star TSP sequence (was ASCII placeholder)", project: "AI-R", type: "bug", assignee: "Dave", status: "done", priority: "high" },
  { id: "AR-064", title: "Category→printer routing UI: multi-select toggles + fix wrong localStorage key (was silently broken)", project: "AI-R", type: "bug", assignee: "Dave", status: "done", priority: "critical" },
  { id: "AR-065", title: "Multilingual kitchen tickets DB layer — MenuItemTranslation + ModifierOptionTranslation (2160 rows, es/zh/ko/th)", project: "AI-R", type: "feature", assignee: "Dave", status: "done", priority: "medium" },
  { id: "AR-066", title: "JOHNNY.md — field agent architecture guide (fire path, localStorage map, rules)", project: "AI-R", type: "docs", assignee: "Dave", status: "done", priority: "high" },
  { id: "AR-067", title: "CORS fix — route test prints through /api/demo/pi/* proxy (Safari/iPad was blocked)", project: "AI-R", type: "bug", assignee: "Johnny", status: "done", priority: "high" },
  { id: "AR-068", title: "Fire All button fix — correctly targets kitchen printers", project: "AI-R", type: "bug", assignee: "Johnny", status: "done", priority: "high" },

  // ── Johnny's queue — read JOHNNY.md before starting any of these ──
  { id: "AR-069", title: "TicketBuilder.ts: pull item names from MenuItemTranslation DB by station language", project: "AI-R", type: "feature", assignee: "Johnny", status: "ready", priority: "medium" },
  { id: "AR-070", title: "KDS cross-device polling — /api/pwa/orders long-poll or SSE (BroadcastChannel is same-browser only)", project: "AI-R", type: "feature", assignee: "Johnny", status: "ready", priority: "high" },
  { id: "AR-071", title: "Verify QR code scans on physical Star TSP receipt — confirm GS ( k renders correctly", project: "AI-R", type: "qa", assignee: "Johnny", status: "ready", priority: "high" },
  { id: "AR-072", title: "PaymentModal: remove stale captureWithTip($0) call (Square autocomplete:true handles tip+capture in one shot)", project: "AI-R", type: "bug", assignee: "Johnny", status: "ready", priority: "critical" },
  { id: "AR-073", title: "Delete /api/demo/square/debug endpoint before next staging merge", project: "AI-R", type: "security", assignee: "Johnny", status: "ready", priority: "high" },
  { id: "AR-074", title: "Reset Red Bar localStorage routing (routing UI was silently broken — saved values are stale)", project: "AI-R", type: "ops", assignee: "Johnny", status: "ready", priority: "high" },

  // ── Backlog additions from tonight ───────────────────────────────
  { id: "AR-075", title: "AI Menu Videos — Kling/Veo 6s simmering clips per dish, $49/mo add-on feature", project: "AI-R", type: "feature", assignee: "Dave", status: "backlog", priority: "medium" },
  { id: "AR-076", title: "Owner translation review UI — approve/edit AI-generated menu translations per item", project: "AI-R", type: "feature", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "AR-077", title: "Kitchen station language picker — login screen per station (Phase 2)", project: "AI-R", type: "feature", assignee: "Claude Code", status: "backlog", priority: "low" },

  // Mission Control
  { id: "MC-001", title: "Wire dashboard to real data (API routes)", project: "MC", type: "feature", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "MC-002", title: "Token spend tracking (real Anthropic usage)", project: "MC", type: "feature", assignee: "Claude Code", status: "backlog", priority: "medium" },
  { id: "MC-003", title: "Client detail pages (click into projects)", project: "MC", type: "feature", assignee: "Claude Code", status: "backlog", priority: "low" },
  { id: "MC-004", title: "Agent detail pages (click into profiles)", project: "MC", type: "feature", assignee: "Claude Code", status: "backlog", priority: "low" },
];

const CLAUDE_CODE_LOG = [
  { date: "02-16", id: "CC-001", request: "Implement AGENT-KNOWLEDGE-MCP.md spec", project: "Studio", result: "✅ 13 files, 32 tools", tokens: "~50k", time: "8 min" },
  { date: "02-17", id: "CC-002", request: "Smart upload auto-detection + demo consolidation", project: "AI-R", result: "✅ file-detector, demo page", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-003", request: "Simplified navigation (HomeNav.tsx)", project: "AI-R", result: "✅ audience-based nav", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-004", request: "Demo wizard steps 1-6 (tease → cleanup)", project: "AI-R", result: "✅ 7 components, 3 libs", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-005", request: "Intel scan step + API route + DoorDash parser", project: "AI-R", result: "✅ 3 files", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-006", request: "Square multi-location fix", project: "AI-R", result: "✅ token/location dedup", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-007", request: "Brave search fixes + rate limiting", project: "AI-R", result: "✅ sequential + filtering", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-008", request: "Intel scan: Google/Yelp/social expansion", project: "AI-R", result: "✅ 9 sources", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-009", request: "Intel scan: multi-location tabs", project: "AI-R", result: "🟢 in-progress", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-010", request: "Savings calculator: sliders + citations", project: "AI-R", result: "✅ 5 sliders, sources", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-011", request: "Health report: loading UX + persistence", project: "AI-R", result: "✅ rotating msgs, context", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-012", request: "Website preview (StepWebsite.tsx)", project: "AI-R", result: "✅ mock site + browser chrome", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-013", request: "Maestro Call Us wiring", project: "AI-R", result: "✅ open-maestro event", tokens: "—", time: "—" },
  { date: "02-17", id: "CC-014", request: "Wizard step reorder", project: "AI-R", result: "✅ website=8, savings=9", tokens: "—", time: "—" },
  { date: "02-23", id: "CC-015", request: "Mirror landing page (9 pain cards, all roads to upload)", project: "AI-R", result: "✅ /home redesign", tokens: "—", time: "—" },
  { date: "02-23", id: "CC-016", request: "Investors page /investors (Stripe-style, 9 sections)", project: "AI-R", result: "✅ live", tokens: "—", time: "—" },
  { date: "02-23", id: "CC-017", request: "Connections hub /home/connections (19 integrations)", project: "AI-R", result: "✅ live", tokens: "—", time: "—" },
  { date: "02-23", id: "CC-018", request: "Demo tighten — 9→7 steps, health scoring fix, intel 'Not us'", project: "AI-R", result: "✅ live", tokens: "—", time: "—" },
  { date: "02-24", id: "CC-019", request: "OpsCard full-screen portal fix (Framer Motion transform)", project: "AI-R", result: "✅ createPortal fix", tokens: "—", time: "—" },
  { date: "02-24", id: "CC-020", request: "Tableside tipping — allow_tipping + smart_tipping + autocomplete", project: "AI-R", result: "✅ commit d88df6c", tokens: "—", time: "—" },
  { date: "02-24", id: "CC-021", request: "Square env var trailing \\n fix — printf + .trim() defensive", project: "AI-R", result: "✅ commit dbc1342", tokens: "—", time: "—" },
  { date: "02-24", id: "CC-022", request: "Labor/scheduling P6+P7+P8 — timeclock sync, payroll, schedule wired to DB", project: "AI-R", result: "✅ commit ac5846e", tokens: "—", time: "—" },
  { date: "02-25", id: "CC-023", request: "Migrate menu-analysis + generate-descriptions to Claude 3.5 Sonnet", project: "AI-R", result: "✅ commit 125f477", tokens: "—", time: "—" },
];

const IDEAS = [
  {
    id: "IDEA-001",
    title: "Engine-Specific Prompt Fine-Tuning",
    project: "Studio",
    priority: "high" as const,
    status: "collecting-data",
    description: "Fine-tune GPT-4o-mini per video engine (Kling, Hailuo, Veo, etc.) for last-mile prompt optimization. Needs 50-100 rated generations per engine first. Competitive moat — proprietary prompt intelligence.",
    prereqs: ["Logging schema for generations", "50-100 generations/engine", "Quality rating pipeline"],
    payoff: "Pennies per optimization vs full API calls. Sub-second rewrites. Agents become supervisors.",
  },
  {
    id: "IDEA-002",
    title: "Restaurant-Trained LLM",
    project: "AI-R",
    priority: "low" as const,
    status: "future",
    description: "Fine-tune smaller model on accumulated restaurant data (menus, chargebacks, financial patterns). Revisit at 100+ restaurants — not enough data yet.",
    prereqs: ["100+ restaurants through system", "agent_learnings table populated", "Outcome data on recommendations"],
    payoff: "Cheaper per-call intelligence. Every customer makes the system smarter.",
  },
];

const RECENT_ACTIVITY = [
  { time: "Feb 25 AM", event: "Shopify demo sync prompt written (prompts/shopify-demo-sync.md) — real storefront in wizard, waiting on Obie credentials", agent: "Dave", type: "info" as const },
  { time: "Feb 25 AM", event: "Obie briefing doc compiled — MCP + DB delta + import endpoint + Shopify credentials all in one doc", agent: "Dave", type: "info" as const },
  { time: "Feb 25 AM", event: "Menu import finalize endpoint spec written — wraps scripts/import-square-menu.js as POST /api/menu/import/finalize", agent: "Dave", type: "success" as const },
  { time: "Feb 25 AM", event: "DB delta documented — 13 missing tables + migration SQL ready for Obie to apply to staging", agent: "Dave", type: "success" as const },
  { time: "Feb 25 AM", event: "MCP architecture brief written for Obie — air-mcp repo spec, V1 tools, model routing, DB tables, Cloud Run deploy", agent: "Dave", type: "success" as const },
  { time: "Feb 25 AM", event: "Menu analysis + generate-descriptions migrated to Claude 3.5 Sonnet — Anthropic API key added to local + Vercel", agent: "Dave", type: "success" as const },
  { time: "Feb 25 AM", event: "OPENAI_API_KEY replaced in Vercel (stale key was there), ANTHROPIC_API_KEY added all 3 environments", agent: "Dave", type: "success" as const },
  { time: "Feb 24 PM", event: "Square Terminal env var \\n root cause found — printf fix + .trim() defensive, commit dbc1342", agent: "Claude Code", type: "success" as const },
  { time: "Feb 24 PM", event: "Tableside tipping enabled: allow_tipping + smart_tipping + autocomplete one-shot flow, commit d88df6c", agent: "Claude Code", type: "success" as const },
  { time: "Feb 24 PM", event: "Square Terminal paired at Leesburg (516WS21606100346) — full payment end-to-end confirmed (Visa contactless, voided)", agent: "Neil", type: "success" as const },
  { time: "Feb 24 AM", event: "OpsCard full-screen portal fix — createPortal to document.body (Framer Motion transform issue)", agent: "Claude Code", type: "success" as const },
  { time: "Feb 24 AM", event: "Labor/scheduling P6+P7+P8 wired to real DB — AI Payroll + AI Schedule + timeclock sync (commit ac5846e)", agent: "Claude Code", type: "success" as const },
  { time: "Feb 24 AM", event: "PWA restructure spec written — 5 phases, role-gated nav (server/manager/owner tabs), Smart Action Button", agent: "Dave", type: "info" as const },
  { time: "Feb 23 PM", event: "Local print server built (/tmp/ps.js port 3333) — Main Expo (.237) + Thai Receipt (.239) confirmed working via TCP bridge", agent: "Claude Code", type: "success" as const },
  { time: "Feb 23 PM", event: "PrintServerDriver.ts integration in-progress (session cool-canyon) — PrinterSetup.tsx + fireOrder/print-receipt routing", agent: "Claude Code", type: "info" as const },
  { time: "Feb 23 PM", event: "Red Bar Sushi live test — PIN → POS → fire → KDS → pay → print receipt tested on-site; all 7 printers mapped", agent: "Dave", type: "success" as const },
  { time: "Feb 23 AM", event: "Mirror landing page BUILT — 9 pain cards expand with problem/solution/CTA. All roads lead to menu upload.", agent: "Claude Code", type: "success" as const },
  { time: "Feb 23 AM", event: "Investors page built at /investors — Stripe-style, 9 sections (thesis, problem, why now, product, moat, biz model, traction, team, CTA)", agent: "Claude Code", type: "success" as const },
  { time: "Feb 23 AM", event: "Connections hub built at /home/connections — 19 connections across 7 categories with status tracking", agent: "Claude Code", type: "success" as const },
  { time: "Feb 23 AM", event: "Demo tightened: 9→7 wizard steps, intel 'Not us' dispute fix, menu health scoring tightened (exact dupes + $0 prices only)", agent: "Claude Code", type: "success" as const },
  { time: "Feb 23 AM", event: "Google API key added — Places, Business Profile, Ads, Performance APIs all enabled", agent: "Dave", type: "info" as const },
  { time: "Feb 23 AM", event: "OpenClaw config completed — o3 as Anthropic fallback (auto rate-limit), GPT-4o as selectable cheap option", agent: "Dave", type: "info" as const },
  { time: "Feb 23 AM", event: "Intel scan overhaul prompt ready (6 fixes) — Google Places API replaces Brave, per-location tabs, 'Not Found' manual URL, sticky Next", agent: "Dave", type: "info" as const },
];

const MCP_DEPLOYMENTS = [
  {
    project: "Studio",
    server: "studio-mcp",
    tools: 32,
    status: "healthy" as const,
    lastPing: "2 min ago",
    learnings: 43,
    templates: 8,
    specLink: "",
    toolGroups: [
      { group: "Knowledge Tools", tools: [
        { name: "save_agent_learning", desc: "Persist a new learning entry for an agent" },
        { name: "get_agent_learnings", desc: "Retrieve all learnings for a specific agent" },
        { name: "get_domain_learnings", desc: "Get learnings filtered by domain/vertical" },
        { name: "search_learnings", desc: "Full-text search across all learning entries" },
        { name: "get_learning_stats", desc: "Aggregate stats on learning volume and trends" },
        { name: "delete_learning", desc: "Remove a specific learning entry by ID" },
      ]},
      { group: "Prompt Tools", tools: [
        { name: "get_prompt_template", desc: "Fetch a prompt template by name" },
        { name: "update_prompt_template", desc: "Update an existing prompt template" },
        { name: "list_prompt_templates", desc: "List all available prompt templates" },
        { name: "get_template_history", desc: "View version history for a template" },
        { name: "compare_templates", desc: "Diff two template versions side by side" },
      ]},
      { group: "Dispatch Tools", tools: [
        { name: "dispatch_to_agent", desc: "Route a task to a specific agent" },
        { name: "get_dispatch_status", desc: "Check the status of a dispatched task" },
        { name: "list_active_dispatches", desc: "List all currently active dispatches" },
        { name: "cancel_dispatch", desc: "Cancel an in-progress dispatch" },
      ]},
      { group: "Engine Tools", tools: [
        { name: "submit_generation", desc: "Submit a new generation job to an engine" },
        { name: "get_generation_status", desc: "Poll status of a generation job" },
        { name: "list_engines", desc: "List all registered video engines" },
        { name: "get_engine_config", desc: "Get configuration for a specific engine" },
        { name: "compare_engines", desc: "Compare capabilities across engines" },
        { name: "get_engine_stats", desc: "Usage and performance stats per engine" },
      ]},
      { group: "Video Tools", tools: [
        { name: "get_video_metadata", desc: "Retrieve metadata for a generated video" },
        { name: "list_videos", desc: "List all videos with optional filters" },
        { name: "get_video_status", desc: "Check processing status of a video" },
        { name: "download_video", desc: "Get download URL for a completed video" },
        { name: "get_video_thumbnails", desc: "Get thumbnail images for a video" },
      ]},
      { group: "Stats Tools", tools: [
        { name: "get_agent_stats", desc: "Performance metrics for a specific agent" },
        { name: "get_project_stats", desc: "Aggregate stats across the project" },
        { name: "get_daily_summary", desc: "Daily summary of all operations" },
        { name: "get_cost_breakdown", desc: "Token and cost breakdown by category" },
        { name: "get_quality_metrics", desc: "Quality scores and success rates" },
        { name: "get_performance_trends", desc: "Performance trends over time" },
      ]},
    ],
  },
  {
    project: "AI-R (Voice)",
    server: "air-mcp-voice",
    tools: 7,
    status: "healthy" as const,
    lastPing: "active",
    learnings: 0,
    templates: 0,
    specLink: "",
    toolGroups: [
      { group: "Voice MCP Tools", tools: [
        { name: "log_purchase", desc: "Record a purchase transaction from voice order" },
        { name: "add_recipe_ingredient", desc: "Add or update an ingredient in a recipe" },
        { name: "log_waste", desc: "Log food waste with reason and quantity" },
        { name: "get_plate_cost", desc: "Calculate real-time plate cost for a menu item" },
        { name: "get_cost_alerts", desc: "Get alerts when costs exceed thresholds" },
        { name: "process_cart", desc: "Process cart items for Stripe checkout + SMS" },
        { name: "resolve_food_alias", desc: "Global Food Brain alias resolution (386 aliases)" },
      ]},
    ],
  },
  {
    project: "AI-R (Agent)",
    server: "air-mcp-agent",
    tools: 0,
    status: "planned" as const,
    lastPing: "—",
    learnings: 0,
    templates: 0,
    specLink: "/agency/projects/ai-r/docs/mcp-menu-agent-for-obie.md",
    toolGroups: [
      { group: "Planned Tools", tools: [
        { name: "analyze_menu", desc: "LLM-based menu analysis (duplicates, health, naming)" },
        { name: "estimate_plate_cost", desc: "AI recipe generation → ingredient costs → margin" },
        { name: "compare_to_market", desc: "Compare prices against market reference data" },
        { name: "save_agent_learning", desc: "Persist agent discoveries for future use" },
        { name: "get_agent_learnings", desc: "Retrieve learnings to make analysis smarter over time" },
      ]},
    ],
  },
];

// ─────────────────────────────────────────────────────────
// COMPONENTS
// ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color = "text-blue-400", targetId }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string; targetId?: string;
}) {
  const handleClick = () => {
    if (targetId) {
      document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <div
      onClick={handleClick}
      className={`bg-[var(--card)] rounded-xl p-5 border border-[var(--border)] hover:border-blue-500/50 transition-colors ${targetId ? "cursor-pointer" : ""}`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg bg-[var(--card-hover)]`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className="text-[var(--muted)] text-sm">{label}</span>
      </div>
      <div className="text-3xl font-bold">{value}</div>
      {sub && <div className="text-sm text-[var(--muted)] mt-1">{sub}</div>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    training: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    onboarding: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    planned: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    healthy: "bg-green-500/20 text-green-400 border-green-500/30",
    "not-connected": "bg-red-500/20 text-red-400 border-red-500/30",
    done: "bg-green-500/20 text-green-400 border-green-500/30",
    "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    blocked: "bg-red-500/20 text-red-400 border-red-500/30",
    ready: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    backlog: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border ${styles[status] || styles.planned}`}>
      {status}
    </span>
  );
}

function HealthBar({ value }: { value: number }) {
  const color = value >= 80 ? "bg-green-500" : value >= 50 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-[var(--card-hover)] rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-sm text-[var(--muted)] w-8">{value}%</span>
    </div>
  );
}

function ClientCard({ client }: { client: typeof CLIENTS[0] }) {
  const Icon = client.icon;
  return (
    <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] hover:border-blue-500/50 transition-all cursor-pointer group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--card-hover)]">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{client.name}</h3>
            <span className="text-sm text-[var(--muted)]">{client.vertical}</span>
          </div>
        </div>
        <StatusBadge status={client.status} />
      </div>
      <p className="text-sm text-[var(--muted)] mb-4">{client.description}</p>
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-xs text-[var(--muted)]">Agents</div>
          <div className="font-bold">{client.agents}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--muted)]">MCP Tools</div>
          <div className="font-bold">{client.mcpTools}</div>
        </div>
        <div>
          <div className="text-xs text-[var(--muted)]">Knowledge</div>
          <div className="font-bold">{client.knowledgeEntries}</div>
        </div>
      </div>
      <div className="mb-3">
        <div className="text-xs text-[var(--muted)] mb-1">Health</div>
        <HealthBar value={client.health} />
      </div>
      <div className="space-y-1">
        {client.highlights.map((h, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[var(--muted)]">
            <CheckCircle2 className="w-3 h-3 text-green-400 flex-shrink-0" />
            {h}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 mt-4 text-sm text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
        View details <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
}

const WORKSPACE_BASE = "/Users/neilmetzger/.openclaw/workspace";

function AgentRow({ agent, isExpanded, onToggle, onOpenFile }: { agent: typeof AGENTS[0]; isExpanded: boolean; onToggle: () => void; onOpenFile: (path: string) => void }) {
  const typeIcons: Record<string, React.ElementType> = {
    coordinator: Brain,
    domain: Zap,
    utility: Wrench,
  };
  const TypeIcon = typeIcons[agent.type] || Cpu;

  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-4 py-3 px-4 hover:bg-[var(--card-hover)] rounded-lg transition-colors cursor-pointer"
      >
        <span className="text-xl w-8 text-center">{agent.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium">{agent.name}</div>
          <div className="text-xs text-[var(--muted)]">{agent.role}</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
          <TypeIcon className="w-3 h-3" />
          {agent.type}
        </div>
        <div className="text-xs text-[var(--muted)] w-16 text-right">{agent.project}</div>
        <StatusBadge status={agent.status} />
        <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: isExpanded ? "300px" : "0px", opacity: isExpanded ? 1 : 0 }}
      >
        <div className="mx-4 mb-3 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[var(--muted)]">Project</span>
              <div className="font-medium mt-0.5">{agent.project}</div>
            </div>
            <div>
              <span className="text-[var(--muted)]">Status</span>
              <div className="font-medium mt-0.5">{agent.statusDetails}</div>
            </div>
            <div>
              <span className="text-[var(--muted)]">Docs</span>
              <div className="mt-0.5">
                {agent.docs ? (
                  <span className="inline-flex items-center gap-1">
                    <button onClick={() => onOpenFile(agent.docs)} className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {agent.docs.split("/").pop()}
                    </button>
                    <CopyPathButton filePath={agent.docs} />
                  </span>
                ) : (
                  <span className="text-[var(--muted)]">—</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-[var(--muted)]">Skills</span>
              <div className="mt-0.5">
                {agent.skills.length > 0 ? (
                  <div className="space-y-1">
                    {agent.skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        <button onClick={() => onOpenFile(skill)} className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {skill.split("/").pop()}
                        </button>
                        <CopyPathButton filePath={skill} />
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[var(--muted)]">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ item }: { item: typeof RECENT_ACTIVITY[0] }) {
  const icons: Record<string, React.ElementType> = {
    success: CheckCircle2,
    info: Activity,
    warning: AlertCircle,
  };
  const colors: Record<string, string> = {
    success: "text-green-400",
    info: "text-blue-400",
    warning: "text-yellow-400",
  };
  const Icon = icons[item.type] || Activity;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${colors[item.type]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm">{item.event}</div>
        <div className="text-xs text-[var(--muted)]">{item.agent}</div>
      </div>
      <div className="text-xs text-[var(--muted)] flex-shrink-0">{item.time}</div>
    </div>
  );
}

function CopyPathButton({ filePath }: { filePath: string }) {
  const [copied, setCopied] = useState(false);
  const fullPath = `${WORKSPACE_BASE}${filePath}`;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy full path"
      className="inline-flex items-center justify-center w-5 h-5 rounded hover:bg-[var(--card-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
    >
      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

function FileViewerModal({ filePath, onClose }: { filePath: string; onClose: () => void }) {
  const [content, setContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const fileName = filePath.split("/").pop() || filePath;
  const fullPath = `${WORKSPACE_BASE}${filePath}`;

  useEffect(() => {
    fetch(`/api/docs?path=${encodeURIComponent(filePath)}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "File not found" : "Failed to load file");
        return res.text();
      })
      .then((text) => { setContent(text); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, [filePath]);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const [copied, setCopied] = useState(false);
  const handleCopyPath = () => {
    navigator.clipboard.writeText(fullPath).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
    >
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span className="font-medium truncate">{fileName}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleCopyPath}
              title="Copy full path"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--card-hover)] transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy path"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[var(--card-hover)] text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Path */}
        <div className="px-5 py-2 text-xs text-[var(--muted)] font-mono border-b border-[var(--border)] truncate">
          {fullPath}
        </div>
        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {loading && <div className="text-[var(--muted)] text-sm">Loading...</div>}
          {error && <div className="text-red-400 text-sm">{error}</div>}
          {content !== null && (
            <pre className="text-sm font-mono whitespace-pre-wrap break-words leading-relaxed text-[var(--foreground)]">
              {content}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

function MCPRow({ deployment, isExpanded, onToggle, onOpenFile }: { deployment: typeof MCP_DEPLOYMENTS[0]; isExpanded: boolean; onToggle: () => void; onOpenFile: (path: string) => void }) {
  const totalTools = deployment.toolGroups.reduce((sum, g) => sum + g.tools.length, 0);
  const isPlanned = deployment.status === "planned";

  return (
    <div>
      <div
        onClick={onToggle}
        className="flex items-center gap-4 py-3 px-4 hover:bg-[var(--card-hover)] rounded-lg transition-colors cursor-pointer"
      >
        <Database className="w-4 h-4 text-purple-400" />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{deployment.project}</div>
          <div className="text-xs text-[var(--muted)]">{deployment.server}</div>
        </div>
        <div className="text-xs text-[var(--muted)]">{deployment.tools} tools</div>
        <div className="text-xs text-[var(--muted)]">{deployment.learnings} learnings</div>
        <div className="text-xs text-[var(--muted)]">{deployment.lastPing}</div>
        <StatusBadge status={deployment.status} />
        <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
      </div>
      <div
        className="overflow-hidden transition-all duration-200 ease-in-out"
        style={{ maxHeight: isExpanded ? "800px" : "0px", opacity: isExpanded ? 1 : 0 }}
      >
        <div className="mx-4 mb-3 p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]">
          {isPlanned ? (
            <div className="space-y-3">
              <div className="text-sm text-[var(--muted)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                Not yet deployed
                {deployment.specLink && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <button onClick={() => onOpenFile(deployment.specLink)} className="text-blue-400 hover:text-blue-300 inline-flex items-center gap-1">
                      View spec <FileText className="w-3 h-3" />
                    </button>
                    <CopyPathButton filePath={deployment.specLink} />
                  </span>
                )}
              </div>
              {deployment.toolGroups.length > 0 && deployment.toolGroups.map((group, gi) => (
                <div key={gi}>
                  <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    {group.group} ({group.tools.length})
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {group.tools.map((tool, ti) => (
                      <div key={ti} className="flex items-start gap-2 text-xs py-1 px-2 rounded hover:bg-[var(--card-hover)]">
                        <code className="text-purple-400 font-mono shrink-0">{tool.name}</code>
                        <span className="text-[var(--muted)]">— {tool.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {deployment.toolGroups.map((group, gi) => (
                <div key={gi}>
                  <div className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                    {group.group} ({group.tools.length})
                  </div>
                  <div className="grid grid-cols-1 gap-1">
                    {group.tools.map((tool, ti) => (
                      <div key={ti} className="flex items-start gap-2 text-xs py-1 px-2 rounded hover:bg-[var(--card-hover)]">
                        <code className="text-purple-400 font-mono shrink-0">{tool.name}</code>
                        <span className="text-[var(--muted)]">— {tool.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                {totalTools} tools total • {deployment.learnings} learnings • {deployment.templates} templates
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const params = useParams();
  const clientId = (params?.id as string) ?? "ai-r";
  // Map URL slug to project name used in data arrays
  const PROJECT = clientId === "studio" ? "Studio" : "AI-R";
  const client = CLIENTS.find(c => c.id === clientId) ?? CLIENTS[1];

  // Scoped data — only this client's data
  const scopedAgents = AGENTS.filter(a => a.project === PROJECT || a.project === "Agency");
  const scopedIssues = ISSUES.filter(i => i.project === PROJECT || i.project === "MC");
  const scopedLog = CLAUDE_CODE_LOG.filter(l => l.project === PROJECT);
  const scopedMcp = MCP_DEPLOYMENTS.filter(m => m.project.startsWith(PROJECT.split(" ")[0]));

  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);
  const [expandedMcp, setExpandedMcp] = useState<number | null>(null);
  const [viewingFile, setViewingFile] = useState<string | null>(null);

  const activeAgents = scopedAgents.filter((a) => a.status === "active").length;
  const trainingAgents = scopedAgents.filter((a) => a.status === "training").length;
  const plannedAgents = scopedAgents.filter((a) => a.status === "planned").length;
  const totalKnowledge = CLIENTS.reduce((sum, c) => sum + c.knowledgeEntries, 0);

  return (
    <div className="min-h-screen p-6">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
          <Brain className="w-3.5 h-3.5" /> Agency Portfolio
        </Link>
        <span>/</span>
        <span className="text-white font-medium">{client?.name ?? PROJECT}</span>
        {client?.entity && <span className="text-zinc-600 text-xs ml-1">· {client.entity}</span>}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{client?.name ?? PROJECT} Dashboard</h1>
            <p className="text-[var(--muted)] text-sm">{client?.entity ?? "NextGen Solutions"} · {client?.vertical ?? "AI Platform"}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 text-green-400 text-sm rounded-full border border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Dave Online
          </div>
          <div className="text-sm text-[var(--muted)]">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={TrendingUp} label="Project Health" value={`${client?.health ?? 0}%`} sub={client?.status ?? "active"} color="text-green-400" targetId="section-agents" />
        <StatCard icon={Users} label="Deployed Agents" value={activeAgents + trainingAgents} sub={`${activeAgents} active, ${trainingAgents} training, ${plannedAgents} planned`} color="text-green-400" targetId="section-agents" />
        <StatCard icon={Database} label="MCP Tools" value={client?.mcpTools ?? 0} sub="deployed tools" color="text-purple-400" targetId="section-mcp" />
        <StatCard icon={BookOpen} label="Knowledge Base" value={client?.knowledgeEntries ?? 0} sub="agent learnings" color="text-yellow-400" targetId="section-mcp" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Project Overview */}
        <div id="section-clients" className="lg:col-span-2 scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Project Overview</h2>
          </div>
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold">{client?.name}</h3>
                <p className="text-sm text-[var(--muted)]">{client?.entity} · {client?.vertical}</p>
              </div>
              <StatusBadge status={client?.status ?? "active"} />
            </div>
            <p className="text-sm text-[var(--muted)] mb-4">{client?.description}</p>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                <span>Project Health</span><span>{client?.health}%</span>
              </div>
              <HealthBar value={client?.health ?? 0} />
            </div>
            <ul className="space-y-1.5">
              {client?.highlights.map((h, i) => (
                <li key={i} className="text-sm text-[var(--muted)] flex items-start gap-2">
                  <span className="text-green-400 mt-0.5 shrink-0">✓</span>{h}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((item, i) => (
                <ActivityItem key={i} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Token Spend */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-green-400" />
          <h2 className="text-lg font-semibold">Token Spend</h2>
          <span className="text-xs text-[var(--muted)] bg-[var(--card)] px-2 py-0.5 rounded-full">today</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Today's Spend */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-[var(--muted)]">Today&apos;s Spend</span>
              <span className="text-2xl font-bold text-green-400">${TOKEN_SPEND.today.estimatedCost.toFixed(2)}</span>
            </div>
            <div className="text-xs text-[var(--muted)] mb-3">{(TOKEN_SPEND.today.totalTokens / 1000).toFixed(0)}k tokens</div>
            {/* Spend bar */}
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-3">
              {TOKEN_SPEND.today.breakdown.map((item, i) => (
                <div
                  key={i}
                  className={`${item.color} rounded-full`}
                  style={{ width: `${(item.tokens / TOKEN_SPEND.today.totalTokens) * 100}%` }}
                  title={`${item.label}: $${item.cost}`}
                />
              ))}
            </div>
            <div className="space-y-1.5">
              {TOKEN_SPEND.today.breakdown.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                    <span className="text-[var(--muted)]">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--muted)]">{item.model}</span>
                    <span className="font-medium">${item.cost.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Strategy */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <div className="text-sm text-[var(--muted)] mb-3">Model Strategy</div>
            <div className="space-y-2">
              {TOKEN_SPEND.modelStrategy.map((row, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-[var(--border)] last:border-0">
                  <span className="text-[var(--muted)] flex-1">{row.task}</span>
                  <span className={`px-1.5 py-0.5 rounded text-xs ${
                    row.recommended === "Opus" ? "bg-blue-500/20 text-blue-400" :
                    row.recommended === "Sonnet" ? "bg-purple-500/20 text-purple-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>{row.recommended}</span>
                  <span className="text-green-400 w-20 text-right">{row.savings}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly Projection */}
          <div className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
            <div className="text-sm text-[var(--muted)] mb-3">Weekly Projection</div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                  <span>All Opus</span>
                  <span className="text-red-400">${TOKEN_SPEND.weekProjection.allOpus}/wk</span>
                </div>
                <div className="h-2 bg-red-500/30 rounded-full">
                  <div className="h-full bg-red-500 rounded-full" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1">
                  <span>Optimized (Opus + Sonnet + Haiku)</span>
                  <span className="text-green-400">${TOKEN_SPEND.weekProjection.optimized}/wk</span>
                </div>
                <div className="h-2 bg-green-500/30 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: `${(TOKEN_SPEND.weekProjection.optimized / TOKEN_SPEND.weekProjection.allOpus) * 100}%` }} />
                </div>
              </div>
              <div className="pt-2 border-t border-[var(--border)]">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-[var(--muted)]">Projected Savings</span>
                  <div className="text-right">
                    <div className="text-xl font-bold text-green-400">${TOKEN_SPEND.weekProjection.savings}/wk</div>
                    <div className="text-xs text-green-400">{TOKEN_SPEND.weekProjection.savingsPercent}% reduction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Agent Roster */}
        <div id="section-agents" className="scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold">Agent Roster</h2>
            <span className="text-xs text-[var(--muted)] bg-[var(--card)] px-2 py-0.5 rounded-full">{scopedAgents.length} total</span>
          </div>
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-2">
            {scopedAgents.map((agent) => (
              <AgentRow
                key={agent.id}
                agent={agent}
                isExpanded={expandedAgent === agent.id}
                onToggle={() => setExpandedAgent(expandedAgent === agent.id ? null : agent.id)}
                onOpenFile={setViewingFile}
              />
            ))}
          </div>
        </div>

        {/* MCP Deployments */}
        <div id="section-mcp" className="scroll-mt-6">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">MCP Deployments</h2>
          </div>
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-2 mb-6">
            {scopedMcp.map((dep, i) => (
              <MCPRow
                key={i}
                deployment={dep}
                isExpanded={expandedMcp === i}
                onToggle={() => setExpandedMcp(expandedMcp === i ? null : i)}
                onOpenFile={setViewingFile}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Users, label: "Deploy Agent", desc: "Assign to client" },
              { icon: Search, label: "Spawn Research", desc: "Market intel task" },
              { icon: Wrench, label: "New MCP Server", desc: "Scaffold tools" },
              { icon: Shield, label: "Health Check", desc: "All deployments" },
            ].map((action, i) => (
              <button
                key={i}
                className="bg-[var(--card)] rounded-xl p-4 border border-[var(--border)] hover:border-blue-500/50 transition-all text-left group"
              >
                <action.icon className="w-5 h-5 text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="font-medium text-sm">{action.label}</div>
                <div className="text-xs text-[var(--muted)]">{action.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Issue Tracker & Claude Code Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Issue Tracker */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <h2 className="text-lg font-semibold">Issue Tracker</h2>
            <span className="text-xs text-[var(--muted)] bg-[var(--card)] px-2 py-0.5 rounded-full">{scopedIssues.length} issues</span>
          </div>
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--muted)] text-xs">
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">Issue</th>
                  <th className="text-left p-3">Project</th>
                  <th className="text-left p-3">Assignee</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Priority</th>
                </tr>
              </thead>
              <tbody>
                {scopedIssues.map((issue) => {
                  const statusEmoji: Record<string, string> = { blocked: "🔴", ready: "🟡", "in-progress": "🟢", done: "✅", backlog: "💤" };
                  const priorityColors: Record<string, string> = { critical: "text-red-400", high: "text-orange-400", medium: "text-yellow-400", low: "text-[var(--muted)]" };
                  return (
                    <tr key={issue.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--card-hover)] transition-colors">
                      <td className="p-3 font-mono text-xs text-[var(--muted)]">{issue.id}</td>
                      <td className="p-3">{issue.title}</td>
                      <td className="p-3 text-xs text-[var(--muted)]">{issue.project}</td>
                      <td className="p-3 text-xs">
                        <span className={`px-1.5 py-0.5 rounded ${
                          issue.assignee === "Claude Code" ? "bg-purple-500/20 text-purple-400" :
                          issue.assignee === "Obie" ? "bg-blue-500/20 text-blue-400" :
                          issue.assignee === "Dave" ? "bg-green-500/20 text-green-400" :
                          "bg-gray-500/20 text-gray-400"
                        }`}>{issue.assignee}</span>
                      </td>
                      <td className="p-3 text-xs">{statusEmoji[issue.status] || "❓"} {issue.status}</td>
                      <td className={`p-3 text-xs font-medium ${priorityColors[issue.priority] || ""}`}>{issue.priority}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Claude Code Log */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Claude Code Log</h2>
          </div>
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4">
            {scopedLog.map((entry, i) => (
              <div key={i} className="py-3 border-b border-[var(--border)] last:border-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-purple-400">{entry.id}</span>
                  <span className="text-xs text-[var(--muted)]">{entry.date}</span>
                </div>
                <div className="text-sm mb-1">{entry.request}</div>
                <div className="text-xs text-[var(--muted)] mb-1">{entry.project}</div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-green-400">{entry.result}</span>
                  <span className="text-[var(--muted)]">{entry.tokens}</span>
                  <span className="text-[var(--muted)]">{entry.time}</span>
                </div>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-[var(--border)] text-center">
              <span className="text-xs text-[var(--muted)]">Total requests: {scopedLog.length} • Success rate: 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ideas Board */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-semibold">Ideas Board</h2>
          <span className="text-xs text-[var(--muted)] bg-[var(--card)] px-2 py-0.5 rounded-full">{IDEAS.length} ideas</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {IDEAS.map((idea) => {
            const priorityColors: Record<string, string> = { high: "border-orange-500/30 bg-orange-500/5", medium: "border-yellow-500/30 bg-yellow-500/5", low: "border-[var(--border)] bg-[var(--card)]" };
            const priorityText: Record<string, string> = { high: "text-orange-400", medium: "text-yellow-400", low: "text-[var(--muted)]" };
            return (
              <div key={idea.id} className={`rounded-xl border p-5 ${priorityColors[idea.priority] || "border-[var(--border)] bg-[var(--card)]"}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs text-[var(--muted)]">{idea.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--card)] text-[var(--muted)]">{idea.project}</span>
                    <span className={`text-xs font-medium ${priorityText[idea.priority] || ""}`}>{idea.priority}</span>
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{idea.title}</h3>
                <p className="text-sm text-[var(--muted)] mb-3">{idea.description}</p>
                <div className="mb-2">
                  <span className="text-xs font-medium text-[var(--muted)]">Prerequisites:</span>
                  <ul className="mt-1 space-y-1">
                    {idea.prereqs.map((p, i) => (
                      <li key={i} className="text-xs text-[var(--muted)] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--muted)]" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="text-xs text-cyan-400 mt-3 pt-2 border-t border-[var(--border)]">💡 {idea.payoff}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media & Press Strategy */}
      <div id="section-media" className="scroll-mt-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-pink-400" />
          <h2 className="text-lg font-semibold">Media & Press Strategy</h2>
        </div>

        {/* The Story */}
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)] mb-4">
          <h3 className="text-sm font-semibold text-pink-400 mb-2">📖 The Story</h3>
          <p className="text-sm text-[var(--fg)] leading-relaxed mb-3">
            One restaurant owner — frustrated with Toast fees, Square limitations, and a drawer full of tablets — built a complete restaurant management platform in 2 weeks using AI agents. No engineering team. No VC funding. Just Claude, an AI COO named Dave, and a vision for what restaurant tech should be.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-pink-400 font-semibold mb-1">Hook</div>
              <div className="text-[var(--muted)]">"I built a full restaurant OS in 2 weeks with AI — and I'm testing it in my own restaurants."</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-pink-400 font-semibold mb-1">Proof Points</div>
              <div className="text-[var(--muted)]">25+ pages, POS, KDS, AI bookkeeper, multilingual kitchen tickets, reputation mgmt, voice AI — 2 weeks, 1 person + AI</div>
            </div>
            <div className="bg-black/30 rounded-lg p-3">
              <div className="text-pink-400 font-semibold mb-1">Differentiator</div>
              <div className="text-[var(--muted)]">Not "vibe coded" — structured AI agency model with MCP, agent orchestration, and a real product strategy</div>
            </div>
          </div>
        </div>

        {/* Channels */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {[
            {
              channel: "𝕏 Twitter/X",
              status: "ready",
              color: "text-blue-400",
              strategy: "Build-in-public thread series",
              tactics: [
                "Day-by-day build thread with screenshots",
                "Video clips of 5 parallel Claude agents building",
                "Before/after: Square CSV → full restaurant OS",
                "Hot take: 'Toast charges $200/mo for what AI built in a weekend'",
                "Show real Red Bar Sushi data flowing through the system",
              ],
              audience: "Tech Twitter, indie hackers, restaurant owners",
              priority: "HIGH",
            },
            {
              channel: "📺 YouTube",
              status: "planned",
              color: "text-red-400",
              strategy: "10-min walkthrough + build process",
              tactics: [
                "Full product demo: upload CSV → live restaurant OS",
                "Behind the scenes: talking to Dave on Telegram while driving",
                "Speed-run: building reservations system in 8 minutes (5 parallel agents)",
                "Red Bar Sushi case study: real restaurant, real data",
                "Compare AI-R vs Toast vs Square feature-by-feature",
              ],
              audience: "Restaurant owners, tech enthusiasts, AI builders",
              priority: "HIGH",
            },
            {
              channel: "🟠 Hacker News",
              status: "planned",
              color: "text-orange-400",
              strategy: "Show HN post",
              tactics: [
                "Title: 'Show HN: AI-R — Restaurant OS built by 1 person + AI agents in 2 weeks'",
                "Focus on technical architecture: MCP, agent orchestration, PWA",
                "Multilingual kitchen tickets as the 'wow' detail",
                "Open discussion: AI-assisted development at this speed",
              ],
              audience: "Developers, founders, AI researchers",
              priority: "MEDIUM",
            },
            {
              channel: "🎙 Podcasts",
              status: "research",
              color: "text-purple-400",
              strategy: "Guest appearances on indie/AI shows",
              tactics: [
                "My First Million — restaurant owner disrupting Toast",
                "Indie Hackers — building SaaS with AI agents",
                "Latent Space — MCP architecture + agent orchestration deep dive",
                "Restaurant Unstoppable — tech innovation from an operator",
                "The AI Breakdown — real-world AI agent deployment",
              ],
              audience: "Entrepreneurs, AI practitioners, restaurant industry",
              priority: "MEDIUM",
            },
            {
              channel: "🤖 Anthropic / Claude",
              status: "planned",
              color: "text-yellow-400",
              strategy: "Featured use case / case study",
              tactics: [
                "Submit to Anthropic's customer stories",
                "Claude Code showcase: parallel agents, real product",
                "MCP integration story — agents managing restaurant ops",
                "Quantify: lines of code generated, time saved, cost comparison",
              ],
              audience: "AI industry, Claude users, enterprise decision makers",
              priority: "MEDIUM",
            },
            {
              channel: "📱 TikTok / Reels",
              status: "idea",
              color: "text-cyan-400",
              strategy: "Short-form viral clips",
              tactics: [
                "'POV: Your AI assistant built this while you were driving' (show Telegram → product)",
                "Kitchen ticket translating to Spanish/Japanese in real-time",
                "5 AI agents building simultaneously (screen recording)",
                "'Restaurant owner reacts to his own AI-built software'",
                "Side-by-side: Toast pricing page vs AI-R (free)",
              ],
              audience: "General tech audience, restaurant workers, AI curious",
              priority: "LOW",
            },
          ].map((ch) => (
            <div key={ch.channel} className="bg-[var(--card)] rounded-xl p-5 border border-[var(--border)]">
              <div className="flex items-center justify-between mb-2">
                <h3 className={`text-sm font-semibold ${ch.color}`}>{ch.channel}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  ch.priority === "HIGH" ? "bg-red-500/20 text-red-400" :
                  ch.priority === "MEDIUM" ? "bg-yellow-500/20 text-yellow-400" :
                  "bg-zinc-500/20 text-zinc-400"
                }`}>{ch.priority}</span>
              </div>
              <div className="text-xs text-[var(--muted)] mb-2">{ch.strategy}</div>
              <div className={`text-[10px] px-2 py-0.5 rounded-full inline-block mb-3 ${
                ch.status === "ready" ? "bg-green-500/20 text-green-400" :
                ch.status === "planned" ? "bg-blue-500/20 text-blue-400" :
                ch.status === "research" ? "bg-purple-500/20 text-purple-400" :
                "bg-zinc-500/20 text-zinc-400"
              }`}>{ch.status}</div>
              <ul className="space-y-1.5">
                {ch.tactics.map((t, i) => (
                  <li key={i} className="text-xs text-[var(--muted)] flex items-start gap-1.5">
                    <span className="text-[var(--muted)] mt-0.5">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="text-[10px] text-[var(--muted)] mt-3 pt-2 border-t border-[var(--border)]">
                🎯 {ch.audience}
              </div>
            </div>
          ))}
        </div>

        {/* Content Calendar */}
        <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--border)]">
          <h3 className="text-sm font-semibold text-pink-400 mb-3">📅 Content Roadmap</h3>
          <div className="space-y-2">
            {[
              { week: "Week 1", action: "Twitter build thread (5-tweet series with screenshots)", status: "ready", deps: "Screenshots of product" },
              { week: "Week 1", action: "Record 10-min YouTube walkthrough of AI-R demo", status: "ready", deps: "Stable demo environment" },
              { week: "Week 2", action: "Show HN post — launch day", status: "planned", deps: "Demo link, clean README" },
              { week: "Week 2", action: "Submit Anthropic case study", status: "planned", deps: "Usage stats, build timeline" },
              { week: "Week 3", action: "Red Bar Sushi goes live — document everything", status: "planned", deps: "PWA + DB integration complete" },
              { week: "Week 3", action: "Pitch 3 podcasts (My First Million, Indie Hackers, Latent Space)", status: "planned", deps: "YouTube video as proof" },
              { week: "Week 4", action: "TikTok/Reels series starts (3 clips/week)", status: "idea", deps: "B-roll from Red Bar, screen recordings" },
              { week: "Ongoing", action: "Weekly build updates on Twitter — keep the thread alive", status: "planned", deps: "Keep building features" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="text-[var(--muted)] w-16 shrink-0 font-mono">{item.week}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  item.status === "ready" ? "bg-green-400" :
                  item.status === "planned" ? "bg-blue-400" :
                  "bg-zinc-500"
                }`} />
                <span className="text-[var(--fg)] flex-1">{item.action}</span>
                <span className="text-[var(--muted)] hidden md:block">{item.deps}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs text-[var(--muted)]">
        <div>NextGen Solutions — AI Staffing Agency • Mission Control v0.1</div>
        <div className="flex items-center gap-4">
          <span>2 clients</span>
          <span>•</span>
          <span>{scopedAgents.length} agents</span>
          <span>•</span>
          <span>39 MCP tools</span>
          <span>•</span>
          <span>{totalKnowledge} learnings</span>
        </div>
      </div>

      {/* File Viewer Modal */}
      {viewingFile && (
        <FileViewerModal filePath={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </div>
  );
}
