"use client";

import { useEffect, useState } from "react";

interface SecurityItem {
  id: string;
  area: string;
  severity: string;
  status: string;
  notes: string;
}

const SEVERITY_STYLE: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};

const STATUS_STYLE: Record<string, string> = {
  open: "bg-red-500/15 text-red-400 border-red-500/20",
  known: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

export default function AirSecurityPage() {
  const [items, setItems] = useState<SecurityItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/projects/ai-r/config")
      .then(r => r.json())
      .then(d => {
        setItems(d.security ?? []);
        setUpdatedAt(d.updatedAt ?? "");
      })
      .catch(() => {});
  }, []);

  const openCount = items.filter(i => i.status === "open").length;
  const knownCount = items.filter(i => i.status === "known").length;
  const resolvedCount = items.filter(i => i.status === "resolved").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Security</h1>
        <p className="text-zinc-500 text-sm">
          {openCount} open · {knownCount} known · {resolvedCount} resolved
          {updatedAt ? ` · Updated ${updatedAt}` : ""}
        </p>
      </div>

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEVERITY_STYLE[item.severity] ?? SEVERITY_STYLE.low}`}>
                {item.severity}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STATUS_STYLE[item.status] ?? STATUS_STYLE.known}`}>
                {item.status}
              </span>
              <span className={`text-sm font-medium flex-1 ${item.status === "resolved" ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                {item.area}
              </span>
            </div>
            {item.notes && (
              <p className="text-xs text-zinc-500 leading-relaxed">{item.notes}</p>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
