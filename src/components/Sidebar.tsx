"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useMemo } from "react";
import { ChevronRight, Menu, X } from "lucide-react";

// ─── GLOBAL ────────────────────────────────────────────
const GLOBAL_NAV = [
  { href: "/", label: "Dashboard", emoji: "📊" },
  { href: "/memory", label: "Memory", emoji: "🧠" },
  { href: "/agents", label: "Agents", emoji: "🤖" },
];

// ─── PROJECTS ──────────────────────────────────────────
const PROJECTS = [
  {
    id: "ai-r",
    label: "AI-R",
    emoji: "🍽️",
    children: [
      { href: "/projects/ai-r/sprint", label: "Sprint", emoji: "🎯" },
      { href: "/projects/ai-r/docs", label: "Docs", emoji: "📄" },
      { href: "/projects/ai-r/issues", label: "Issues", emoji: "🐛" },
      { href: "/projects/ai-r/settings", label: "Settings", emoji: "⚙️" },
    ],
  },
  {
    id: "studio",
    label: "Studio",
    emoji: "🎬",
    children: [
      { href: "/projects/studio/sprint", label: "Sprint", emoji: "🎯" },
      { href: "/projects/studio/docs", label: "Docs", emoji: "📄" },
      { href: "/projects/studio/issues", label: "Issues", emoji: "🐛" },
      { href: "/projects/studio/settings", label: "Settings", emoji: "⚙️" },
    ],
  },
];

// ─── SYSTEM ────────────────────────────────────────────
const SYSTEM_NAV = [
  { href: "/config", label: "Config", emoji: "⚙️" },
  { href: "/infrastructure", label: "Infrastructure", emoji: "🖥️" },
];

const LS_KEY = "mc-expanded-projects";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="px-3 pt-5 pb-1.5 text-[10px] text-zinc-500 uppercase tracking-widest font-medium">
      {label}
    </div>
  );
}

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function loadExpanded(pathname: string): Record<string, boolean> {
  let parsed: Record<string, boolean> = {};
  try {
    const stored = typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
    if (stored) parsed = JSON.parse(stored);
  } catch {}
  // Auto-expand the project whose sub-route is active
  for (const project of PROJECTS) {
    if (project.children.some((c) => pathname.startsWith(c.href))) {
      parsed[project.id] = true;
    }
  }
  return parsed;
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Compute expanded state: merge localStorage + auto-expand active project
  const initialExpanded = useMemo(() => loadExpanded(pathname), [pathname]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(initialExpanded);

  // Keep in sync when pathname changes (auto-expand active project)
  const expandedWithActive = useMemo(() => {
    const result = { ...expanded };
    for (const project of PROJECTS) {
      if (project.children.some((c) => pathname.startsWith(c.href))) {
        result[project.id] = true;
      }
    }
    return result;
  }, [expanded, pathname]);

  function toggleProject(id: string) {
    setExpanded((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(LS_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-5 border-b border-zinc-800">
          <span className="text-lg">🧠</span>
          <span className="font-semibold text-sm tracking-tight">Dave Console</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 overflow-y-auto">
          {/* GLOBAL */}
          <SectionLabel label="Global" />
          <div className="space-y-0.5">
            {GLOBAL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActivePath(pathname, item.href)
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </div>

          {/* PROJECTS */}
          <SectionLabel label="Projects" />
          <div className="space-y-0.5">
            {PROJECTS.map((project) => {
              const isExpanded = expandedWithActive[project.id] ?? false;
              const projectActive = project.children.some((c) => isActivePath(pathname, c.href));

              return (
                <div key={project.id}>
                  {/* Project row */}
                  <button
                    onClick={() => toggleProject(project.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                      projectActive && !isExpanded
                        ? "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                    }`}
                  >
                    <span className="text-base">{project.emoji}</span>
                    <span className="flex-1 text-left">{project.label}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 text-zinc-600 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {/* Sub-items */}
                  {isExpanded && (
                    <div className="ml-5 pl-3 border-l border-zinc-800 space-y-0.5 mt-0.5 mb-1">
                      {project.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-colors ${
                            isActivePath(pathname, child.href)
                              ? "bg-zinc-800 text-white"
                              : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
                          }`}
                        >
                          <span className="text-sm">{child.emoji}</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* SYSTEM */}
          <SectionLabel label="System" />
          <div className="space-y-0.5">
            {SYSTEM_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActivePath(pathname, item.href)
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Status */}
        <div className="px-4 py-3 border-t border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Dave online
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 md:hidden">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-sm font-semibold">🧠 Dave Console</span>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
