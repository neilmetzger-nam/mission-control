"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clapperboard, UtensilsCrossed, Zap, BookOpen, TrendingUp,
  ChevronRight, Activity, Clock,
} from "lucide-react";

const CLIENTS = [
  {
    id: "studio",
    name: "Prompt Studio",
    icon: Clapperboard,
    entity: "Internal",
    status: "active" as const,
    agents: 6,
    mcpTools: 32,
    health: 92,
  },
  {
    id: "ai-r",
    name: "AI-R",
    icon: UtensilsCrossed,
    entity: "NextGen Restaurants LLC",
    status: "active" as const,
    agents: 5,
    mcpTools: 5,
    health: 88,
  },
];

const AGENCY_STATS = {
  totalAgents: 12,
  activeAgents: 4,
  totalMcpTools: 37,
  totalLearnings: 43,
  reusablePatterns: 8,
  claudeCodeSessions: 18,
  sharedLearnings: 12,
};

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

interface RecentMemory {
  filename: string;
  content: string;
  modified: string;
}

export default function Dashboard() {
  const [recentActivity, setRecentActivity] = useState<RecentMemory | null>(null);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => {
        if (data.files?.length > 0) {
          setRecentActivity(data.files[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Extract first ~10 non-empty lines from latest memory file as activity feed
  const activityLines = recentActivity
    ? recentActivity.content
        .split("\n")
        .filter((l) => l.trim().length > 0 && !l.startsWith("---"))
        .slice(0, 10)
    : [];

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Dashboard</h1>
        <p className="text-zinc-500 text-sm">Agency overview</p>
      </div>

      {/* Stat boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Activity, label: "Agents", value: AGENCY_STATS.activeAgents, sub: `of ${AGENCY_STATS.totalAgents} total`, color: "text-green-400" },
          { icon: Zap, label: "MCP Tools", value: AGENCY_STATS.totalMcpTools, sub: "across all projects", color: "text-blue-400" },
          { icon: BookOpen, label: "Learnings", value: AGENCY_STATS.totalLearnings, sub: `${AGENCY_STATS.sharedLearnings} shared`, color: "text-purple-400" },
          { icon: TrendingUp, label: "Sessions", value: AGENCY_STATS.claudeCodeSessions, sub: `${AGENCY_STATS.reusablePatterns} patterns`, color: "text-yellow-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-zinc-500">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-[10px] text-zinc-600 mt-0.5">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Project cards — compact */}
      <div className="mb-8">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CLIENTS.map((client) => {
            const Icon = client.icon;
            return (
              <Link
                key={client.id}
                href={`/client/${client.id}`}
                className="group flex items-center gap-4 bg-zinc-900 rounded-xl p-4 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/60 transition-all"
              >
                <div className="p-2 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 transition-colors shrink-0">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{client.name}</h3>
                    <StatusBadge status={client.status} />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span>{client.agents} agents</span>
                    <span>{client.mcpTools} tools</span>
                  </div>
                  <div className="mt-2">
                    <HealthBar value={client.health} />
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 shrink-0" />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Recent Activity</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
          {recentActivity ? (
            <>
              <div className="flex items-center gap-2 mb-3 text-xs text-zinc-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{recentActivity.filename.replace(".md", "")}</span>
              </div>
              <div className="space-y-1">
                {activityLines.map((line, i) => (
                  <p key={i} className="text-sm text-zinc-400 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>
              <Link href="/memory" className="inline-flex items-center gap-1 text-xs text-blue-400 mt-3 hover:text-blue-300">
                View all memory <ChevronRight className="w-3 h-3" />
              </Link>
            </>
          ) : (
            <p className="text-sm text-zinc-500">Loading activity...</p>
          )}
        </div>
      </div>
    </>
  );
}
