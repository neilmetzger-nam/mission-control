"use client";

import { useState, useEffect, use } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  assignee: string;
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
  "agent-working": "bg-blue-500/20 text-blue-400 border border-blue-500/30 animate-pulse",
  "needs-review": "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
  done: "bg-green-500/20 text-green-400 border border-green-500/30",
  blocked: "bg-red-500/20 text-red-400 border border-red-500/30",
};

const ASSIGNEE_LABELS: Record<string, string> = {
  agent: "\u{1F916} Agent",
  human: "\u{1F464} Human",
  tbd: "\u2753 TBD",
};

export default function SprintBoard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<SprintData | null>(null);
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [error, setError] = useState("");

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

    const res = await fetch(`/api/sprints/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ taskId, status: nextStatus }),
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
  const doneCount = allTasks.filter((t) => t.status === "done").length;
  const inProgressCount = allTasks.filter((t) => t.status === "agent-working").length;
  const blockedCount = allTasks.filter((t) => t.status === "blocked").length;

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
                  <div key={task.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      onClick={() => cycleStatus(task.id, task.status)}
                      className={`text-[10px] px-2 py-1 rounded-full cursor-pointer select-none ${STATUS_STYLES[task.status] || STATUS_STYLES.queued}`}
                    >
                      {task.status}
                    </button>
                    <span className="flex-1 text-sm text-zinc-300">{task.title}</span>
                    <span className="text-xs text-zinc-500">
                      {ASSIGNEE_LABELS[task.assignee] || ASSIGNEE_LABELS.tbd}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-zinc-500 text-sm">No milestones yet</div>
      )}
    </>
  );
}
