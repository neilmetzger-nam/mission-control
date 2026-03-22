"use client";

import { useEffect, useState } from "react";

interface BriefData {
  lines: string[];
  updatedAt: string | null;
}

export default function PreflightBrief() {
  const [brief, setBrief] = useState<BriefData | null>(null);

  useEffect(() => {
    fetch("/api/session/preflight-brief")
      .then(r => r.json())
      .then((d: BriefData) => {
        if (d.lines && d.lines.length > 0) setBrief(d);
      })
      .catch(() => {});
  }, []);

  if (!brief || brief.lines.length === 0) return null;

  return (
    <div className="rounded-xl bg-zinc-900/60 px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Copilot Brief</span>
        {brief.updatedAt && (
          <span className="text-[10px] text-zinc-500">{brief.updatedAt}</span>
        )}
      </div>
      <div className="space-y-1">
        {brief.lines.map((line, i) => (
          <p key={i} className="text-sm text-zinc-300 leading-relaxed">{line}</p>
        ))}
      </div>
    </div>
  );
}
