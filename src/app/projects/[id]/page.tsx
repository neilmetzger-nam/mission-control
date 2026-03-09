"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChevronDown, ChevronRight, AlertTriangle, Clock, Zap, CheckCircle } from "lucide-react";


interface Task { id: string; title: string; status: string; assignee: string; notes?: string[]; }
interface Sprint { id: string; title: string; status: string; tasks: Task[]; }
interface Milestone { id: string; title: string; description: string; targetDate: string; status: string; sprints: Sprint[]; }
interface ProjectPlan { projectId: string; updatedAt: string; milestones: Milestone[]; }

const statusColor: Record<string, string> = {
  done: "bg-green-500/20 text-green-400 border-green-500/30",
  "in-progress": "bg-blue-500/20 text-blue-400 border-blue-500/30",
  "needs-review": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  queued: "bg-zinc-700/50 text-zinc-400 border-zinc-600",
  blocked: "bg-red-500/20 text-red-400 border-red-500/30",
  "agent-working": "bg-blue-500/20 text-blue-400 border-blue-500/30 animate-pulse",
};

function Badge({ label }: { label: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[label] ?? "bg-zinc-700 text-zinc-400 border-zinc-600"}`}>{label}</span>;
}

function daysUntil(dateStr: string) {
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}


interface Task { id: string; title: string; status: string; assignee: string; notes?: string[]; }

function TaskRow({ task, projectId, sprintId, onUpdate }: {
  task: Task; projectId: string; sprintId: string;
  onUpdate: (t: Task) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [noteText, setNoteText] = useState("");
  const hasNotes = task.notes && task.notes.length > 0;

  const addNote = async () => {
    if (!noteText.trim()) return;
    const updated = { ...task, notes: [...(task.notes || []), noteText.trim()] };
    await fetch(`/api/sprints/${projectId}/task/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: updated.notes }),
    });
    onUpdate(updated);
    setNoteText("");
    setEditing(false);
  };

  return (
    <div className="rounded-lg bg-zinc-800/40 overflow-hidden">
      <div className="flex items-center gap-3 py-1.5 px-3">
        <button onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-2 text-left min-w-0">
          <span className="text-sm flex-1 leading-snug">{task.title}</span>
          {hasNotes && <span className="text-xs text-zinc-500 shrink-0">📎 {task.notes!.length}</span>}
        </button>
        <span className="text-xs shrink-0">{task.assignee === "agent" ? "🤖" : "👤"}</span>
        <Badge label={task.status} />
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-700/50 pt-2 space-y-1.5">
          {task.notes?.map((note, i) => (
            <div key={i} className="text-xs text-zinc-400 bg-zinc-900/60 rounded px-2 py-1.5 leading-relaxed">
              {note.startsWith("http") ? (
                <a href={note} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{note}</a>
              ) : note}
            </div>
          ))}
          {!task.notes?.length && !editing && (
            <p className="text-xs text-zinc-600 italic">No notes yet</p>
          )}
          {editing ? (
            <div className="flex gap-2 mt-1">
              <input
                autoFocus
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") addNote(); if (e.key === "Escape") setEditing(false); }}
                placeholder="Add a note, link, or contact..."
                className="flex-1 text-xs bg-zinc-900 border border-zinc-700 rounded px-2 py-1.5 text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-500"
              />
              <button onClick={addNote} className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors">Add</button>
              <button onClick={() => setEditing(false)} className="text-xs px-2 py-1 bg-zinc-700 hover:bg-zinc-600 rounded text-zinc-300 transition-colors">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">+ add note</button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ProjectTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [openMilestones, setOpenMilestones] = useState<Set<string>>(new Set());
  const [openSprints, setOpenSprints] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/sprints/${id}`).then(r => {
      if (!r.ok) return null;
      return r.json();
    }).then(data => {
      if (!data || !data.milestones) return;
      setPlan(data);
      const active = data.milestones?.find((m: Milestone) => m.status === "in-progress");
      if (active) setOpenMilestones(new Set([active.id]));
    });
  }, [id]);

  if (!plan) return <div className="p-6 text-zinc-500 text-sm">No plan data yet for this project.</div>;
  if (!plan.milestones || plan.milestones.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h1 className="text-2xl font-bold capitalize mb-1">{plan.projectId}</h1>
          <p className="text-zinc-500 text-sm mt-2">No milestones defined yet. Add sprints to get started.</p>
        </div>
      </div>
    );
  }

  const allTasks = plan.milestones.flatMap(m => m.sprints.flatMap(s => s.tasks));
  const done = allTasks.filter(t => t.status === "done").length;
  const total = allTasks.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const blockers = allTasks.filter(t => t.status === "blocked");
  const needsReview = allTasks.filter(t => t.status === "needs-review");
  const waitingHuman = allTasks.filter(t => t.assignee === "human" && t.status === "queued");
  const agentWorking = allTasks.filter(t => t.status === "agent-working");

  const activeMilestone = plan.milestones.find(m => m.status === "in-progress") ?? plan.milestones[0];
  const days = daysUntil(activeMilestone.targetDate);
  const daysColor = days < 0 ? "text-red-400" : days <= 7 ? "text-yellow-400" : "text-green-400";

  const whySoLong = [
    ...blockers.map(t => ({ icon: "⛔", color: "text-red-400", label: `Blocked: ${t.title}` })),
    ...needsReview.map(t => ({ icon: "👁", color: "text-yellow-400", label: `Needs your review: ${t.title}` })),
    ...waitingHuman.map(t => ({ icon: "👤", color: "text-orange-400", label: `Waiting on you: ${t.title}` })),
    ...agentWorking.map(t => ({ icon: "🤖", color: "text-blue-400", label: `Agent working: ${t.title}` })),
  ];

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Layer 1 — Where are we */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold capitalize mb-1">{plan.projectId}</h1>
            <p className="text-zinc-500 text-sm">Current milestone: <span className="text-white font-medium">{activeMilestone.title}</span></p>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-bold ${daysColor}`}>{days < 0 ? `${Math.abs(days)}d late` : `${days}d`}</div>
            <div className="text-xs text-zinc-500">{days < 0 ? "overdue" : "until " + activeMilestone.targetDate}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>{done} of {total} tasks done</span>
            <span>{pct}%</span>
          </div>
          <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Milestone chips */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {plan.milestones.map(m => (
            <div key={m.id} className={`text-xs px-3 py-1 rounded-full border flex items-center gap-1.5 ${statusColor[m.status] ?? "bg-zinc-700 text-zinc-400 border-zinc-600"}`}>
              {m.status === "done" && <CheckCircle className="w-3 h-3" />}
              {m.status === "in-progress" && <Zap className="w-3 h-3" />}
              {m.status === "queued" && <Clock className="w-3 h-3" />}
              {m.title} · {m.targetDate}
            </div>
          ))}
        </div>
      </div>

      {/* Layer 2 — Why so long */}
      {whySoLong.length > 0 && (
        <div className="bg-zinc-900 border border-yellow-500/20 rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-yellow-400 flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4" /> Why so long?
          </h2>
          <div className="space-y-2">
            {whySoLong.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span>{item.icon}</span>
                <span className={item.color}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Layer 3 — Milestones drill-down */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-400 mb-3">Milestones & Sprints</h2>
        <div className="space-y-2">
          {plan.milestones.map((m, idx) => {
            const mTasks = m.sprints.flatMap(s => s.tasks);
            const mDone = mTasks.filter(t => t.status === "done").length;
            const mPct = mTasks.length ? Math.round((mDone / mTasks.length) * 100) : 0;
            const isOpen = openMilestones.has(m.id);

            return (
              <div key={m.id} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <button onClick={() => setOpenMilestones(p => { const n = new Set(p); n.has(m.id) ? n.delete(m.id) : n.add(m.id); return n; })}
                  className="w-full text-left p-4 hover:bg-zinc-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-600 text-xs font-mono">M{idx + 1}</span>
                    {isOpen ? <ChevronDown className="w-4 h-4 text-zinc-500" /> : <ChevronRight className="w-4 h-4 text-zinc-500" />}
                    <span className="font-medium flex-1">{m.title}</span>
                    <Badge label={m.status} />
                    <span className="text-xs text-zinc-500">{mPct}% · {m.targetDate}</span>
                  </div>
                  <div className="mt-2 ml-11 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${mPct}%` }} />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-800">
                    {m.sprints.map(sprint => {
                      const sDone = sprint.tasks.filter(t => t.status === "done").length;
                      const spOpen = openSprints.has(sprint.id);
                      const sBlocked = sprint.tasks.filter(t => t.status === "blocked").length;
                      const sReview = sprint.tasks.filter(t => t.status === "needs-review").length;

                      return (
                        <div key={sprint.id} className="border-b border-zinc-800/50 last:border-0">
                          <button onClick={() => setOpenSprints(p => { const n = new Set(p); n.has(sprint.id) ? n.delete(sprint.id) : n.add(sprint.id); return n; })}
                            className="w-full text-left px-6 py-3 hover:bg-zinc-800/30 transition-colors">
                            <div className="flex items-center gap-2">
                              {spOpen ? <ChevronDown className="w-3 h-3 text-zinc-600" /> : <ChevronRight className="w-3 h-3 text-zinc-600" />}
                              <span className="text-sm flex-1">{sprint.title}</span>
                              {sBlocked > 0 && <span className="text-xs text-red-400">⛔ {sBlocked}</span>}
                              {sReview > 0 && <span className="text-xs text-yellow-400">👁 {sReview}</span>}
                              <Badge label={sprint.status} />
                              <span className="text-xs text-zinc-600">{sDone}/{sprint.tasks.length}</span>
                            </div>
                          </button>

                          {spOpen && (
                            <div className="px-6 pb-3 space-y-2">
                              {sprint.tasks.map(task => (
                                <TaskRow key={task.id} task={task} projectId={id} sprintId={sprint.id} onUpdate={(updated) => {
                                  setPlan(prev => {
                                    if (!prev) return prev;
                                    return { ...prev, milestones: prev.milestones.map(m => ({ ...m, sprints: m.sprints.map(s => ({ ...s, tasks: s.tasks.map(t => t.id === updated.id ? updated : t) })) })) };
                                  });
                                }} />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
