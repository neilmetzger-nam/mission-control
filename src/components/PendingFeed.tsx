"use client";

import { useCallback, useEffect, useState } from "react";

interface PendingItem {
  id: string;
  text: string;
  source: "handoff" | "marketing" | "brief";
  sourceLabel: string;
  project: string | null;
}

const SOURCE_BADGE: Record<string, string> = {
  handoff: "border-red-500/20 text-red-400 bg-red-500/10",
  marketing: "border-pink-500/20 text-pink-400 bg-pink-500/10",
  brief: "border-amber-500/20 text-amber-400 bg-amber-500/10",
};

export default function PendingFeed({ onPromote }: { onPromote: () => void }) {
  const [items, setItems] = useState<PendingItem[]>([]);
  const [open, setOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    try {
      const v = localStorage.getItem("mc-pending-feed-open");
      return v === null ? true : v === "true";
    } catch { return true; }
  });
  const [promoted, setPromoted] = useState<Record<string, "today" | "week">>({});

  const fetchPending = useCallback(() => {
    fetch("/api/planner/pending")
      .then(r => r.json())
      .then(d => {
        setItems(d.items ?? []);
        if (d.count === 0) setOpen(false);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  useEffect(() => {
    try { localStorage.setItem("mc-pending-feed-open", String(open)); } catch {}
  }, [open]);

  async function promote(item: PendingItem, section: "today" | "thisWeek") {
    const label = section === "today" ? "today" : "week";
    setPromoted(prev => ({ ...prev, [item.id]: label }));
    try {
      await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", section, item: item.text }),
      });
      setTimeout(() => {
        setItems(prev => prev.filter(i => i.id !== item.id));
        setPromoted(prev => { const n = { ...prev }; delete n[item.id]; return n; });
        onPromote();
      }, 600);
    } catch {
      setPromoted(prev => { const n = { ...prev }; delete n[item.id]; return n; });
    }
  }

  const count = items.length;
  if (count === 0 && !open) return null;

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-3 min-h-[44px]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">📥 Pending</span>
          {count > 0 && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{count}</span>}
        </div>
        <span className="text-zinc-600 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && count > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {items.map(item => {
            const done = promoted[item.id];
            return (
              <div key={item.id} className="flex items-center gap-2 min-h-[40px]">
                <span className={`text-[9px] px-1.5 py-0.5 rounded border shrink-0 ${SOURCE_BADGE[item.source] ?? SOURCE_BADGE.handoff}`}>
                  {item.sourceLabel}
                </span>
                <span className="text-sm text-zinc-200 flex-1 min-w-0 truncate">{item.text}</span>
                {done ? (
                  <span className="text-emerald-400 text-xs shrink-0">✓</span>
                ) : (
                  <>
                    <button onClick={() => promote(item, "today")}
                      className="text-[10px] px-2 py-1 rounded border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 shrink-0 transition-colors">
                      → Today
                    </button>
                    <button onClick={() => promote(item, "thisWeek")}
                      className="text-[10px] px-2 py-1 rounded border border-zinc-600 text-zinc-400 hover:bg-zinc-800 shrink-0 transition-colors">
                      → Week
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
