"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3, Brain, FolderOpen, Bot, ClipboardList, Settings, Menu, X,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Dashboard", icon: BarChart3, emoji: "📊" },
  { href: "/memory", label: "Memory", icon: Brain, emoji: "🧠" },
  { href: "/projects", label: "Projects", icon: FolderOpen, emoji: "📁" },
  { href: "/agents", label: "Agents", icon: Bot, emoji: "🤖" },
  { href: "/tracker", label: "Tracker", icon: ClipboardList, emoji: "📋" },
  { href: "/config", label: "Config", icon: Settings, emoji: "⚙️" },
];

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

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
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
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
