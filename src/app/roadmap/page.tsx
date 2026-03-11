"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type MilestoneStatus = "done" | "in-progress" | "queued" | "blocked";

interface Milestone {
  id: string; title: string; status: MilestoneStatus;
  targetDate?: string; description?: string;
  taskCount: number; doneCount: number;
}
interface Project {
  id: string; name: string; emoji: string; tagline: string; color: string;
  milestones: Milestone[];
  currentMilestone: { title: string; status: string; targetDate?: string } | null;
  milestoneDone: number; milestoneTotal: number;
  openTasks: number; updatedAt: string | null;
}

const STATUS_COLOR: Record<MilestoneStatus, string> = {
  "done":        "bg-zinc-800 text-zinc-500 border-zinc-700",
  "in-progress": "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
  "queued":      "bg-zinc-800/60 text-zinc-400 border-zinc-700",
  "blocked":     "bg-red-500/10 text-red-400 border-red-500/30",
};
const STATUS_DOT: Record<MilestoneStatus, string> = {
  "done": "bg-zinc-600", "in-progress": "bg-indigo-400", "queued": "bg-zinc-600", "blocked": "bg-red-400",
};
const PROJ_ACCENT: Record<string, string> = {
  indigo: "border-indigo-500/40 bg-indigo-500/5",
  amber:  "border-amber-500/40 bg-amber-500/5",
  violet: "border-violet-500/40 bg-violet-500/5",
  emerald:"border-emerald-500/40 bg-emerald-500/5",
  orange: "border-orange-500/40 bg-orange-500/5",
};
const PROJ_TITLE: Record<string, string> = {
  indigo: "text-indigo-300", amber: "text-amber-300", violet: "text-violet-300",
  emerald: "text-emerald-300", orange: "text-orange-300",
};

function ProgressBar({ done, total, color }: { done: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const barColor: Record<string,string> = { indigo:"bg-indigo-500", amber:"bg-amber-500", violet:"bg-violet-500", emerald:"bg-emerald-500", orange:"bg-orange-500" };
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor[color]}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-zinc-600">{done}/{total}</span>
    </div>
  );
}

export default function RoadmapPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/roadmap").then(r => r.json()).then(d => { setProjects(d.projects ?? []); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Loading roadmap...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-16">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Company Roadmap</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Orion · {projects.length} products</p>
          </div>
          <Link href="/planner" className="text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-lg">My Planner →</Link>
        </div>
      </div>

      <div className="px-4 space-y-3">
        {projects.map(p => {
          const isOpen = expanded === p.id;
          const accent = PROJ_ACCENT[p.color] ?? PROJ_ACCENT.indigo;
          const titleColor = PROJ_TITLE[p.color] ?? PROJ_TITLE.indigo;
          return (
            <div key={p.id} className={`rounded-xl border ${accent}`}>
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : p.id)}
                className="w-full px-4 py-4 text-left"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{p.emoji}</span>
                      <span className={`font-bold text-sm ${titleColor}`}>{p.name}</span>
                      {p.openTasks > 0 && (
                        <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{p.openTasks} open</span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 ml-7">{p.tagline}</p>
                  </div>
                  <span className="text-zinc-600 text-xs mt-1">{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* Current milestone + progress */}
                <div className="mt-3 ml-7 space-y-2">
                  {p.currentMilestone && (
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[p.currentMilestone.status as MilestoneStatus] ?? "bg-zinc-600"}`} />
                      <span className="text-xs text-zinc-300 truncate">{p.currentMilestone.title}</span>
                      {p.currentMilestone.targetDate && (
                        <span className="text-xs text-zinc-600 flex-shrink-0">→ {p.currentMilestone.targetDate}</span>
                      )}
                    </div>
                  )}
                  <ProgressBar done={p.milestoneDone} total={p.milestoneTotal} color={p.color} />
                </div>
              </button>

              {/* Expanded milestone list */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-zinc-800/60 pt-3">
                  <p className="text-xs text-zinc-600 uppercase tracking-wider mb-2">Milestones</p>
                  {p.milestones.length === 0 ? (
                    <p className="text-xs text-zinc-600 italic">No milestones yet — add them to data/sprints/{p.id}.json</p>
                  ) : (
                    p.milestones.map(m => (
                      <div key={m.id} className={`rounded-lg border px-3 py-2.5 ${STATUS_COLOR[m.status]}`}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[m.status]}`} />
                              <span className="text-sm font-medium">{m.title}</span>
                            </div>
                            {m.description && <p className="text-xs text-zinc-500 mt-0.5 ml-3.5">{m.description}</p>}
                          </div>
                          {m.targetDate && <span className="text-xs text-zinc-600 flex-shrink-0">{m.targetDate}</span>}
                        </div>
                        {m.taskCount > 0 && (
                          <div className="mt-2 ml-3.5">
                            <ProgressBar done={m.doneCount} total={m.taskCount} color="indigo" />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                  <div className="flex gap-2 mt-3">
                    <Link href={`/projects/${p.id}`} className="text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-lg">Sprint →</Link>
                    {(p.id === "ai-r") && (
                      <Link href={`/projects/${p.id}/timeline`} className="text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-lg">Timeline →</Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom nav shortcut */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0f] border-t border-zinc-800 px-4 py-3 flex gap-3 justify-center">
        <Link href="/" className="text-xs text-zinc-600 px-3 py-1.5">Home</Link>
        <Link href="/roadmap" className="text-xs text-indigo-400 px-3 py-1.5 font-medium">Roadmap</Link>
        <Link href="/planner" className="text-xs text-zinc-600 px-3 py-1.5">Planner</Link>
        <Link href="/memory" className="text-xs text-zinc-600 px-3 py-1.5">Memory</Link>
      </div>
    </div>
  );
}
