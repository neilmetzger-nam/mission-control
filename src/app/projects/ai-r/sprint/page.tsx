"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Clock, User } from "lucide-react";

// ─── Types ──────────────────────────────────────────────
type Status = "not-started" | "in-progress" | "done" | "verified";

interface SprintTask {
  id: number;
  title: string;
  owner: string;
  status: Status;
  notes: string;
  updatedAt: string;
}

interface ActivityEntry {
  task: string;
  from: Status;
  to: Status;
  who: string;
  at: string;
}

// ─── Constants ──────────────────────────────────────────
const TARGET = new Date("2026-03-15T23:59:59");

const STATUS_CYCLE: Status[] = ["not-started", "in-progress", "done", "verified"];

const STATUS_CONFIG: Record<Status, { emoji: string; label: string; style: string }> = {
  "not-started": { emoji: "🔴", label: "Not Started", style: "bg-red-500/20 text-red-400 border-red-500/30" },
  "in-progress": { emoji: "🟡", label: "In Progress", style: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  "done":        { emoji: "🟢", label: "Done",        style: "bg-green-500/20 text-green-400 border-green-500/30" },
  "verified":    { emoji: "✅", label: "Verified",    style: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
};

const INITIAL_TASKS: SprintTask[] = [
  { id: 1, title: "Beta onboarding flow (signup → login → welcome email → checklist)", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 2, title: "Menu CSV upload → real data in dashboard", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 3, title: "Invoice photo capture (snap → AI extracts costs)", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 4, title: 'Voice purchase logging ("8 bucks of carrots")', owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 5, title: "Dashboard kills all mocks — real data or empty states", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 6, title: "Delivery economics (upload DD/UE statement → real margins)", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 7, title: "Plate costing (5-10 items, real food cost %)", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 8, title: "Maestro voice demo working end-to-end", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 9, title: "Beta landing page at ai-restaurant.net/beta", owner: "Dave", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
  { id: 10, title: "Stripe subscription wired (trial → paid)", owner: "Dave/Neil", status: "not-started", notes: "", updatedAt: new Date().toISOString() },
];

const TASKS_KEY = "air-sprint-tasks";
const ACTIVITY_KEY = "air-sprint-activity";

// ─── Helpers ────────────────────────────────────────────
function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function countdown(): string {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return "Launch day!";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}d ${hours}h remaining`;
}

function loadTasks(): SprintTask[] {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TASKS_KEY) : null;
    return stored ? JSON.parse(stored) : INITIAL_TASKS;
  } catch {
    return INITIAL_TASKS;
  }
}

function loadActivity(): ActivityEntry[] {
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem(ACTIVITY_KEY) : null;
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function weekDone(weekTasks: SprintTask[]) {
  return weekTasks.filter((t) => t.status === "done" || t.status === "verified").length;
}

// ─── Sub-components (outside main component) ────────────
function TaskCard({
  task,
  editingNotes,
  onCycleStatus,
  onEditNotes,
  onUpdateNotes,
  mounted,
}: {
  task: SprintTask;
  editingNotes: number | null;
  onCycleStatus: (id: number) => void;
  onEditNotes: (id: number | null) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  mounted: boolean;
}) {
  const cfg = STATUS_CONFIG[task.status];
  const isEditing = editingNotes === task.id;

  return (
    <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-800">
      <div className="flex items-start gap-3 mb-3">
        <span className="text-zinc-500 font-mono text-xs mt-0.5 shrink-0 w-5 text-right">{task.id}.</span>
        <p className="text-sm text-zinc-200 flex-1 leading-relaxed">{task.title}</p>
      </div>

      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onCycleStatus(task.id)}
          className={`text-xs px-2 py-0.5 rounded-full border cursor-pointer transition-colors ${cfg.style}`}
          title="Click to cycle status"
        >
          {cfg.emoji} {cfg.label}
        </button>
        <span className="text-xs bg-zinc-700/50 text-zinc-400 px-2 py-0.5 rounded-full flex items-center gap-1">
          <User className="w-3 h-3" />
          {task.owner}
        </span>
      </div>

      {isEditing ? (
        <input
          autoFocus
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-300 focus:outline-none focus:border-zinc-500 mt-1"
          defaultValue={task.notes}
          placeholder="Add notes..."
          onBlur={(e) => {
            onUpdateNotes(task.id, e.target.value);
            onEditNotes(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onUpdateNotes(task.id, (e.target as HTMLInputElement).value);
              onEditNotes(null);
            }
          }}
        />
      ) : (
        <p
          onClick={() => onEditNotes(task.id)}
          className="text-xs text-zinc-600 mt-1 cursor-pointer hover:text-zinc-400 transition-colors min-h-[18px]"
        >
          {task.notes || "Click to add notes..."}
        </p>
      )}

      <div className="flex items-center gap-1 mt-2 text-[10px] text-zinc-600">
        <Clock className="w-3 h-3" />
        {mounted ? relativeTime(task.updatedAt) : "—"}
      </div>
    </div>
  );
}

function WeekColumn({
  label,
  due,
  weekTasks,
  editingNotes,
  onCycleStatus,
  onEditNotes,
  onUpdateNotes,
  mounted,
}: {
  label: string;
  due: string;
  weekTasks: SprintTask[];
  editingNotes: number | null;
  onCycleStatus: (id: number) => void;
  onEditNotes: (id: number | null) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  mounted: boolean;
}) {
  const done = weekDone(weekTasks);
  const total = weekTasks.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-zinc-200">{label}</h2>
        <span className="text-xs text-zinc-500">due {due}</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-xs text-zinc-500">{done} / {total}</span>
      </div>

      <div className="space-y-3">
        {weekTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            editingNotes={editingNotes}
            onCycleStatus={onCycleStatus}
            onEditNotes={onEditNotes}
            onUpdateNotes={onUpdateNotes}
            mounted={mounted}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────
export default function AirSprintPage() {
  const [tasks, setTasks] = useState<SprintTask[]>(loadTasks);
  const [activity, setActivity] = useState<ActivityEntry[]>(loadActivity);
  const [clock, setClock] = useState(countdown());
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  // Persist tasks
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(TASKS_KEY, JSON.stringify(tasks)); } catch {}
  }, [tasks, mounted]);

  // Persist activity
  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activity)); } catch {}
  }, [activity, mounted]);

  // Countdown ticker
  useEffect(() => {
    const interval = setInterval(() => setClock(countdown()), 60000);
    return () => clearInterval(interval);
  }, []);

  const cycleStatus = useCallback((taskId: number) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const curIdx = STATUS_CYCLE.indexOf(t.status);
        const nextStatus = STATUS_CYCLE[(curIdx + 1) % STATUS_CYCLE.length];

        setActivity((a) => [
          { task: t.title, from: t.status, to: nextStatus, who: t.owner, at: new Date().toISOString() },
          ...a,
        ].slice(0, 20));

        return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
      })
    );
  }, []);

  const updateNotes = useCallback((taskId: number, notes: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, notes, updatedAt: new Date().toISOString() } : t))
    );
  }, []);

  const week1 = tasks.filter((t) => t.id <= 5);
  const week2 = tasks.filter((t) => t.id >= 6);

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Beta Launch — March 15, 2026</h1>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-yellow-400" />
          <span className="text-yellow-400 font-medium">{clock}</span>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <WeekColumn
          label="Week 1 — Core Loop" due="Mar 9" weekTasks={week1}
          editingNotes={editingNotes} onCycleStatus={cycleStatus}
          onEditNotes={setEditingNotes} onUpdateNotes={updateNotes} mounted={mounted}
        />
        <WeekColumn
          label="Week 2 — Wow Factor" due="Mar 15" weekTasks={week2}
          editingNotes={editingNotes} onCycleStatus={cycleStatus}
          onEditNotes={setEditingNotes} onUpdateNotes={updateNotes} mounted={mounted}
        />
      </div>

      {/* Activity Log */}
      <div>
        <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Activity Log</h2>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-600 p-4">No activity yet. Click a status badge to cycle it.</p>
          ) : (
            activity.slice(0, 5).map((entry, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-2 text-xs">
                <span className="text-zinc-400">{entry.who}</span>
                <span className="text-zinc-600">marked</span>
                <span className="text-zinc-300 truncate max-w-[200px]">{entry.task}</span>
                <span className="text-zinc-600">→</span>
                <span className={`px-1.5 py-0.5 rounded border ${STATUS_CONFIG[entry.to].style}`}>
                  {STATUS_CONFIG[entry.to].emoji} {STATUS_CONFIG[entry.to].label}
                </span>
                <span className="text-zinc-600 ml-auto shrink-0">
                  {mounted ? relativeTime(entry.at) : "—"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
