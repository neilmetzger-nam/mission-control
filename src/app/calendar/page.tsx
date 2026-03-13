"use client";
import { useCallback, useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  owner: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  type: string;
  project: string | null;
  notes: string | null;
  recurring: string | null;
}

const PROJECT_COLORS: Record<string, string> = {
  "ai-r": "bg-green-500/20 border-green-500/40 text-green-300",
  plateai: "bg-orange-500/20 border-orange-500/40 text-orange-300",
  "time-trek": "bg-blue-500/20 border-blue-500/40 text-blue-300",
  "orion-mcp": "bg-violet-500/20 border-violet-500/40 text-violet-300",
};
const DEFAULT_COLOR = "bg-zinc-700/30 border-zinc-600/40 text-zinc-300";

const OWNER_TINT: Record<string, string> = {
  neil: "border-l-blue-500",
  dave: "border-l-purple-500",
};

function getMonday(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fmtDay(d: Date): string {
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function isWeekday(d: Date): boolean {
  const day = d.getDay();
  return day >= 1 && day <= 5;
}

/** Check if an event falls on a given date, accounting for recurring rules */
function eventOnDate(ev: CalendarEvent, date: string, dateObj: Date): boolean {
  if (!ev.recurring) return ev.date === date;
  if (ev.recurring === "daily") return true;
  if (ev.recurring === "weekdays") return isWeekday(dateObj);
  return ev.date === date;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function formatTime(t: string): string {
  const [hStr, m] = t.split(":");
  const h = parseInt(hStr);
  const ampm = h >= 12 ? "p" : "a";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return m === "00" ? `${h12}${ampm}` : `${h12}:${m}${ampm}`;
}

function EventCard({ ev }: { ev: CalendarEvent }) {
  const isCron = ev.type === "cron";
  const projColor = ev.project ? (PROJECT_COLORS[ev.project] ?? DEFAULT_COLOR) : DEFAULT_COLOR;
  const ownerBorder = OWNER_TINT[ev.owner] ?? "border-l-zinc-500";

  return (
    <div
      className={`rounded-md border border-l-2 ${ownerBorder} ${projColor} ${isCron ? "px-1.5 py-0.5" : "px-2 py-1"} mb-1 truncate`}
      title={`${ev.title} (${ev.owner}) ${ev.startTime}–${ev.endTime}${ev.project ? ` · ${ev.project}` : ""}`}
    >
      <div className={`${isCron ? "text-[10px]" : "text-xs font-medium"} truncate`}>
        {ev.title}
      </div>
      <div className={`${isCron ? "text-[9px]" : "text-[10px]"} opacity-60`}>
        {formatTime(ev.startTime)}–{formatTime(ev.endTime)}
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    const res = await fetch("/api/calendar");
    const data = await res.json();
    setEvents(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const today = fmtDate(new Date());

  function eventsForDay(date: string, dateObj: Date, owner?: string) {
    return events
      .filter((ev) => {
        if (owner && ev.owner !== owner) return false;
        return eventOnDate(ev, date, dateObj);
      })
      .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 pb-12">
      {/* Header */}
      <div className="px-4 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Calendar</h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            {fmtDay(weekStart)} — {fmtDay(addDays(weekStart, 6))}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => setWeekStart(getMonday(new Date()))}
            className="px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="px-3 py-1.5 text-xs rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 pb-3 flex flex-wrap gap-3 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> Neil
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-purple-500" /> Dave
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-green-500/40" /> AI-R
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-orange-500/40" /> PlateAI
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-blue-500/40" /> Time Trek
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm bg-violet-500/40" /> Orion
        </span>
      </div>

      {/* Week grid */}
      <div className="px-4">
        <div className="grid grid-cols-7 gap-2">
          {days.map((d) => {
            const dateStr = fmtDate(d);
            const isToday = dateStr === today;
            const neilEvents = eventsForDay(dateStr, d, "neil");
            const daveEvents = eventsForDay(dateStr, d, "dave");

            return (
              <div
                key={dateStr}
                className={`rounded-xl border ${isToday ? "border-blue-500/40 bg-blue-500/5" : "border-zinc-800 bg-zinc-900/40"} min-h-[320px] flex flex-col`}
              >
                {/* Day header */}
                <div className={`px-2 py-1.5 text-center border-b ${isToday ? "border-blue-500/20" : "border-zinc-800"}`}>
                  <div className={`text-[10px] font-medium uppercase tracking-wider ${isToday ? "text-blue-400" : "text-zinc-500"}`}>
                    {d.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className={`text-sm font-bold ${isToday ? "text-white" : "text-zinc-300"}`}>
                    {d.getDate()}
                  </div>
                </div>

                {/* Neil section */}
                <div className="flex-1 px-1.5 pt-1.5 border-b border-zinc-800/50">
                  <div className="text-[9px] font-semibold text-blue-500/60 uppercase tracking-wider mb-1 px-0.5">
                    Neil
                  </div>
                  {neilEvents.length === 0 ? (
                    <div className="text-[10px] text-zinc-700 px-0.5">—</div>
                  ) : (
                    neilEvents.map((ev) => <EventCard key={ev.id} ev={ev} />)
                  )}
                </div>

                {/* Dave section */}
                <div className="flex-1 px-1.5 pt-1.5 pb-1.5">
                  <div className="text-[9px] font-semibold text-purple-500/60 uppercase tracking-wider mb-1 px-0.5">
                    Dave
                  </div>
                  {daveEvents.length === 0 ? (
                    <div className="text-[10px] text-zinc-700 px-0.5">—</div>
                  ) : (
                    daveEvents.map((ev) => <EventCard key={ev.id} ev={ev} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
