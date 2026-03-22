"use client";

import { useCallback, useEffect, useState } from "react";

/* ── InfoTip — CSS-only hover popover ── */
function InfoTip({ text, alignRight }: { text: string; alignRight?: boolean }) {
  return (
    <span className="group/info relative inline-flex ml-1 cursor-default select-none">
      <span className="text-[10px] text-zinc-600 hover:text-zinc-400">{"\u24D8"}</span>
      <span className={`hidden group-hover/info:block absolute top-1/2 -translate-y-1/2 z-20
        bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed shadow-xl w-64
        ${alignRight ? "right-0" : "left-full ml-1.5"}`}>
        {text}
      </span>
    </span>
  );
}

/* ── Types ── */
type GaugeColor = "green" | "amber" | "red";

interface GaugeData {
  id: string;
  emoji: string;
  label: string;
  value: string;
  pct: number;          // 0-100, drives arc fill
  color: GaugeColor;
  tooltip: string;
  description: string;
}

const GAUGE_DESCRIPTIONS: Record<string, string> = {
  context: "How much of Dave\u2019s active memory window is left this session. Green = plenty of runway. Red = time to save and start fresh.",
  save: "Minutes since the last Save Session checkpoint. Saving commits Dave\u2019s working state to memory files. Green = recent. Red = context at risk if session ends.",
  memory: "How fresh Dave\u2019s memory files are. Measures the oldest file Dave relies on. Green = loaded today. Red = stale \u2014 Dave may be working from outdated context.",
  flight: "How long this browser session has been open. Longer sessions = more drift risk. Green = fresh. Red = consider a landing and new preflight.",
  loops: "Unresolved items in handoff.md \u2014 things Dave flagged but hasn\u2019t closed yet. Green = clear. Red = decisions or blockers piling up that need your attention.",
  planner: "Your task load right now. Shows active items in Today (number) or This Week (number + w). Red = planner is empty \u2014 nothing queued for Dave to work from.",
};

interface CockpitPanelProps {
  plannerToday: string[];
  plannerWeek: string[];
}

/* ── SVG Arc Gauge ── */
const RADIUS = 34;
const STROKE = 5;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_FRACTION = 0.75; // 270° arc
const ARC_LENGTH = CIRCUMFERENCE * ARC_FRACTION;

const COLOR_MAP: Record<GaugeColor, { ring: string; text: string; bg: string }> = {
  green:  { ring: "stroke-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/5" },
  amber:  { ring: "stroke-amber-500",   text: "text-amber-400",   bg: "bg-amber-500/5" },
  red:    { ring: "stroke-red-500",      text: "text-red-400",     bg: "bg-red-500/5" },
};

function ArcGauge({ data, isLast, isActive, onClick }: { data: GaugeData; isLast?: boolean; isActive?: boolean; onClick?: () => void }) {
  const { ring, bg } = COLOR_MAP[data.color];
  const filled = (data.pct / 100) * ARC_LENGTH;
  const gap = ARC_LENGTH - filled;
  const isRed = data.color === "red";

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer
        ${isActive ? "border-zinc-700 ring-1 ring-inset ring-zinc-700 bg-zinc-800/60" : `border-zinc-800 ${bg}`}`}>
      <div className="px-2 py-3 flex flex-col items-center">
        <svg width="80" height="68" viewBox="0 0 80 68" className={isRed ? "animate-cockpit-pulse" : ""}>
          <circle cx="40" cy="40" r={RADIUS} fill="none" stroke="currentColor" className="text-zinc-800"
            strokeWidth={STROKE} strokeDasharray={`${ARC_LENGTH} ${CIRCUMFERENCE - ARC_LENGTH}`}
            strokeDashoffset={-CIRCUMFERENCE * 0.125} strokeLinecap="round" transform="rotate(0 40 40)" />
          <circle cx="40" cy="40" r={RADIUS} fill="none" className={ring} strokeWidth={STROKE}
            strokeDasharray={`${filled} ${gap + (CIRCUMFERENCE - ARC_LENGTH)}`}
            strokeDashoffset={-CIRCUMFERENCE * 0.125} strokeLinecap="round"
            style={{ transition: "stroke-dasharray 0.6s ease" }} />
          <text x="40" y="42" textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="bold"
            fill={data.color === "green" ? "#34d399" : data.color === "amber" ? "#fbbf24" : "#f87171"}>
            {data.value}
          </text>
        </svg>
        {data.id === "loops" ? (
          <a href="/memory" className="text-[10px] text-zinc-500 hover:text-red-400 mt-0.5 transition-colors">
            {data.emoji} Close Loops →
          </a>
        ) : (
          <span className="text-[10px] text-zinc-500 mt-0.5">{data.emoji} {data.label}</span>
        )}
      </div>
      {isActive && data.description && (
        <div className="border-t border-zinc-700/50 mt-0 pt-2 pb-2.5 px-2.5 text-[11px] text-zinc-400 leading-relaxed">
          {data.description}
        </div>
      )}
    </div>
  );
}

/* ── Pulse animation (injected via style tag) ── */
function PulseStyle() {
  return (
    <style suppressHydrationWarning>{`
      @keyframes cockpit-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.6; }
      }
      .animate-cockpit-pulse {
        animation: cockpit-pulse 2s ease-in-out infinite;
      }
    `}</style>
  );
}

/* ── Main Panel ── */
export default function CockpitPanel({ plannerToday, plannerWeek }: CockpitPanelProps) {
  const [gauges, setGauges] = useState<GaugeData[]>([]);
  const [activeGauge, setActiveGauge] = useState<string | null>(null);

  const isDone = (t: string) => t.startsWith("~~") && t.endsWith("~~");

  const refresh = useCallback(async () => {
    // Fetch all 3 API endpoints in parallel
    const [ctxRes, memRes, loopsRes] = await Promise.all([
      fetch("/api/session/context").then(r => r.json()).catch(() => ({ pctRemaining: 0, minutesElapsed: 0, status: "red" })),
      fetch("/api/session/memory-freshness").then(r => r.json()).catch(() => ({ oldestAgeHours: null, status: "red" })),
      fetch("/api/session/open-loops").then(r => r.json()).catch(() => ({ openCount: 0, items: [], status: "green" })),
    ]);

    // 1. Context
    const ctxPct = ctxRes.pctRemaining ?? 0;
    const ctxGauge: GaugeData = {
      id: "context", emoji: "\u{1F9E0}", label: "Context",
      value: `${ctxPct}%`, pct: ctxPct, color: ctxRes.status,
      tooltip: `~${ctxRes.minutesElapsed ?? 0}m elapsed — ${ctxPct}% context remaining`,
      description: GAUGE_DESCRIPTIONS.context,
    };

    // 2. Last Save (client-only — localStorage)
    let saveMins = -1;
    try {
      const ts = localStorage.getItem("mc-last-save");
      if (ts) saveMins = Math.round((Date.now() - Number(ts)) / 60000);
    } catch { /* noop */ }
    const saveColor: GaugeColor = saveMins < 0 || saveMins > 180 ? "red" : saveMins > 60 ? "amber" : "green";
    const savePct = saveMins < 0 ? 0 : Math.max(0, 100 - Math.round((saveMins / 180) * 100));
    const saveGauge: GaugeData = {
      id: "save", emoji: "\u{1F4BE}", label: "Last Save",
      value: saveMins < 0 ? "—" : saveMins < 60 ? `${saveMins}m` : `${Math.round(saveMins / 60)}h`,
      pct: savePct, color: saveColor,
      tooltip: saveMins < 0 ? "Never saved this session" : `Last save ${saveMins}m ago`,
      description: GAUGE_DESCRIPTIONS.save,
    };

    // 3. Memory freshness
    const memHours = memRes.oldestAgeHours;
    const memPct = memHours === null ? 0 : Math.max(0, 100 - Math.round((memHours / 72) * 100));
    const memGauge: GaugeData = {
      id: "memory", emoji: "\u{1F4C2}", label: "Memory",
      value: memHours === null ? "—" : memHours < 24 ? `${memHours}h` : `${Math.round(memHours / 24)}d`,
      pct: memPct, color: memRes.status,
      tooltip: memHours === null ? "No memory files found" : `Oldest file: ${memRes.oldestFile ?? "?"} (${memHours}h ago)`,
      description: GAUGE_DESCRIPTIONS.memory,
    };

    // 4. Flight Time (client-only — localStorage)
    let flightMins = 0;
    try {
      let start = localStorage.getItem("mc-session-start");
      if (!start) {
        start = String(Date.now());
        localStorage.setItem("mc-session-start", start);
      }
      flightMins = Math.round((Date.now() - Number(start)) / 60000);
    } catch { /* noop */ }
    const flightColor: GaugeColor = flightMins > 120 ? "red" : flightMins > 60 ? "amber" : "green";
    const flightPct = Math.max(0, 100 - Math.round((flightMins / 180) * 100));
    const flightGauge: GaugeData = {
      id: "flight", emoji: "\u{1F501}", label: "Flight Time",
      value: flightMins < 60 ? `${flightMins}m` : `${Math.floor(flightMins / 60)}h${flightMins % 60}m`,
      pct: flightPct, color: flightColor,
      tooltip: `Browser session: ${flightMins}m`,
      description: GAUGE_DESCRIPTIONS.flight,
    };

    // 5. Open Loops
    const loopCount = loopsRes.openCount ?? 0;
    const loopItems: string[] = loopsRes.items ?? [];
    const loopPct = loopCount === 0 ? 100 : Math.max(0, 100 - loopCount * 20);
    const loopTooltipLines = loopItems.slice(0, 3).map(s => `• ${s}`);
    if (loopCount > 3) loopTooltipLines.push(`…and ${loopCount - 3} more`);
    const loopTooltip = loopCount === 0
      ? "No open loops"
      : loopTooltipLines.join("\n");
    const loopGauge: GaugeData = {
      id: "loops", emoji: loopsRes.status === "green" ? "\u2705" : loopsRes.status === "amber" ? "\u26A0\uFE0F" : "\uD83D\uDED1", label: "Open Loops",
      value: String(loopCount), pct: loopPct, color: loopsRes.status,
      tooltip: loopTooltip,
      description: GAUGE_DESCRIPTIONS.loops,
    };

    // 6. Planner
    const todayActive = plannerToday.filter(t => !isDone(t)).length;
    const weekActive = plannerWeek.filter(t => !isDone(t)).length;
    const plannerColor: GaugeColor = todayActive > 0 ? "green" : weekActive > 0 ? "amber" : "red";
    const plannerPct = todayActive > 0 ? 100 : weekActive > 0 ? 50 : 0;
    const plannerGauge: GaugeData = {
      id: "planner", emoji: "\u{1F4CB}", label: "Planner",
      value: todayActive > 0 ? `${todayActive}` : weekActive > 0 ? `${weekActive}w` : "0",
      pct: plannerPct, color: plannerColor,
      tooltip: todayActive > 0
        ? `${todayActive} item${todayActive !== 1 ? "s" : ""} today`
        : weekActive > 0
          ? `No today items — ${weekActive} this week`
          : "Planner is empty",
      description: GAUGE_DESCRIPTIONS.planner,
    };

    setGauges([ctxGauge, saveGauge, memGauge, flightGauge, loopGauge, plannerGauge]);
  }, [plannerToday, plannerWeek]);

  // Initial load + 60s interval + listen for mc-refresh event (fired by PreflightButton/SaveSessionButton)
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60000);
    const onRefresh = () => refresh();
    window.addEventListener("mc-refresh", onRefresh);
    return () => { clearInterval(id); window.removeEventListener("mc-refresh", onRefresh); };
  }, [refresh]);

  if (gauges.length === 0) return null;

  return (
    <>
      <PulseStyle />
      <div className="flex items-center mb-1.5">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Cockpit</span>
        <InfoTip text="Cockpit Gauges \u2014 real-time plane health. You are both the pilot and the destination. Dave is the copilot and the engine. These 6 gauges tell you how well the engine is running so you can decide when to refuel, recalibrate, or land." />
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        {gauges.map((g, i) => (
          <ArcGauge key={g.id} data={g} isLast={i === gauges.length - 1}
            isActive={activeGauge === g.id}
            onClick={() => setActiveGauge(prev => prev === g.id ? null : g.id)} />
        ))}
      </div>
    </>
  );
}
