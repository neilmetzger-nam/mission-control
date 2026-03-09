"use client";

import { useState, useEffect, use } from "react";

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

export default function ProjectAgentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [entries, setEntries] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agent-activity")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setEntries(d.filter((e: AgentEntry) => e.projectId === id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center py-12 text-zinc-500 text-sm">Loading agent activity...</div>;
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{id.toUpperCase()} Agent Activity</h1>
        <p className="text-zinc-500 text-sm">{entries.length} event{entries.length !== 1 ? "s" : ""} logged</p>
      </div>

      {entries.length === 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-zinc-500 text-sm">No agent activity recorded for this project yet</p>
        </div>
      )}

      {entries.length > 0 && (
        <div className="space-y-0">
          {entries.map((entry, i) => (
            <div key={entry.id} className="flex gap-4">
              {/* Timeline line */}
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-600 mt-1.5" />
                {i < entries.length - 1 && <div className="w-px flex-1 bg-zinc-800" />}
              </div>
              {/* Content */}
              <div className="pb-6 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{entry.agentEmoji}</span>
                  <span className="text-xs font-medium text-zinc-300">{entry.agent}</span>
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
      )}
    </>
  );
}
