"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface QueueItem {
  id: string;
  title: string;
  project: string;
  status: string;
  channel: string;
}

interface MarketingData {
  weekOf: string;
  queue: QueueItem[];
  channels: string[];
  projects: string[];
}

const STATUS_CYCLE = ["not-started", "draft", "scheduled", "posted"];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "not-started": "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  scheduled: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  posted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

const PROJECT_MAP: Record<string, { label: string; emoji: string; color: string }> = {
  "ai-r":        { label: "AI-R",          emoji: "🍽️", color: "text-orange-400" },
  "plate-ai":    { label: "PlateAI",       emoji: "🥗", color: "text-green-400" },
  "studio":      { label: "Studio",        emoji: "🎬", color: "text-purple-400" },
  "time-trek":   { label: "Time Trek",     emoji: "🌍", color: "text-blue-400" },
  "ember-azure": { label: "Ember & Azure", emoji: "🔥", color: "text-red-400" },
  "orion-mcp":   { label: "Orion MCP",     emoji: "⚡", color: "text-cyan-400" },
};

const STRATEGY_DOCS = [
  { label: "AI-R Marketing Strategy", project: "ai-r" },
  { label: "PlateAI Go-to-Market", project: "plate-ai" },
  { label: "Time Trek Launch Plan", project: "time-trek" },
  { label: "Personal Brand (LinkedIn)", project: null },
];

export default function MarketingPage() {
  const [data, setData] = useState<MarketingData | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/marketing").then(r => r.json());
    setData(res);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function cycleStatus(item: QueueItem) {
    const idx = STATUS_CYCLE.indexOf(item.status);
    const next = STATUS_CYCLE[(idx + 1) % STATUS_CYCLE.length];
    const res = await fetch("/api/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, status: next }),
    });
    const updated = await res.json();
    setData(updated);
  }

  if (!data) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );

  // Group items by project for Section 2
  const byProject = new Map<string, QueueItem[]>();
  for (const item of data.queue) {
    const arr = byProject.get(item.project) ?? [];
    arr.push(item);
    byProject.set(item.project, arr);
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-12">
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-xl font-bold text-white">Marketing</h1>
        <p className="text-xs text-zinc-500 mt-0.5">All projects &middot; All channels &middot; Week of {data.weekOf}</p>
      </div>

      <div className="px-4 space-y-6">

        {/* Section 1 — This Week's Queue */}
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">This Week&apos;s Queue</p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="divide-y divide-zinc-800/60">
              {data.queue.map(item => {
                const proj = PROJECT_MAP[item.project];
                return (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                    <button
                      onClick={() => cycleStatus(item)}
                      className={`text-[10px] px-2 py-0.5 rounded border shrink-0 transition-colors ${STATUS_COLORS[item.status] ?? STATUS_COLORS["not-started"]}`}>
                      {item.status}
                    </button>
                    <span className="text-sm text-zinc-200 flex-1 min-w-0 truncate">{item.title}</span>
                    {proj && (
                      <span className={`text-[10px] shrink-0 ${proj.color}`}>{proj.emoji} {proj.label}</span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-500 shrink-0">{item.channel}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Section 2 — By Project */}
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">By Project</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...byProject.entries()].map(([projectId, items]) => {
              const proj = PROJECT_MAP[projectId];
              const counts: Record<string, number> = {};
              for (const item of items) counts[item.status] = (counts[item.status] ?? 0) + 1;
              return (
                <div key={projectId} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{proj?.emoji ?? "📦"}</span>
                    <span className={`text-xs font-semibold ${proj?.color ?? "text-zinc-400"}`}>{proj?.label ?? projectId}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[10px] mb-2">
                    {Object.entries(counts).map(([status, count]) => (
                      <span key={status} className={`px-1.5 py-0.5 rounded border ${STATUS_COLORS[status] ?? STATUS_COLORS["not-started"]}`}>
                        {count} {status}
                      </span>
                    ))}
                  </div>
                  <Link href={`/projects/${projectId}/marketing`} className="text-[10px] text-indigo-400 hover:text-indigo-300">
                    View project marketing →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3 — Strategy Docs */}
        <div>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">Strategy Docs</p>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
            <div className="space-y-2">
              {STRATEGY_DOCS.map((doc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-700">📄</span>
                  <span className="text-sm text-zinc-600">{doc.label}</span>
                  <span className="text-[10px] text-zinc-700 border border-zinc-800 px-1.5 py-0.5 rounded">coming soon</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
