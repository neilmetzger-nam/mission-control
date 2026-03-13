"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Project {
  id: string; name: string; emoji: string;
  currentMilestone: { title: string; status: string } | null;
  milestoneDone: number; milestoneTotal: number; openTasks: number; color: string;
}

const BAR: Record<string,string> = { indigo:"bg-indigo-500", amber:"bg-amber-500", violet:"bg-violet-500", emerald:"bg-emerald-500", orange:"bg-orange-500" };
const TITLE: Record<string,string> = { indigo:"text-indigo-300", amber:"text-amber-300", violet:"text-violet-300", emerald:"text-emerald-300", orange:"text-orange-300" };
const BORDER: Record<string,string> = { indigo:"border-indigo-500/20", amber:"border-amber-500/20", violet:"border-violet-500/20", emerald:"border-emerald-500/20", orange:"border-orange-500/20" };

const MISSIONS: Record<string, string> = {
  "orion-mcp":   "Develop differentiated, easy-to-use MCP architecture that enables on-demand agents to quickly contextualize client data and embed deep in client workflows.",
  "ai-r":        "The restaurant brain. One connected intelligence layer that ties together menu, inventory, orders, kitchen, staff, and analytics — making every other tool work better.",
  "time-trek":   "A 2D adventure game that teaches a language by interacting with the past and helping Sentinels from the future turn the tide in their battle for history.",
  "plateai":     "Image and video on-demand generation to support content creation — from restaurant menus to Facebook posts to full websites. Start with the picture, the rest will follow.",
  "ember-azure": "Pan-Asian wood-fire dining at Village at Leesburg. Theatrical cooking, raw bar, full atmosphere. Opening June 2026.",
  "backstreet":  "Restaurant website scaffold for Backstreet Brews — Carol pilot, AI-generated food/atmosphere imagery, Vercel-hosted. Bridge to Loudoun County restaurant network.",
};

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
function dateStr() {
  return new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [research, setResearch] = useState<string>("");
  const [researchOpen, setResearchOpen] = useState(false);
  const [digest, setDigest] = useState<string>("");
  const [digestOpen, setDigestOpen] = useState(false);

  useEffect(() => {
    fetch("/api/roadmap").then(r => r.json()).then(d => setProjects(d.projects ?? []));
    fetch("/api/workspace?section=nightly-research").then(r => r.json()).then(d => setResearch(d.content ?? ""));
    fetch("/api/workspace?section=daily").then(r => r.json()).then(d => { const today = new Date().toISOString().split("T")[0]; const todayEntry = (d.days ?? []).find((x: {date:string,content:string}) => x.date === today); setDigest(todayEntry?.content ?? ""); });
    fetch("/api/planner").then(r => r.json()).then(d => {
      setTodayCount((d.today ?? []).filter((t: string) => !t.startsWith("~~")).length);
    });
  }, []);

  const totalOpen = projects.reduce((a, p) => a + p.openTasks, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-12">
      {/* Header */}
      <div className="px-5 pt-8 pb-5">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-1">Orion HQ</p>
        <h1 className="text-2xl font-bold text-white">{greeting()}, Neil.</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{dateStr()}</p>
      </div>

      {/* Orion mission */}
      <div className="mx-4 mb-5 rounded-xl border border-indigo-500/20 bg-indigo-500/5 px-4 py-3">
        <p className="text-xs text-indigo-400 uppercase tracking-wider font-semibold mb-1">Orion Mission</p>
        <p className="text-sm text-zinc-300 leading-relaxed">{MISSIONS["orion-mcp"]}</p>
      </div>

      {/* Three primary nav cards */}
      <div className="px-4 grid grid-cols-3 gap-3 mb-6">
        <Link href="/roadmap" className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4 flex flex-col items-center gap-2 active:bg-indigo-500/10">
          <span className="text-2xl">🗺️</span>
          <span className="text-xs font-semibold text-indigo-300">Roadmap</span>
          <span className="text-xs text-zinc-500">{totalOpen} open</span>
        </Link>
        <Link href="/planner" className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-col items-center gap-2 active:bg-amber-500/10">
          <span className="text-2xl">📋</span>
          <span className="text-xs font-semibold text-amber-300">Planner</span>
          <span className="text-xs text-zinc-500">{todayCount} today</span>
        </Link>
        <Link href="/memory" className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4 flex flex-col items-center gap-2 active:bg-zinc-800">
          <span className="text-2xl">🧠</span>
          <span className="text-xs font-semibold text-zinc-300">Memory</span>
          <span className="text-xs text-zinc-500">Dave's world</span>
        </Link>
      </div>

      {/* Projects with mission statements */}
      <div className="px-4">
        <p className="text-xs text-zinc-600 uppercase tracking-widest mb-3">Products</p>
        <div className="space-y-2">
          {projects.map(p => {
            const pct = p.milestoneTotal === 0 ? 0 : Math.round((p.milestoneDone / p.milestoneTotal) * 100);
            const isOpen = expanded === p.id;
            const mission = MISSIONS[p.id];
            return (
              <div key={p.id} className={`rounded-xl border ${BORDER[p.color] ?? "border-zinc-800"} bg-zinc-900/40`}>
                <button onClick={() => setExpanded(isOpen ? null : p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <span className="text-lg w-7 flex-shrink-0">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm font-medium ${TITLE[p.color] ?? "text-zinc-300"}`}>{p.name}</span>
                      {p.openTasks > 0 && <span className="text-xs text-zinc-600">{p.openTasks} open</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${BAR[p.color] ?? "bg-zinc-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-zinc-700">{p.milestoneDone}/{p.milestoneTotal}</span>
                    </div>
                  </div>
                  <span className="text-zinc-600 text-xs">{isOpen ? "▲" : "▼"}</span>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-zinc-800/60 pt-3 space-y-3">
                    {mission && <p className="text-xs text-zinc-400 leading-relaxed">{mission}</p>}
                    <div className="flex gap-2">
                      <Link href={`/projects/${p.id}`} className="text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-lg">Sprints →</Link>
                      <Link href={`/roadmap`} className="text-xs text-zinc-500 border border-zinc-800 px-3 py-1.5 rounded-lg">Roadmap →</Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Session Digest */}
      <div className="px-4 mt-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <button onClick={() => setDigestOpen(!digestOpen)}
            className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Today's Session Digest</span>
            </div>
            <span className="text-zinc-600 text-xs">{digestOpen ? "▲" : "▼"}</span>
          </button>
          {digestOpen && (
            <div className="px-4 pb-4 border-t border-zinc-800/60 pt-3">
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono">{digest || "No digest yet — runs at 11 PM nightly."}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Nightly Research */}
      <div className="px-4 mt-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
          <button onClick={() => setResearchOpen(!researchOpen)}
            className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]">
            <div className="flex items-center gap-2">
              <span className="text-base">🔬</span>
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Nightly Research</span>
            </div>
            <span className="text-zinc-600 text-xs">{researchOpen ? "▲" : "▼"}</span>
          </button>
          {researchOpen && (
            <div className="px-4 pb-4 border-t border-zinc-800/60 pt-3">
              <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono">{research}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
