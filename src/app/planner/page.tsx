"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface DelegatedItem { item: string; who: string; status: string; }
interface Project { id: string; name: string; emoji: string; color: string; openTasks: number; milestoneDone: number; milestoneTotal: number; currentMilestone: { title: string } | null; }
interface ProjectInfo { id: string; name: string; status: string; phase: string; color: string; }
interface CalendarEvent { id: string; title: string; owner: string; date: string; startTime: string; endTime: string; allDay: boolean; type: string; project: string | null; notes: string | null; recurring: string | null; }
interface PlannerData { today: string[]; thisWeek: string[]; thisMonth: string[]; thisQuarter: string[]; thisYear: string[]; top5: string[]; delegated: DelegatedItem[]; }
type Section = "today" | "thisWeek" | "thisMonth" | "thisQuarter";

const isDone = (t: string) => t.startsWith("~~") && t.endsWith("~~");
const display = (t: string) => t.replace(/^~~|~~$/g, "").replace(/^\*\*|\*\*$/g, "");
const TITLE: Record<string,string> = { indigo:"text-indigo-300", amber:"text-amber-300", violet:"text-violet-300", emerald:"text-emerald-300", orange:"text-orange-500" };

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

/* ── date helpers ── */
function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}
function getWeekDays(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(d.getDate() + i);
    return d;
  });
}
function fmtTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "p" : "a";
  const hr = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${m.toString().padStart(2, "0")}${ampm}`;
}

function eventAppliesToDate(evt: CalendarEvent, date: Date): boolean {
  const dow = date.getDay();
  if (evt.recurring === "daily") return true;
  if (evt.recurring === "weekdays") return dow >= 1 && dow <= 5;
  const evtDate = new Date(evt.date + "T00:00:00");
  return isSameDay(evtDate, date);
}

/* ── StatusBadge for project status ── */
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    planned: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    paused: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors[status] ?? colors.paused}`}>
      {status}
    </span>
  );
}

/* ── Week Calendar ── */
function WeekCalendar({ events, projectInfos, focusDate, onSelectDate }: {
  events: CalendarEvent[];
  projectInfos: ProjectInfo[];
  focusDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const [weekStart, setWeekStart] = useState(() => getMonday(focusDate));
  const days = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const colorMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of projectInfos) m.set(p.id, p.color);
    return m;
  }, [projectInfos]);

  useEffect(() => {
    setWeekStart(getMonday(focusDate));
  }, [focusDate]);

  const eventsForDay = useCallback((date: Date) => {
    return events
      .filter(e => eventAppliesToDate(e, date))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events]);

  const today = new Date();

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
      {/* Week nav header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800">
        <button onClick={() => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d; })}
          className="text-zinc-500 hover:text-zinc-300 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors">
          <span className="text-xs">◀</span>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            {days[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {days[6].toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
          <button onClick={() => { const t = new Date(); setWeekStart(getMonday(t)); onSelectDate(t); }}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
            Today
          </button>
        </div>
        <button onClick={() => setWeekStart(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d; })}
          className="text-zinc-500 hover:text-zinc-300 w-7 h-7 flex items-center justify-center rounded-lg hover:bg-zinc-800 transition-colors">
          <span className="text-xs">▶</span>
        </button>
      </div>

      {/* Day rows */}
      <div className="divide-y divide-zinc-800/60">
        {days.map(date => {
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, focusDate);
          const dayEvents = eventsForDay(date);
          const dayLabel = date.toLocaleDateString("en-US", { weekday: "short" });
          const dayNum = date.getDate();
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;

          return (
            <button key={date.toISOString()} onClick={() => onSelectDate(date)}
              className={`w-full flex items-start gap-3 px-3 py-2 text-left transition-colors hover:bg-zinc-800/40
                ${isSelected ? "bg-indigo-500/5 border-l-2 border-l-indigo-500" : "border-l-2 border-l-transparent"}
                ${isWeekend ? "opacity-60" : ""}`}>
              {/* Day label */}
              <div className="flex-shrink-0 w-12 pt-0.5 text-center">
                <div className={`text-[10px] uppercase tracking-wider ${isToday ? "text-amber-400" : "text-zinc-600"}`}>{dayLabel}</div>
                <div className={`text-sm font-semibold ${isToday ? "text-amber-400" : isSelected ? "text-indigo-300" : "text-zinc-400"}`}>{dayNum}</div>
              </div>
              {/* Events */}
              <div className="flex-1 min-w-0 flex flex-wrap gap-1 py-0.5">
                {dayEvents.length === 0 ? (
                  <span className="text-xs text-zinc-700 italic">No events</span>
                ) : dayEvents.map(evt => {
                  const projColor = evt.project ? colorMap.get(evt.project) : null;
                  const bgColor = projColor ?? "#52525b";
                  return (
                    <span key={evt.id + date.toISOString()} className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-md max-w-full"
                      style={{ backgroundColor: bgColor + "18", borderLeft: `2px solid ${bgColor}` }}>
                      <span className="text-zinc-500 flex-shrink-0">{fmtTime(evt.startTime)}</span>
                      <span className="text-zinc-300 truncate">{evt.title}</span>
                    </span>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── SectionBlock ── */
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

/* ── Grouped Today Block with drag-between-groups ── */
function GroupedTodayBlock({ label, items, projects, overrides, onAdd, onComplete, onReassign }: {
  label: string;
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

    for (const p of top5) {
      if (!gMap.has(p.id)) {
        gList.push({ projectId: p.id, name: p.name, emoji: p.emoji, color: p.color, tasks: [] });
      }
    }

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
  const [projectInfos, setProjectInfos] = useState<ProjectInfo[]>([]);
  const [calEvents, setCalEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);
  const [taskOverrides, setTaskOverrides] = useState<Record<string, string>>({});
  const [focusDate, setFocusDate] = useState(() => new Date());

  const fetchData = useCallback(async () => {
    const [p, r, proj, cal] = await Promise.all([
      fetch("/api/planner").then(r => r.json()),
      fetch("/api/roadmap").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/calendar").then(r => r.json()),
    ]);
    setData(p);
    setProjects(r.projects ?? []);
    setProjectInfos(proj ?? []);
    setCalEvents(cal ?? []);
    try {
      const o = localStorage.getItem("mc-task-project-overrides");
      if (o) setTaskOverrides(JSON.parse(o));
    } catch { /* no saved overrides */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  if (loading || !data) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );

  const todayLeft = data.today.filter(t => !isDone(t)).length;
  const waitCount = data.delegated.filter(d => !d.status.includes("✅")).length;
  const isDateToday = isSameDay(focusDate, new Date());
  const focusLabel = isDateToday ? "Today" : formatDateLabel(focusDate);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-12">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Planner</h1>
            <p className="text-xs text-zinc-500 mt-0.5">{todayLeft} today · {waitCount} waiting</p>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">

        {/* ═══ Two-column header: Projects + Calendar ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-3">

          {/* LEFT — Top 5 Projects (compact) */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-3 py-3">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2.5">Projects</p>
            <div className="space-y-1.5">
              {projectInfos.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center gap-2 py-1">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs font-medium text-zinc-200 flex-1 truncate">{p.name}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — Week Calendar */}
          <WeekCalendar
            events={calEvents}
            projectInfos={projectInfos}
            focusDate={focusDate}
            onSelectDate={setFocusDate}
          />
        </div>

        {/* ═══ Focused date tasks ═══ */}
        <GroupedTodayBlock label={focusLabel} items={isDateToday ? data.today : data.today} projects={projects} overrides={taskOverrides}
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
