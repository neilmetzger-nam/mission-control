"use client";

import { useState, useEffect } from "react";

interface AgentEntry {
  id: string;
  timestamp: string;
  agent: string;
  agentEmoji: string;
  projectId: string;
  action: string;
  status: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400",
    review: "bg-yellow-500/20 text-yellow-400",
    running: "bg-blue-500/20 text-blue-400",
    error: "bg-red-500/20 text-red-400",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles[status] || "bg-zinc-800 text-zinc-400"}`}>
      {status}
    </span>
  );
}

export default function AgentsPage() {
  const [entries, setEntries] = useState<AgentEntry[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent-activity")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setEntries(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const projects = Array.from(new Set(entries.map((e) => e.projectId)));
  const filtered = filter === "all" ? entries : entries.filter((e) => e.projectId === filter);

  if (loading) {
    return <div className="text-center py-12 text-zinc-500 text-sm">Loading agent activity...</div>;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{"\u{1F916}"} Agent Activity</h1>
        <p className="text-zinc-500 text-sm">{entries.length} events logged</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
            filter === "all" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
          }`}
        >
          All
        </button>
        {projects.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
              filter === p ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {filtered.map((entry, i) => (
          <div key={entry.id} className="flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-600 mt-1.5" />
              {i < filtered.length - 1 && <div className="w-px flex-1 bg-zinc-800" />}
            </div>
            {/* Content */}
            <div className="pb-6 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm">{entry.agentEmoji}</span>
                <span className="text-xs font-medium text-zinc-300">{entry.agent}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{entry.projectId}</span>
                <StatusBadge status={entry.status} />
              </div>
              <p className="text-sm text-zinc-400 mb-1">{entry.action}</p>
              <span className="text-[10px] text-zinc-600">
                {new Date(entry.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-zinc-500 text-sm">No activity matching filter</div>
      )}
    </>
  );
}
