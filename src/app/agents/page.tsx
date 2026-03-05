"use client";

import { useState, useEffect } from "react";
import { Bot } from "lucide-react";

interface AgentEntry {
  name: string;
  emoji: string;
  project: string;
  domain: string;
  status: string;
  version: string;
  section: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-green-500/20 text-green-400 border-green-500/30",
  training: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  draft: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  planned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<AgentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/agents")
      .then((r) => r.json())
      .then((data) => {
        setAgents(data.agents ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const projects = ["all", ...new Set(agents.map((a) => a.project))];
  const filtered = filter === "all" ? agents : agents.filter((a) => a.project === filter);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Agent Roster</h1>
        <p className="text-zinc-500 text-sm">All agents across all projects</p>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {projects.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              filter === p
                ? "bg-zinc-800 text-white border-zinc-700"
                : "text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
            }`}
          >
            {p === "all" ? "All" : p}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading roster...</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">Agent</th>
                  <th className="text-left px-4 py-3 font-medium">Project</th>
                  <th className="text-left px-4 py-3 font-medium">Domain</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Version</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((agent, i) => (
                  <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{agent.emoji}</span>
                        <span className="text-zinc-200 font-medium">{agent.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400">{agent.project}</td>
                    <td className="px-4 py-3 text-zinc-400">{agent.domain}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[agent.status] || STATUS_STYLES.planned}`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">{agent.version}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile grid */}
          <div className="md:hidden space-y-3">
            {filtered.map((agent, i) => (
              <div key={i} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{agent.emoji}</span>
                    <span className="font-semibold text-sm">{agent.name}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_STYLES[agent.status] || STATUS_STYLES.planned}`}>
                    {agent.status}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 space-y-0.5">
                  <p>{agent.project} — {agent.domain}</p>
                  <p className="font-mono">{agent.version}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600">
            <Bot className="w-3.5 h-3.5" />
            <span>{filtered.length} agent{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </>
      )}
    </>
  );
}
