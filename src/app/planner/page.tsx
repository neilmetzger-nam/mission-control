"use client";
import { useCallback, useEffect, useState } from "react";

interface DelegatedItem { item: string; who: string; status: string; }
interface Project { id: string; name: string; emoji: string; color: string; openTasks: number; milestoneDone: number; milestoneTotal: number; currentMilestone: { title: string } | null; }
interface PlannerData { today: string[]; thisWeek: string[]; thisMonth: string[]; thisQuarter: string[]; thisYear: string[]; top5: string[]; delegated: DelegatedItem[]; }
type Section = "today" | "thisWeek" | "thisMonth" | "thisQuarter";

const isDone = (t: string) => t.startsWith("~~") && t.endsWith("~~");
const display = (t: string) => t.replace(/^~~|~~$/g, "").replace(/^\*\*|\*\*$/g, "");
const TITLE: Record<string,string> = { indigo:"text-indigo-300", amber:"text-amber-300", violet:"text-violet-300", emerald:"text-emerald-300", orange:"text-orange-500" };
const BAR: Record<string,string> = { indigo:"bg-indigo-500", amber:"bg-amber-500", violet:"bg-violet-500", emerald:"bg-emerald-500", orange:"bg-orange-500" };

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

export default function PlannerPage() {
  const [data, setData] = useState<PlannerData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [delOpen, setDelOpen] = useState(false);

  const fetchData = useCallback(async () => {
    const [p, r] = await Promise.all([
      fetch("/api/planner").then(r => r.json()),
      fetch("/api/roadmap").then(r => r.json()),
    ]);
    setData(p);
    setProjects(r.projects ?? []);
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

  if (loading || !data) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );

  const todayLeft = data.today.filter(t => !isDone(t)).length;
  const waitCount = data.delegated.filter(d => !d.status.includes("✅")).length;

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

        {/* Top 5 Projects — compact */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3">Top 5 Projects</p>
          <div className="space-y-3">
            {projects.slice(0, 5).map(p => {
              const pct = p.milestoneTotal === 0 ? 0 : Math.round((p.milestoneDone / p.milestoneTotal) * 100);
              return (
                <div key={p.id} className="flex items-center gap-3">
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

        {/* Today */}
        <SectionBlock label="Today" items={data.today} section="today"
          accent="border-amber-900/40 bg-amber-950/10" onAdd={addItem} onComplete={completeItem} />

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
