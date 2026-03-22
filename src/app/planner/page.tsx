"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import SaveSessionButton from "@/components/SaveSessionButton";
import PreflightButton from "@/components/PreflightButton";

const CockpitPanel = dynamic(() => import("@/components/CockpitPanel"), { ssr: false });
const PreflightBrief = dynamic(() => import("@/components/PreflightBrief"), { ssr: false });
const PendingFeed = dynamic(() => import("@/components/PendingFeed"), { ssr: false });

interface DelegatedItem { item: string; who: string; status: string; }
interface Project { id: string; name: string; emoji: string; color: string; openTasks: number; milestoneDone: number; milestoneTotal: number; currentMilestone: { title: string } | null; }
interface ProjectInfo { id: string; name: string; status: string; phase: string; color: string; }
interface MktItem { id: string; title: string; project: string; status: string; channel: string; }
interface MktData { weekOf: string; queue: MktItem[]; }
interface CalendarEvent { id: string; title: string; owner: string; date: string; startTime: string; endTime: string; allDay: boolean; type: string; project: string | null; notes: string | null; recurring: string | null; }
interface PlannerData { today: string[]; thisWeek: string[]; thisMonth: string[]; thisQuarter: string[]; thisYear: string[]; top5: string[]; delegated: DelegatedItem[]; }
type Section = "today" | "thisWeek" | "thisMonth" | "thisQuarter";

const MKT_PROJECTS: Record<string, { label: string; emoji: string; color: string }> = {
  "ai-r": { label: "AI-R", emoji: "🍽️", color: "text-orange-400" },
  "plate-ai": { label: "PlateAI", emoji: "🥗", color: "text-green-400" },
  "time-trek": { label: "Time Trek", emoji: "🌍", color: "text-blue-400" },
  "studio": { label: "Studio", emoji: "🎬", color: "text-purple-400" },
  "ember-azure": { label: "Ember & Azure", emoji: "🔥", color: "text-red-400" },
};

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

/* ── Week Calendar with hourly grid ── */
const GRID_START = 8; // 8 AM
const GRID_END = 20;  // 8 PM
const GRID_HOURS = GRID_END - GRID_START; // 12 hours
const ROW_H = 40; // px per hour

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

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
  const selectedDayEvents = useMemo(() => eventsForDay(focusDate), [eventsForDay, focusDate]);

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden flex flex-col">
      {/* Week nav + day tabs */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800">
        <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); onSelectDate(d); }}
          className="text-zinc-500 hover:text-zinc-300 w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors flex-shrink-0">
          <span className="text-xs">◀</span>
        </button>
        <div className="flex items-center gap-1 flex-1 justify-center">
          {days.map(date => {
            const isToday = isSameDay(date, today);
            const isSelected = isSameDay(date, focusDate);
            const dayLabel = date.toLocaleDateString("en-US", { weekday: "narrow" });
            const dayNum = date.getDate();
            return (
              <button key={date.toISOString()} onClick={() => onSelectDate(date)}
                className={`flex flex-col items-center px-2 py-1 rounded-lg transition-colors min-w-[36px]
                  ${isSelected ? "bg-indigo-500/15" : "hover:bg-zinc-800/60"}
                  ${isToday ? "ring-1 ring-amber-500/40" : ""}`}>
                <span className={`text-[9px] uppercase tracking-wider ${isToday ? "text-amber-400" : "text-zinc-600"}`}>{dayLabel}</span>
                <span className={`text-xs font-semibold ${isToday ? "text-amber-400" : isSelected ? "text-indigo-300" : "text-zinc-400"}`}>{dayNum}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => { const t = new Date(); setWeekStart(getMonday(t)); onSelectDate(t); }}
            className="text-[9px] text-indigo-400 hover:text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20 hover:border-indigo-500/40 transition-colors">
            Today
          </button>
          <button onClick={() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); onSelectDate(d); }}
            className="text-zinc-500 hover:text-zinc-300 w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors">
            <span className="text-xs">▶</span>
          </button>
        </div>
      </div>

      {/* Hourly grid for selected day */}
      <div className="relative overflow-y-auto" style={{ height: GRID_HOURS * ROW_H + 1 }}>
        {/* Hour grid lines + labels */}
        {Array.from({ length: GRID_HOURS + 1 }, (_, i) => {
          const hour = GRID_START + i;
          const label = hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`;
          return (
            <div key={hour} className="absolute left-0 right-0 flex items-start" style={{ top: i * ROW_H }}>
              <span className="text-[9px] text-zinc-600 w-8 text-right pr-1.5 -mt-[5px] flex-shrink-0 select-none">{i < GRID_HOURS ? label : ""}</span>
              <div className="flex-1 border-t border-zinc-800/50" />
            </div>
          );
        })}

        {/* Events positioned absolutely */}
        <div className="absolute left-8 right-1 top-0" style={{ height: GRID_HOURS * ROW_H }}>
          {selectedDayEvents.map(evt => {
            const startMin = timeToMinutes(evt.startTime);
            const endMin = timeToMinutes(evt.endTime);
            const gridStartMin = GRID_START * 60;
            const gridEndMin = GRID_END * 60;

            // Clamp to grid range
            const clampedStart = Math.max(startMin, gridStartMin);
            const clampedEnd = Math.min(endMin, gridEndMin);
            if (clampedStart >= gridEndMin || clampedEnd <= gridStartMin) return null;

            const topPx = ((clampedStart - gridStartMin) / 60) * ROW_H;
            const heightPx = Math.max(((clampedEnd - clampedStart) / 60) * ROW_H, 4);
            const projColor = evt.project ? colorMap.get(evt.project) : null;
            const color = projColor ?? "#52525b";
            const showText = heightPx >= 18;

            return (
              <div key={evt.id} className="absolute left-0 right-0 rounded-sm overflow-hidden cursor-default group"
                style={{ top: topPx, height: heightPx, backgroundColor: color + "20", borderLeft: `3px solid ${color}` }}
                title={`${fmtTime(evt.startTime)}–${fmtTime(evt.endTime)} ${evt.title}`}>
                {showText && (
                  <div className="px-1.5 py-0.5 flex items-center gap-1.5 h-full">
                    <span className="text-[10px] text-zinc-400 flex-shrink-0">{fmtTime(evt.startTime)}</span>
                    <span className="text-[10px] text-zinc-200 truncate">{evt.title}</span>
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
function GroupedTodayBlock({ label, items, projects, overrides, timedEvents = [], onAdd, onComplete, onReassign }: {
  label: string;
  items: string[];
  projects: Project[];
  overrides: Record<string, string>;
  timedEvents?: CalendarEvent[];
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
          {/* TODAY'S SCHEDULE — timed calendar events */}
          {timedEvents.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Today&apos;s Schedule</span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>
              <div className="space-y-1 mb-3">
                {timedEvents
                  .slice()
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map(evt => {
                    const proj = evt.project ? projects.find(p => p.id === evt.project) : null;
                    return (
                      <div key={evt.id} className="flex items-center gap-2 min-h-[36px] px-2 rounded-lg">
                        <span className="text-[11px] font-mono text-zinc-500 shrink-0 w-16">
                          {fmtTime(evt.startTime)} <span className="text-zinc-700">→</span> {fmtTime(evt.endTime)}
                        </span>
                        <span className="text-sm text-zinc-300 flex-1 truncate">{evt.title}</span>
                        {proj && (
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: proj.color }} />
                        )}
                      </div>
                    );
                  })}
              </div>
            </>
          )}
          {/* TASKS divider */}
          {timedEvents.length > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Tasks</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>
          )}
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
  const [mktData, setMktData] = useState<MktData | null>(null);

  const fetchData = useCallback(async () => {
    const [p, r, proj, cal, mkt] = await Promise.all([
      fetch("/api/planner").then(r => r.json()),
      fetch("/api/roadmap").then(r => r.json()),
      fetch("/api/projects").then(r => r.json()),
      fetch("/api/calendar").then(r => r.json()),
      fetch("/api/marketing").then(r => r.json()).catch(() => null),
    ]);
    setData(p);
    setProjects(r.projects ?? []);
    setProjectInfos(proj ?? []);
    setCalEvents(Array.isArray(cal) ? cal : []);
    if (mkt) setMktData(mkt);
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

  const neilEvents = useMemo(() => calEvents.filter(e => !e.owner || e.owner === "neil"), [calEvents]);
  const timedToday = useMemo(() => neilEvents.filter(e => eventAppliesToDate(e, focusDate) && !e.allDay && e.startTime), [neilEvents, focusDate]);

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
          <div className="flex items-center gap-2">
            <PreflightButton />
            <SaveSessionButton />
          </div>
        </div>
      </div>

      <div className="px-4 space-y-3">

        {/* Cockpit Instrument Panel */}
        <CockpitPanel plannerToday={data.today} plannerWeek={data.thisWeek} />
        <PreflightBrief />

        {/* ═══ Marketing Rhythm ═══ */}
        {mktData && mktData.queue.length > 0 && (() => {
          const q = mktData.queue;
          const drafts = q.filter(i => i.status === "draft").length;
          const notStarted = q.filter(i => i.status === "not-started").length;
          const posted = q.filter(i => i.status === "posted").length;
          const allPosted = drafts === 0 && notStarted === 0;
          const actionable = q.filter(i => i.status === "draft" || i.status === "not-started").slice(0, 3);
          return (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">📣 Marketing This Week</span>
                <Link href="/marketing" className="text-[10px] text-indigo-400 hover:text-indigo-300">→ all</Link>
              </div>
              <p className="text-xs text-zinc-500 mb-2">
                {drafts} drafts · {notStarted} not started · {posted} posted
              </p>
              {allPosted ? (
                <p className="text-xs text-emerald-400">✅ All done this week</p>
              ) : (
                <div className="space-y-1.5">
                  {actionable.map(item => {
                    const proj = MKT_PROJECTS[item.project];
                    return (
                      <div key={item.id} className="flex items-center gap-2 text-xs">
                        {proj && <span className={proj.color}>{proj.emoji}</span>}
                        <span className="text-zinc-300 truncate">{item.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══ Pending Feed ═══ */}
        <PendingFeed onPromote={fetchData} />

        {/* ═══ Two-column header: Projects + Calendar ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

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
            events={neilEvents}
            projectInfos={projectInfos}
            focusDate={focusDate}
            onSelectDate={setFocusDate}
          />
        </div>

        {/* ═══ Focused date tasks ═══ */}
        <GroupedTodayBlock label={focusLabel} items={isDateToday ? data.today : data.today} projects={projects} overrides={taskOverrides}
          timedEvents={timedToday} onAdd={addItem} onComplete={completeItem} onReassign={handleReassign} />

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
