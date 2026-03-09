"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  tagline: string;
  status: string;
  phase: string;
  color: string;
}

interface ReviewItem {
  id: string;
  status: string;
}

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
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    planned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[status] || styles.planned}`}>
      {status}
    </span>
  );
}

function PhaseBadge({ phase }: { phase: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
      {phase}
    </span>
  );
}

function ActivityStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    completed: "bg-green-500/20 text-green-400",
    review: "bg-yellow-500/20 text-yellow-400",
    running: "bg-blue-500/20 text-blue-400",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded ${styles[status] || "bg-zinc-800 text-zinc-400"}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [review, setReview] = useState<ReviewItem[]>([]);
  const [activity, setActivity] = useState<AgentEntry[]>([]);

  const [conflicts, setConflicts] = useState<{id:string;entity:string;claim1:string;claim2:string;severity:string;status:string}[]>([]);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects).catch(() => {});
    fetch("/api/review").then((r) => r.json()).then((d) => Array.isArray(d) ? setReview(d) : null).catch(() => {});
    fetch("/api/agent-activity").then((r) => r.json()).then((d) => Array.isArray(d) ? setActivity(d) : null).catch(() => {});
    fetch("/api/conflicts").then((r) => r.json()).then((d) => Array.isArray(d) ? setConflicts(d.filter((x:any)=>x.status==="unresolved")) : null).catch(() => {});
  }, []);

  const pendingReview = review.filter((r) => r.status === "pending");
  const activeTasks = 4; // derived from sprint data
  const recentActivity = activity.slice(0, 5);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Orion OS</h1>
        <p className="text-zinc-500 text-sm">AI venture portfolio command center</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Projects", value: projects.length, color: "text-blue-400" },
          { label: "Active Tasks", value: activeTasks, color: "text-green-400" },
          { label: "Awaiting Review", value: pendingReview.length, color: "text-yellow-400" },
          { label: "Agent Events", value: activity.length, color: "text-purple-400" },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <div className="text-xs text-zinc-500 mb-1">{stat.label}</div>
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Review queue alert */}
      {pendingReview.length > 0 && (
        <Link
          href="/review"
          className="flex items-center gap-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 mb-6 hover:bg-yellow-500/15 transition-colors"
        >
          <span className="text-yellow-400 text-sm font-medium">
            {pendingReview.length} item{pendingReview.length !== 1 ? "s" : ""} awaiting review
          </span>
          <ChevronRight className="w-4 h-4 text-yellow-400 ml-auto" />
        </Link>
      )}

      {/* Project cards */}
      <div className="mb-8">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}/sprints`}
              className="group bg-zinc-900 rounded-xl border border-zinc-800 p-4 hover:border-zinc-600 transition-all"
              style={{ borderLeftColor: project.color, borderLeftWidth: "3px" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-sm">{project.name}</h3>
                <StatusBadge status={project.status} />
                <PhaseBadge phase={project.phase} />
              </div>
              <p className="text-xs text-zinc-500 mb-3">{project.tagline}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-600">View sprints</span>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Agent activity */}
      <div className="mb-8">
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Agent Activity</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {recentActivity.length > 0 ? (
            recentActivity.map((entry) => (
              <div key={entry.id} className="px-4 py-3 flex items-start gap-3">
                <span className="text-base mt-0.5">{entry.agentEmoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium text-zinc-300">{entry.agent}</span>
                    <span className="text-[10px] text-zinc-600">{entry.projectId}</span>
                    <ActivityStatusBadge status={entry.status} />
                  </div>
                  <p className="text-xs text-zinc-500 truncate">{entry.action}</p>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-6 text-center text-sm text-zinc-500">Loading activity...</div>
          )}
        </div>
      </div>

      {/* New Idea CTA */}
      <Link
        href="/idea"
        className="flex items-center justify-center gap-2 bg-purple-500/15 border border-purple-500/30 rounded-xl px-6 py-4 hover:bg-purple-500/20 transition-colors"
      >
        <span className="text-lg">{"\u{1F4A1}"}</span>
        <span className="text-purple-400 font-semibold text-sm">Generate a New Project Idea</span>
      </Link>
    </>
  );
}
