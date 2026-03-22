"use client";

import { useEffect, useState } from "react";

/* ── InfoTip — CSS-only hover popover ── */
function InfoTip({ text }: { text: string }) {
  return (
    <span className="group/info relative inline-flex ml-1 cursor-default select-none">
      <span className="text-[10px] text-zinc-600 hover:text-zinc-400">{"\u24D8"}</span>
      <span className="hidden group-hover/info:block absolute left-full ml-1.5 top-1/2 -translate-y-1/2 z-20
        bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-zinc-300 leading-relaxed shadow-xl w-64">
        {text}
      </span>
    </span>
  );
}

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
        <span className="flex items-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Copilot Brief</span>
          <InfoTip text="Copilot Brief \u2014 Dave\u2019s working memory, made visible. Updated every session and heartbeat. Shows: active warnings and time-sensitive items, what memory files Dave loaded, decisions that need your input, open loops that haven\u2019t closed, and what was completed this session. Dave owns this file \u2014 you never need to write to it." />
        </span>
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
