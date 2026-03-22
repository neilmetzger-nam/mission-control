"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, ChevronRight } from "lucide-react";
import SaveSessionButton from "@/components/SaveSessionButton";
import PreflightButton from "@/components/PreflightButton";

const GLOBAL_NAV = [
  { href: "/", label: "Dashboard", emoji: "🏠" },
  { href: "/idea", label: "New Idea", emoji: "💡", highlight: true },
  { href: "/review", label: "Review Queue", emoji: "🔄", badge: true },
  { href: "/calendar", label: "Calendar", emoji: "📅" },
  { href: "/agents", label: "Agent Activity", emoji: "🤖" },
  { href: "/infrastructure", label: "Infrastructure", emoji: "📊" },
  { href: "/security", label: "Security", emoji: "🔒" },
  { href: "/memory", label: "Memory", emoji: "🧠" },
  { href: "/loops", label: "Open Loops", emoji: "🔁" },
  { href: "/config", label: "Config", emoji: "⚙️" },
  { href: "/briefing", label: "Briefing", emoji: "📋", highlight: true },
  { href: "/marketing", label: "Marketing", emoji: "📣" },
];

const PROJECTS = [
  { id: "ai-r", label: "AI-R", emoji: "🍽️", color: "text-orange-400" },
  { id: "plate-ai", label: "PlateAI", emoji: "🥗", color: "text-green-400" },
  { id: "studio", label: "Studio", emoji: "🎬", color: "text-purple-400" },
  { id: "time-trek", label: "Time Trek", emoji: "🌍", color: "text-blue-400" },
  { id: "ember-azure", label: "Ember & Azure", emoji: "🔥", color: "text-red-400" },
  { id: "orion-mcp", label: "Orion MCP", emoji: "⚡", color: "text-cyan-400" },
];

const PROJECT_SUB = [
  { suffix: "/roadmap", label: "Roadmap", emoji: "🗺️" },
  { suffix: "/timeline", label: "Timeline", emoji: "📅" },
  { suffix: "/ideas", label: "Ideas", emoji: "💡" },
  { suffix: "/research", label: "Research", emoji: "🔬" },
  { suffix: "", label: "Plan", emoji: "📋" },
  { suffix: "/review", label: "Review Queue", emoji: "🔄" },
  { suffix: "/agents", label: "Agent Activity", emoji: "🤖" },
  { suffix: "/docs", label: "Docs", emoji: "📄" },
  { suffix: "/marketing", label: "Marketing", emoji: "📣" },
  { suffix: "/infrastructure", label: "Infrastructure", emoji: "🖥️" },
  { suffix: "/security", label: "Security", emoji: "🔒" },
  { suffix: "/config", label: "Config", emoji: "⚙️" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Auto-expand the project that matches current path
  const activeProject = PROJECTS.find(p => pathname.startsWith(`/projects/${p.id}`));
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(activeProject ? [activeProject.id] : [])
  );

  useEffect(() => {
    fetch("/api/review").then(r => r.json()).then(items => {
      if (Array.isArray(items)) setPendingCount(items.filter((i: {status:string}) => i.status === "pending").length);
    }).catch(() => {});
  }, []);

  // Auto-expand active project when navigating
  useEffect(() => {
    const p = PROJECTS.find(p => pathname.startsWith(`/projects/${p.id}`));
    if (p) setExpandedProjects(prev => new Set([...prev, p.id]));
  }, [pathname]);

  const toggleProject = (id: string) => {
    setExpandedProjects(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const NavLink = ({ href, emoji, label, highlight, showBadge, indent = false, color = "" }: {
    href: string; emoji: string; label: string;
    highlight?: boolean; showBadge?: boolean; indent?: boolean; color?: string;
  }) => {
    const active = isActive(pathname, href);
    return (
      <Link href={href} onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${indent ? "ml-4 pl-2" : ""}
          ${active ? "bg-zinc-800 text-white"
            : highlight ? "text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 border border-purple-500/20"
            : `${color || "text-zinc-400"} hover:text-white hover:bg-zinc-800/50`}`}>
        <span className="text-sm shrink-0">{emoji}</span>
        <span className="flex-1 truncate">{label}</span>
        {showBadge && pendingCount > 0 && (
          <span className="text-[10px] bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1.5 py-0.5 rounded-full">{pendingCount}</span>
        )}
      </Link>
    );
  };

  const sidebar = (
    <aside className="h-screen w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-800 shrink-0">
        <span className="text-lg">🔮</span>
        <span className="font-semibold text-sm tracking-tight">Orion OS</span>
      </div>

      <nav className="flex-1 px-2 pt-3 pb-3 overflow-y-auto space-y-0.5">

        {/* Global nav */}
        {GLOBAL_NAV.map(item => (
          <NavLink key={item.href} href={item.href} emoji={item.emoji} label={item.label}
            highlight={item.highlight} showBadge={item.badge} />
        ))}

        {/* Projects section */}
        <div className="pt-3 pb-1 px-3">
          <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">Projects</span>
        </div>

        {PROJECTS.map(project => {
          const isExpanded = expandedProjects.has(project.id);
          const projectBase = `/projects/${project.id}`;
          const projectActive = pathname.startsWith(projectBase);

          return (
            <div key={project.id}>
              {/* Project row */}
              <div className={`flex items-center gap-1 rounded-lg transition-colors ${projectActive ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"}`}>
                <Link href={projectBase}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm flex-1 min-w-0 ${project.color}`}>
                  <span className="text-sm shrink-0">{project.emoji}</span>
                  <span className="truncate">{project.label}</span>
                </Link>
                <button onClick={() => toggleProject(project.id)}
                  className="px-1.5 py-1.5 text-zinc-600 hover:text-zinc-400 shrink-0 transition-colors">
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </button>
              </div>

              {/* Sub-nav */}
              {isExpanded && (
                <div className="space-y-0.5 mt-0.5">
                  {PROJECT_SUB.map(sub => (
                    <NavLink key={sub.suffix}
                      href={`${projectBase}${sub.suffix}`}
                      emoji={sub.emoji} label={sub.label}
                      indent color="text-zinc-500" />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Flight Controls */}
      <div className="px-3 pt-2 pb-1 shrink-0 border-t border-zinc-800 space-y-1.5">
        <PreflightButton compact />
        <SaveSessionButton compact />
      </div>

      {/* Status */}
      <div className="px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          Orion online
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Desktop sidebar */}
      <div className="hidden md:block sticky top-0 h-screen shrink-0">{sidebar}</div>

      {/* Mobile sidebar */}
      <div className={`fixed top-0 left-0 z-50 h-screen md:hidden transition-transform ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </div>

      {/* Main */}
      <div className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 md:hidden">
          <button onClick={() => setMobileOpen(o => !o)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-semibold">🔮 Orion OS</span>
        </header>
        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
