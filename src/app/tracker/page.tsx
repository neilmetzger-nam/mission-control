"use client";

import { useState, useEffect } from "react";
import { ClipboardList } from "lucide-react";

interface TrackerIssue {
  id: string;
  title: string;
  type: string;
  assignee: string;
  status: string;
  statusEmoji: string;
  priority: string;
  project: string;
}

const STATUS_STYLES: Record<string, string> = {
  blocked: "bg-red-500/20 text-red-400 border-red-500/30",
  ready: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  "in-progress": "bg-green-500/20 text-green-400 border-green-500/30",
  done: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  backlog: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const PRIORITY_STYLES: Record<string, string> = {
  critical: "text-red-400",
  high: "text-orange-400",
  medium: "text-yellow-400",
  low: "text-zinc-500",
};

export default function TrackerPage() {
  const [issues, setIssues] = useState<TrackerIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetch("/api/tracker")
      .then((r) => r.json())
      .then((data) => {
        setIssues(data.issues ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const projects = ["all", ...new Set(issues.map((i) => i.project))];
  const statuses = ["all", "blocked", "ready", "in-progress", "done", "backlog"];

  const filtered = issues.filter((i) => {
    if (projectFilter !== "all" && i.project !== projectFilter) return false;
    if (statusFilter !== "all" && i.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Issue Tracker</h1>
        <p className="text-zinc-500 text-sm">Tasks, bugs, and code requests across projects</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-5">
        <div>
          <label className="text-xs text-zinc-600 block mb-1.5">Project</label>
          <div className="flex gap-1.5 flex-wrap">
            {projects.map((p) => (
              <button
                key={p}
                onClick={() => setProjectFilter(p)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  projectFilter === p
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {p === "all" ? "All" : p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-600 block mb-1.5">Status</label>
          <div className="flex gap-1.5 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  statusFilter === s
                    ? "bg-zinc-800 text-white border-zinc-700"
                    : "text-zinc-500 border-zinc-800 hover:border-zinc-700"
                }`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-zinc-500">Loading tracker...</p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Type</th>
                  <th className="text-left px-4 py-3 font-medium">Assignee</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Priority</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((issue) => (
                  <tr key={issue.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{issue.id}</td>
                    <td className="px-4 py-3 text-zinc-200">{issue.title}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs">{issue.type}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">{issue.assignee}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${STATUS_STYLES[issue.status] || STATUS_STYLES.backlog}`}>
                        {issue.statusEmoji} {issue.status}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-xs font-medium ${PRIORITY_STYLES[issue.priority] || "text-zinc-500"}`}>
                      {issue.priority}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((issue) => (
              <div key={issue.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-mono text-xs text-zinc-500 block mb-0.5">{issue.id}</span>
                    <span className="text-sm text-zinc-200">{issue.title}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border shrink-0 ${STATUS_STYLES[issue.status] || STATUS_STYLES.backlog}`}>
                    {issue.statusEmoji} {issue.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>{issue.type}</span>
                  <span>{issue.assignee}</span>
                  <span className={PRIORITY_STYLES[issue.priority] || ""}>{issue.priority}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>{filtered.length} issue{filtered.length !== 1 ? "s" : ""}</span>
          </div>
        </>
      )}
    </>
  );
}
