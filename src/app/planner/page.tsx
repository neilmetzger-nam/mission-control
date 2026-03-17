"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DelegatedItem { item: string; who: string; status: string; }
interface Project { id: string; name: string; emoji: string; color: string; openTasks: number; milestoneDone: number; milestoneTotal: number; currentMilestone: { title: string } | null; }
interface PlannerData { today: string[]; thisWeek: string[]; thisMonth: string[]; thisQuarter: string[]; thisYear: string[]; top5: string[]; delegated: DelegatedItem[]; }
type Section = "today" | "thisWeek" | "thisMonth" | "thisQuarter";

const isDone = (t: string) => t.startsWith("~~") && t.endsWith("~~");
const display = (t: string) => t.replace(/^~~|~~$/g, "").replace(/^\*\*|\*\*$/g, "");
const TITLE: Record<string,string> = { indigo:"text-indigo-300", amber:"text-amber-300", violet:"text-violet-300", emerald:"text-emerald-300", orange:"text-orange-500" };
const BAR: Record<string,string> = { indigo:"bg-indigo-500", amber:"bg-amber-500", violet:"bg-violet-500", emerald:"bg-emerald-500", orange:"bg-orange-500" };

/* ── Feature 1: keyword → project grouping ── */
const PROJECT_KEYWORDS: Record<string, string[]> = {
  "ai-r":        ["AI-R", "AIR", "Snap & Say", "Snap", "invoice", "Maestro", "kitchen", "printer", "POS", "receipt", "tip", "Square", "Red Bar", "ordering", "Gloria", "restaurant", "Obie"],
  "orion-mcp":   ["Orion", "MCP", "tool spec", "agent", "Dave", "mission control"],
  "time-trek":   ["Time Trek", "TimeTrek", "timetrek", "Episode", "scene", "Japanese", "language", "Duolingo", "curriculum", "Unity", "game", "Sentinel"],
  "plateai":     ["PlateAI", "Plate AI", "ramen", "campaign", "ad spend", "landing page", "photo", "restaurant photo", "image gen"],
  "ember-azure": ["Ember", "Azure", "Susan", "LOI", "lease", "restaurant opening", "Leesburg", "wood-fire"],
  "backstreet":  ["Backstreet", "Carol"],
};

interface TaskGroup {
  projectId: string | null;
  name: string;
  emoji: string;
  color: string;
  tasks: { item: string; idx: number }[];
}

function matchProject(task: string): string | null {
  const lower = task.toLowerCase();
  for (const [projectId, keywords] of Object.entries(PROJECT_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw.toLowerCase()))) return projectId;
  }
  return null;
}

/* ── Feature 2: date helpers ── */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/* ── SectionBlock (unchanged) ── */
function SectionBlock({ label, items, section, accent, onAdd, onComplete }: {
  label: string; items: string[]; section: Section; accent: string;
  onAdd: (section: Section, text: string) => void;
  onComplete: (section: Section, index: number) => void;
}) {
  const [open, setOpen] = useState(section === "today");
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const remaining = items.filter(t => !isDone(t)).length;

  return (
    <div className={`rounded-xl border ${accent}`}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
          {remaining > 0 && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{remaining}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); setAdding(true); setOpen(true); }}
            className="text-zinc-600 hover:text-zinc-400 text-lg w-8 h-8 flex items-center justify-center">+</button>
          <span className="text-zinc-600 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-1">
          {items.map((item, i) => {
            const done = isDone(item);
            return (
              <button key={i} onClick={() => !done && onComplete(section, i)}
                className="w-full flex items-center gap-3 min-h-[40px] px-2 rounded-lg active:bg-white/5 text-left">
                <span className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${done ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-400" : "border-zinc-700"}`}>
                  {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M8.5 2.5L4 7.5L1.5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>}
                </span>
                <span className={`text-sm flex-1 ${done ? "line-through text-zinc-600" : "text-zinc-200"}`}>{display(item)}</span>
              </button>
            );
          })}
          {adding && (
            <div className="flex gap-2 mt-2">
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd(section, text); setText(""); setAdding(false); } if (e.key === "Escape") { setAdding(false); setText(""); }}}
                placeholder="Add item… (Enter to save)" autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
              <button onClick={() => { if (text.trim()) { onAdd(section, text); setText(""); setAdding(false); }}}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm">Add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Feature 1: Grouped Today Block with drag-between-groups ── */
function GroupedTodayBlock({ items, projects, overrides, onAdd, onComplete, onReassign }: {
  items: string[];
  projects: Project[];
  overrides: Record<string, string>;
  onAdd: (section: Section, text: string) => void;
  onComplete: (section: Section, index: number) => void;
  onReassign: (taskKey: string, targetProjectId: string | null) => void;
}) {
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [dragOverGroup, setDragOverGroup] = useState<string | null>(null);
  const [dragActiveTask, setDragActiveTask] = useState<string | null>(null);
  const dragTaskRef = useRef<string | null>(null);
  const remaining = items.filter(t => !isDone(t)).length;

  const groups = useMemo(() => {
    const top5 = projects.slice(0, 5);
    const projectMap = new Map(top5.map(p => [p.id, p]));
    const gMap = new Map<string, TaskGroup>();
    const gList: TaskGroup[] = [];

    items.forEach((item, i) => {
      const key = display(item);
      let pid: string | null;
      if (key in overrides) {
        pid = overrides[key] === "__other__" ? null : overrides[key];
      } else {
        pid = matchProject(item);
      }
      const groupKey = pid ?? "__other__";
      if (!gMap.has(groupKey)) {
        const p = pid ? projectMap.get(pid) : null;
        const g: TaskGroup = { projectId: pid, name: p?.name ?? "Other", emoji: p?.emoji ?? "📌", color: p?.color ?? "", tasks: [] };
        gMap.set(groupKey, g);
        gList.push(g);
      }
      gMap.get(groupKey)!.tasks.push({ item, idx: i });
    });

    // Ensure all top 5 projects always have a group (even if empty)
    for (const p of top5) {
      if (!gMap.has(p.id)) {
        gList.push({ projectId: p.id, name: p.name, emoji: p.emoji, color: p.color, tasks: [] });
      }
    }

    // Sort: top 5 first (in project order), Other last
    const pIds = top5.map(p => p.id);
    gList.sort((a, b) => {
      if (a.projectId === null) return 1;
      if (b.projectId === null) return -1;
      return pIds.indexOf(a.projectId) - pIds.indexOf(b.projectId);
    });
    return gList;
  }, [items, projects, overrides]);

  function onTaskDragStart(taskKey: string) {
    dragTaskRef.current = taskKey;
    setDragActiveTask(taskKey);
  }
  function onGroupDrop(targetProjectId: string | null) {
    const taskKey = dragTaskRef.current;
    if (taskKey) onReassign(taskKey, targetProjectId);
    setDragOverGroup(null);
    setDragActiveTask(null);
    dragTaskRef.current = null;
  }
  function onTaskDragEnd() {
    setDragOverGroup(null);
    setDragActiveTask(null);
    dragTaskRef.current = null;
  }

  return (
    <div className="rounded-xl border border-amber-900/40 bg-amber-950/10">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today</span>
          {remaining > 0 && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{remaining}</span>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={e => { e.stopPropagation(); setAdding(true); setOpen(true); }}
            className="text-zinc-600 hover:text-zinc-400 text-lg w-8 h-8 flex items-center justify-center">+</button>
          <span className="text-zinc-600 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-3">
          {groups.map(g => {
            const groupKey = g.projectId ?? "__other__";
            const isDropTarget = dragOverGroup === groupKey && dragActiveTask !== null;
            return (
              <div key={groupKey}
                onDragOver={(e) => { e.preventDefault(); setDragOverGroup(groupKey); }}
                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverGroup(null); }}
                onDrop={() => onGroupDrop(g.projectId)}
                className={`mb-2 last:mb-0 rounded-lg px-1 py-0.5 transition-colors ${isDropTarget ? "bg-white/5 ring-1 ring-inset ring-indigo-500/20" : ""}`}>
                <div className="flex items-center gap-2 py-1.5">
                  <span className="text-sm">{g.emoji}</span>
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${TITLE[g.color] ?? "text-zinc-500"}`}>{g.name}</span>
                </div>
                {g.tasks.length === 0 ? (
                  <p className="text-xs text-zinc-700 italic pl-7 pb-1">No tasks today</p>
                ) : (
                  <div className="space-y-1">
                    {g.tasks.map(({ item, idx }) => {
                      const done = isDone(item);
                      const taskKey = display(item);
                      return (
                        <div key={idx}
                          draggable={!done}
                          onDragStart={(e) => { e.stopPropagation(); onTaskDragStart(taskKey); }}
                          onDragEnd={onTaskDragEnd}
                          onClick={() => !done && onComplete("today", idx)}
                          role="button"
                          tabIndex={0}
                          className={`w-full flex items-center gap-3 min-h-[40px] px-2 rounded-lg active:bg-white/5 text-left ${!done ? "cursor-grab" : ""} ${dragActiveTask === taskKey ? "opacity-40" : ""}`}>
                          <span className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center ${done ? "bg-indigo-500/20 border-indigo-400/40 text-indigo-400" : "border-zinc-700"}`}>
                            {done && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M8.5 2.5L4 7.5L1.5 5" stroke="currentColor" strokeWidth="1.5" fill="none"/></svg>}
                          </span>
                          <span className={`text-sm flex-1 ${done ? "line-through text-zinc-600" : "text-zinc-200"}`}>{display(item)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
          {adding && (
            <div className="flex gap-2 mt-2">
              <input value={text} onChange={e => setText(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && text.trim()) { onAdd("today", text); setText(""); setAdding(false); } if (e.key === "Escape") { setAdding(false); setText(""); }}}
                placeholder="Add item… (Enter to save)" autoFocus
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-indigo-500" />
              <button onClick={() => { if (text.trim()) { onAdd("today", text); setText(""); setAdding(false); }}}
                className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm">Add</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ── */
export default function PlannerPage() {
  const [data, setData] = useState<PlannerData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);
  const [projectOrder, setProjectOrder] = useState<string[]>([]);
  const [taskOverrides, setTaskOverrides] = useState<Record<string, string>>({});
  const [focusDate, setFocusDate] = useState(() => new Date());
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragActiveIdx, setDragActiveIdx] = useState<number | null>(null);
  const dragIdx = useRef<number | null>(null);

  const fetchData = useCallback(async () => {
    const [p, r] = await Promise.all([
      fetch("/api/planner").then(r => r.json()),
      fetch("/api/roadmap").then(r => r.json()),
    ]);
    setData(p);
    setProjects(r.projects ?? []);
    try {
      const s = localStorage.getItem("mc-project-order");
      if (s) setProjectOrder(JSON.parse(s));
    } catch { /* no saved order */ }
    try {
      const o = localStorage.getItem("mc-task-project-overrides");
      if (o) setTaskOverrides(JSON.parse(o));
    } catch { /* no saved overrides */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const orderedProjects = useMemo(() => {
    const top5 = projects.slice(0, 5);
    if (projectOrder.length === 0) return top5;
    const byId = new Map(top5.map(p => [p.id, p]));
    const ordered: Project[] = [];
    for (const id of projectOrder) {
      const p = byId.get(id);
      if (p) { ordered.push(p); byId.delete(id); }
    }
    for (const p of byId.values()) ordered.push(p);
    return ordered;
  }, [projects, projectOrder]);

  async function addItem(section: Section, item: string) {
    await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "add", section, item }) });
    fetchData();
  }

  async function completeItem(section: Section, index: number) {
    await fetch("/api/planner", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "complete", section, index }) });
    fetchData();
  }

  function handleReassign(taskKey: string, targetProjectId: string | null) {
    const next = { ...taskOverrides, [taskKey]: targetProjectId ?? "__other__" };
    setTaskOverrides(next);
    localStorage.setItem("mc-task-project-overrides", JSON.stringify(next));
  }

  function handleDragStart(idx: number) {
    dragIdx.current = idx;
    setDragActiveIdx(idx);
  }
  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    setDragOverIdx(idx);
  }
  function handleDrop(dropIdx: number) {
    const from = dragIdx.current;
    if (from === null || from === dropIdx) { setDragOverIdx(null); setDragActiveIdx(null); dragIdx.current = null; return; }
    const ids = orderedProjects.map(p => p.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(dropIdx, 0, moved);
    setProjectOrder(ids);
    localStorage.setItem("mc-project-order", JSON.stringify(ids));
    setDragOverIdx(null);
    setDragActiveIdx(null);
    dragIdx.current = null;
  }
  function handleDragEnd() {
    setDragOverIdx(null);
    setDragActiveIdx(null);
    dragIdx.current = null;
  }

  if (loading || !data) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );

  const todayLeft = data.today.filter(t => !isDone(t)).length;
  const waitCount = data.delegated.filter(d => !d.status.includes("✅")).length;
  const isDateToday = isSameDay(focusDate, new Date());

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-12">
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Planner</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{todayLeft} today · {waitCount} waiting</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">

        {/* Top 5 Projects — draggable */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Top 5 Projects</p>
          <div className="space-y-1">
            {orderedProjects.map((p, i) => {
              const pct = p.milestoneTotal === 0 ? 0 : Math.round((p.milestoneDone / p.milestoneTotal) * 100);
              return (
                <div key={p.id}
                  draggable
                  onDragStart={() => handleDragStart(i)}
                  onDragOver={(e) => handleDragOver(e, i)}
                  onDrop={() => handleDrop(i)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${dragActiveIdx === i ? "opacity-40" : ""} ${dragOverIdx === i && dragActiveIdx !== i ? "bg-zinc-800/60" : ""}`}>
                  <span className="text-zinc-700 hover:text-zinc-500 text-xs select-none flex-shrink-0 transition-colors" title="Drag to reorder">⠿</span>
                  <span className="text-base w-6 flex-shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${TITLE[p.color] ?? "text-zinc-300"}`}>{p.name}</span>
                      <span className="text-xs text-zinc-600">{p.openTasks} open</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${BAR[p.color] ?? "bg-zinc-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-zinc-700">{pct}%</span>
                    </div>
                    {p.currentMilestone && <p className="text-xs text-zinc-600 truncate mt-0.5">{p.currentMilestone.title}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Date navigation strip */}
        <div className="flex items-center justify-center gap-4 py-1">
          <button onClick={() => setFocusDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 1); return d; })}
            className="text-zinc-500 hover:text-zinc-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors">
            <span className="text-sm">◀</span>
          </button>
          <div className="text-center min-w-[140px]">
            <span className={`text-sm font-medium ${isDateToday ? "text-amber-400" : "text-zinc-300"}`}>
              {formatDateLabel(focusDate)}
            </span>
            {isDateToday && <span className="ml-2 text-[10px] text-amber-500/70 uppercase tracking-wider">Today</span>}
          </div>
          <button onClick={() => setFocusDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 1); return d; })}
            className="text-zinc-500 hover:text-zinc-300 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors">
            <span className="text-sm">▶</span>
          </button>
        </div>

        {/* Today — grouped by project */}
        <GroupedTodayBlock items={data.today} projects={projects} overrides={taskOverrides}
          onAdd={addItem} onComplete={completeItem} onReassign={handleReassign} />

        {/* This Week */}
        <SectionBlock label="This Week" items={data.thisWeek} section="thisWeek"
          accent="border-zinc-800 bg-zinc-900/40" onAdd={addItem} onComplete={completeItem} />

        {/* This Month */}
        <SectionBlock label="This Month" items={data.thisMonth} section="thisMonth"
          accent="border-zinc-800 bg-zinc-900/40" onAdd={addItem} onComplete={completeItem} />

        {/* This Quarter */}
        <SectionBlock label="This Quarter" items={data.thisQuarter} section="thisQuarter"
          accent="border-zinc-800 bg-zinc-900/40" onAdd={addItem} onComplete={completeItem} />

        {/* Delegated */}
        {data.delegated.length > 0 && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
            <button onClick={() => setDelOpen(!delOpen)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Delegated / Waiting</span>
                {waitCount > 0 && <span className="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full">{waitCount}</span>}
              </div>
              <span className="text-zinc-600 text-xs">{delOpen ? "▲" : "▼"}</span>
            </button>
            {delOpen && (
              <div className="px-4 pb-4 space-y-2">
                {data.delegated.map((d, i) => (
                  <div key={i} className="flex items-center gap-3 min-h-[40px] text-sm">
                    <span className="flex-1 text-zinc-300">{d.item}</span>
                    <span className="text-xs text-zinc-500">{d.who}</span>
                    <span>{d.status.includes("✅") ? "✅" : d.status.includes("🟠") ? "🟠" : "🟡"}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
