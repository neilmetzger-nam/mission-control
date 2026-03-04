"use client";

import Link from "next/link";
import { Clapperboard, UtensilsCrossed, Brain, Zap, BookOpen, TrendingUp, ChevronRight, Activity, FileText } from "lucide-react";

// ─── Client Portfolio Data ───────────────────────────────
const CLIENTS = [
  {
    id: "studio",
    name: "Prompt Studio",
    icon: Clapperboard,
    vertical: "AI Video Production",
    entity: "Internal",
    status: "active" as const,
    agents: 6,
    mcpTools: 32,
    knowledgeEntries: 43,
    health: 92,
    revenue: "$0",
    description: "AI-powered video production for structured storytelling. Engine-expert agents handle last-mile prompt optimization per video model.",
    highlights: [
      "MCP fully wired — 32 tools across 6 groups",
      "Knowledge loop live — 43 learnings accumulated",
      "6 engine experts deployed (Rex, Mira, Sage, Echo, Nova, Zip)",
    ],
    access: ["neil"],
  },
  {
    id: "ai-r",
    name: "AI-R",
    icon: UtensilsCrossed,
    vertical: "Restaurant Management",
    entity: "NextGen Restaurants LLC",
    status: "active" as const,
    agents: 5,
    mcpTools: 5,
    knowledgeEntries: 0,
    health: 93,
    revenue: "$0",
    description: "Deep vertical AI layer that embeds into restaurant operations. Captures data at the moment it happens, compounds intelligence over time.",
    highlights: [
      "Red Bar Sushi live deployment (Mar 2) — real orders, Apple Pay, Star SP700/TSP100 printers confirmed",
      "DB-primary sync live — localStorage removed, iPhone↔iPad sync in ~3s; fire route reads printer IPs from DB",
      "Beta splash + invoice photo capture (Claude Vision) built; SP700 Star-mode print commands locked in",
    ],
    access: ["neil", "obie"],
  },
];

// ─── Agency Intelligence ─────────────────────────────────
const AGENCY_STATS = {
  totalAgents: 12,
  activeAgents: 4,
  totalMcpTools: 37,
  totalLearnings: 43,
  reusablePatterns: 7,
  claudeCodeSessions: 18,
  sharedLearnings: 12,
};

// ─── Components ──────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    onboarding: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    planned: "bg-gray-500/20 text-gray-400 border-gray-500/30",
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
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${value}%` }} />
      </div>
      <span className="text-xs text-zinc-500 w-8">{value}%</span>
    </div>
  );
}

export default function PortfolioHome() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <Brain className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">NextGen Agency</h1>
          </div>
          <p className="text-zinc-500 text-sm ml-14">
            AI staffing agency — curating, training, and deploying agents at scale
          </p>
        </div>

        {/* Client Portfolio */}
        <div className="mb-12">
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-4">Client Portfolio</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CLIENTS.map((client) => {
              const Icon = client.icon;
              return (
                <Link
                  key={client.id}
                  href={`/client/${client.id}`}
                  className="group block bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/60 transition-all"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                        <Icon className="w-5 h-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{client.name}</h3>
                        <p className="text-xs text-zinc-500">{client.entity}</p>
                      </div>
                    </div>
                    <StatusBadge status={client.status} />
                  </div>

                  {/* Description */}
                  <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{client.description}</p>

                  {/* Health */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Project Health</span>
                    </div>
                    <HealthBar value={client.health} />
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: "Agents", value: client.agents },
                      { label: "MCP Tools", value: client.mcpTools },
                      { label: "Learnings", value: client.knowledgeEntries },
                    ].map((m) => (
                      <div key={m.label} className="bg-zinc-800/50 rounded-lg p-2 text-center">
                        <div className="font-bold text-white">{m.value}</div>
                        <div className="text-[10px] text-zinc-500 uppercase tracking-wider">{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Highlights */}
                  <ul className="space-y-1 mb-4">
                    {client.highlights.map((h, i) => (
                      <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5 shrink-0">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>

                  {/* Access + CTA */}
                  <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                    <div className="flex items-center gap-1">
                      {client.access.map((a) => (
                        <span key={a} className="text-[10px] bg-zinc-800 border border-zinc-700 text-zinc-400 px-2 py-0.5 rounded-full">
                          {a}
                        </span>
                      ))}
                    </div>
                    <span className="text-xs text-blue-400 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Open Dashboard <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Docs link */}
        <div className="mb-6">
          <Link
            href="/docs"
            className="flex items-center justify-between bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-blue-500/50 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors">
                <FileText className="w-4 h-4 text-zinc-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Document Library</p>
                <p className="text-xs text-zinc-500">Architecture docs, Claude Code prompts, specs, briefs — all indexed</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
          </Link>
        </div>

        {/* Agency Intelligence Panel */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-300">Agency Intelligence Layer</h2>
            <span className="text-xs text-zinc-600 ml-auto">Cross-project knowledge compounds over time</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {[
              { icon: Activity, label: "Active Agents", value: AGENCY_STATS.activeAgents, sub: `of ${AGENCY_STATS.totalAgents} total`, color: "text-green-400" },
              { icon: Zap, label: "MCP Tools Built", value: AGENCY_STATS.totalMcpTools, sub: "across all projects", color: "text-blue-400" },
              { icon: BookOpen, label: "Agent Learnings", value: AGENCY_STATS.totalLearnings, sub: `${AGENCY_STATS.sharedLearnings} shared cross-project`, color: "text-purple-400" },
              { icon: TrendingUp, label: "Claude Code Sessions", value: AGENCY_STATS.claudeCodeSessions, sub: `${AGENCY_STATS.reusablePatterns} reusable patterns`, color: "text-yellow-400" },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-zinc-800/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                    <span className="text-xs text-zinc-500">{stat.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-[10px] text-zinc-600 mt-0.5">{stat.sub}</div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-zinc-600 leading-relaxed">
            Patterns learned building AI-R (MCP architecture, agent specs, knowledge loops) feed into how Studio and future clients are built.
            Each project benefits from all others at the system level — humans see only their own project's data.
          </p>
        </div>

      </div>
    </div>
  );
}
