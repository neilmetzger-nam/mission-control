"use client";

import { useState, useEffect, use } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: string;
  migration_notes?: string;
  claudePrompt?: string;
  notes?: string;
  completedAt?: string;
}

interface Sprint {
  id: string;
  title: string;
  tasks: Task[];
}

interface Milestone {
  id: string;
  title: string;
  sprints: Sprint[];
}

interface SprintData {
  projectId: string;
  milestones: Milestone[];
}

const STATUS_ORDER = ["queued", "agent-working", "needs-review", "done", "blocked"];

const STATUS_STYLES: Record<string, string> = {
  queued: "bg-zinc-700 text-zinc-300",
  "in-progress": "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  "agent-working": "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse",
  "needs-review": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  done: "bg-green-500/20 text-green-400 border border-green-500/30",
  blocked: "bg-red-500/20 text-red-400 border border-red-500/30",
  ready_for_staging: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  in_staging: "bg-purple-500/20 text-purple-400 border border-purple-500/30",
  in_prod: "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

const ASSIGNEE_LABELS: Record<string, string> = {
  agent: "\u{1F916} Agent",
  human: "\u{1F464} Human",
  neil: "\u{1F464} Neil",
  obie: "\u{1F477} Obie",
  tbd: "\u2753 TBD",
};

export default function SprintBoard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<SprintData | null>(null);
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [error, setError] = useState("");

  // Staging modal state
  const [stagingModal, setStagingModal] = useState<{ taskId: string; title: string } | null>(null);
  const [migrationNotes, setMigrationNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Claude prompt state
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null); // taskId being edited
  const [promptDraft, setPromptDraft] = useState("");

  useEffect(() => {
    fetch(`/api/sprints/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Sprint data not found");
        return r.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, [id]);

  async function cycleStatus(taskId: string, currentStatus: string) {
    const nextIdx = (STATUS_ORDER.indexOf(currentStatus) + 1) % STATUS_ORDER.length;
    const nextStatus = STATUS_ORDER[nextIdx];

    const res = await fetch(`/api/sprints/${id}/task/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });

    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        const updated = JSON.parse(JSON.stringify(prev));

        for (const ms of updated.milestones) {
          for (const sprint of ms.sprints) {
            for (const task of sprint.tasks) {
              if (task.id === taskId) task.status = nextStatus;
            }
          }
        }

        return updated;
      });
    }
  }

  async function markReadyForStaging() {
    if (!stagingModal) return;
    setSubmitting(true);

    const body: Record<string, string> = { status: "ready_for_staging" };

    if (migrationNotes.trim()) body.migration_notes = migrationNotes.trim();

    const res = await fetch(`/api/sprints/${id}/task/${stagingModal.taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        const updated = JSON.parse(JSON.stringify(prev));

        for (const ms of updated.milestones) {
          for (const sprint of ms.sprints) {
            for (const task of sprint.tasks) {
              if (task.id === stagingModal.taskId) {
                task.status = "ready_for_staging";
                if (migrationNotes.trim()) task.migration_notes = migrationNotes.trim();
              }
            }
          }
        }

        return updated;
      });
    }

    setStagingModal(null);
    setMigrationNotes("");
    setSubmitting(false);
  }

  function togglePrompt(taskId: string) {
    setExpandedPrompts((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  }

  async function savePrompt(taskId: string, prompt: string) {
    const res = await fetch(`/api/sprints/${id}/task/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claudePrompt: prompt }),
    });
    if (res.ok) {
      setData((prev) => {
        if (!prev) return prev;
        const updated = JSON.parse(JSON.stringify(prev));
        for (const ms of updated.milestones)
          for (const sprint of ms.sprints)
            for (const task of sprint.tasks)
              if (task.id === taskId) task.claudePrompt = prompt;
        return updated;
      });
    }
    setEditingPrompt(null);
    setPromptDraft("");
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500 text-sm">{error}</p>
        <p className="text-zinc-600 text-xs mt-2">No sprint data for project &quot;{id}&quot;</p>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12 text-zinc-500 text-sm">Loading sprint board...</div>;
  }

  const milestone = data.milestones[activeMilestone];
  const allTasks = data.milestones.flatMap((ms) => ms.sprints.flatMap((s) => s.tasks));
  const doneCount = allTasks.filter((t) => t.status === "done" || t.status === "in_prod").length;
  const inProgressCount = allTasks.filter((t) => t.status === "agent-working" || t.status === "in-progress").length;
  const blockedCount = allTasks.filter((t) => t.status === "blocked").length;
  const stagingCount = allTasks.filter((t) => t.status === "ready_for_staging" || t.status === "in_staging").length;

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{id.toUpperCase()} Sprint Board</h1>
        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span>{allTasks.length} total</span>
          <span className="text-green-400">{doneCount} done</span>
          <span className="text-blue-400">{inProgressCount} in progress</span>
          <span className="text-red-400">{blockedCount} blocked</span>
          {stagingCount > 0 && (
            <span className="text-amber-400">{stagingCount} staging</span>
          )}
        </div>
      </div>

      {/* Milestone tabs */}
      {data.milestones.length > 0 && (
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {data.milestones.map((ms, i) => (
            <button
              key={ms.id}
              onClick={() => setActiveMilestone(i)}
              className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                i === activeMilestone
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              }`}
            >
              {ms.title}
            </button>
          ))}
        </div>
      )}

      {/* Sprint cards */}
      {milestone ? (
        <div className="space-y-6">
          {milestone.sprints.map((sprint) => (
            <div key={sprint.id} className="bg-zinc-900 rounded-xl border border-zinc-800">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold">{sprint.title}</h3>
              </div>
              <div className="divide-y divide-zinc-800/50">
                {sprint.tasks.map((task) => (
                  <div key={task.id} className="px-4 py-3">
                    {/* Main task row */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => cycleStatus(task.id, task.status)}
                        className={`text-[10px] px-2 py-1 rounded-full cursor-pointer select-none ${STATUS_STYLES[task.status] || STATUS_STYLES.queued}`}
                      >
                        {task.status}
                      </button>
                      <span className="flex-1 text-sm text-zinc-300">{task.title}</span>
                      {/* completedAt badge */}
                      {task.completedAt && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/20 whitespace-nowrap">
                          ✓ {task.completedAt}
                        </span>
                      )}
                      {/* Claude prompt toggle / add button */}
                      {task.claudePrompt ? (
                        <button
                          onClick={() => togglePrompt(task.id)}
                          className="text-[10px] px-2 py-1 rounded bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition whitespace-nowrap"
                        >
                          {expandedPrompts.has(task.id) ? "▲ prompt" : "▼ prompt"}
                        </button>
                      ) : task.status === "done" ? (
                        <button
                          onClick={() => {
                            setEditingPrompt(task.id);
                            setPromptDraft("");
                            setExpandedPrompts((prev) => new Set(prev).add(task.id));
                          }}
                          className="text-[10px] px-2 py-1 rounded bg-zinc-700/50 text-zinc-500 hover:bg-violet-500/20 hover:text-violet-400 transition whitespace-nowrap"
                        >
                          + add prompt
                        </button>
                      ) : null}
                      {task.status === "done" && (
                        <button
                          onClick={() => setStagingModal({ taskId: task.id, title: task.title })}
                          className="text-[10px] px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition whitespace-nowrap"
                        >
                          &rarr; Stage
                        </button>
                      )}
                      <span className="text-xs text-zinc-500">
                        {ASSIGNEE_LABELS[task.assignee] || ASSIGNEE_LABELS.tbd}
                      </span>
                    </div>
                    {/* notes line */}
                    {task.notes && (
                      <p className="mt-1 ml-1 text-xs text-zinc-500 italic">{task.notes}</p>
                    )}
                    {/* collapsible claude prompt block */}
                    {expandedPrompts.has(task.id) && (
                      <div className="mt-2 ml-1">
                        {editingPrompt === task.id ? (
                          <div className="space-y-2">
                            <textarea
                              autoFocus
                              className="w-full bg-zinc-800 border border-violet-500/40 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500 resize-none font-mono"
                              placeholder="Paste Claude prompt here..."
                              rows={4}
                              value={promptDraft}
                              onChange={(e) => setPromptDraft(e.target.value)}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => savePrompt(task.id, promptDraft)}
                                className="text-[10px] px-3 py-1 rounded bg-violet-600 text-white hover:bg-violet-500 transition"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPrompt(null);
                                  setPromptDraft("");
                                  if (!task.claudePrompt) togglePrompt(task.id);
                                }}
                                className="text-[10px] px-3 py-1 rounded bg-zinc-700 text-zinc-400 hover:text-white transition"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="relative group bg-zinc-800/60 border border-violet-500/20 rounded-lg px-3 py-2 cursor-pointer hover:border-violet-500/40 transition"
                            onClick={() => {
                              setEditingPrompt(task.id);
                              setPromptDraft(task.claudePrompt || "");
                            }}
                          >
                            <p className="text-xs text-zinc-400 font-mono whitespace-pre-wrap">{task.claudePrompt}</p>
                            <span className="absolute top-1 right-2 text-[9px] text-zinc-600 group-hover:text-violet-400 transition">edit</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 text-sm">No milestones yet</div>
      )}

      {/* Staging Modal */}
      {stagingModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-1">Mark Ready for Staging</h3>
            <p className="text-sm text-zinc-400 mb-4">{stagingModal.title}</p>

            <label className="block text-xs text-zinc-500 mb-1">
              Migration notes (optional)
            </label>
            <textarea
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 resize-none"
              placeholder="e.g. Run db/migrations/xyz.sql before pulling..."
              rows={3}
              value={migrationNotes}
              onChange={(e) => setMigrationNotes(e.target.value)}
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
                onClick={() => {
                  setStagingModal(null);
                  setMigrationNotes("");
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-bold bg-amber-500 text-black rounded-lg hover:bg-amber-400 transition disabled:opacity-50"
                disabled={submitting}
                onClick={markReadyForStaging}
              >
                {submitting ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
