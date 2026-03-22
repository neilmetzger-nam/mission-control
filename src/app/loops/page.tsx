"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

interface LoopItem {
  text: string;
  source: string;
}

interface LoopsData {
  openCount: number;
  total: number;
  items: LoopItem[];
  status: string;
}

export default function LoopsPage() {
  const [data, setData] = useState<LoopsData | null>(null);
  const [closedItems, setClosedItems] = useState<string[]>([]);
  const [showClosed, setShowClosed] = useState(false);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/session/open-loops").then(r => r.json());
    setData(res);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function closeLoop(index: number, text: string) {
    // Optimistic: remove from open, add to closed
    setData(prev => {
      if (!prev) return prev;
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, openCount: prev.openCount - 1, items: newItems };
    });
    setClosedItems(prev => [...prev, text]);

    await fetch("/api/session/open-loops/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index }),
    });
  }

  async function promoteAndClose(index: number, text: string) {
    // Add to planner today
    await fetch("/api/planner", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", section: "today", item: text }),
    });
    // Then close the loop
    await closeLoop(index, text);
  }

  if (!data) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );

  const indicator = data.openCount > 3 ? "🛑" : "⚠️";
  const closedCount = data.total - data.openCount;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-zinc-200 pb-12">
      <div className="px-4 pt-6 pb-4">
        <Link href="/planner" className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">← Planner</Link>
        <h1 className="text-xl font-bold text-white mt-2">Open Loops</h1>
        <p className="text-xs text-zinc-500 mt-0.5">{data.openCount} unresolved · {data.total} total</p>
      </div>

      <div className="px-4 space-y-2">
        {data.openCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="text-3xl mb-3">🎉</span>
            <p className="text-emerald-400 text-sm font-medium">✅ All loops closed</p>
          </div>
        ) : (
          data.items.map((item, i) => (
            <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/40 px-4 py-3 flex items-center gap-3">
              <span className="text-sm shrink-0">{indicator}</span>
              <span className="text-sm text-zinc-200 flex-1 min-w-0">{item.text}</span>
              <button onClick={() => promoteAndClose(i, item.text)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 shrink-0 transition-colors">
                → Today
              </button>
              <button onClick={() => closeLoop(i, item.text)}
                className="text-[11px] px-2.5 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 hover:bg-zinc-800 shrink-0 transition-colors">
                ✅ Done
              </button>
            </div>
          ))
        )}

        {/* Closed loops */}
        {(closedCount + closedItems.length) > 0 && (
          <div className="mt-4">
            <button onClick={() => setShowClosed(!showClosed)}
              className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              <span>{closedCount + closedItems.length} closed</span>
              <span>{showClosed ? "▲" : "▼"}</span>
            </button>
            {showClosed && (
              <div className="mt-2 space-y-1.5">
                {closedItems.map((text, i) => (
                  <div key={`just-closed-${i}`} className="flex items-center gap-2 px-4 py-2">
                    <span className="text-sm shrink-0">✅</span>
                    <span className="text-sm text-zinc-600 line-through">{text}</span>
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
