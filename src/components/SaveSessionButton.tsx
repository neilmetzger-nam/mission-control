"use client";

import { useState, useCallback } from "react";

type Status = "idle" | "saving" | "saved" | "error";

export default function SaveSessionButton({ compact }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  const handleSave = useCallback(async () => {
    if (status === "saving") return;
    setStatus("saving");
    try {
      const res = await fetch("/api/session/save", { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      try { localStorage.setItem("mc-last-save", String(Date.now())); } catch { /* noop */ }
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [status]);

  const label = {
    idle: "💾 Save Session",
    saving: "Saving...",
    saved: "Saved ✓",
    error: "Failed — try again",
  }[status];

  const colors = {
    idle: "border-zinc-700 text-zinc-400 hover:border-indigo-500 hover:text-indigo-300",
    saving: "border-zinc-700 text-zinc-500 cursor-wait",
    saved: "border-green-500/40 text-green-400",
    error: "border-red-500/40 text-red-400",
  }[status];

  return (
    <div className={compact ? "" : ""}>
      <button
        onClick={handleSave}
        disabled={status === "saving"}
        className={`w-full flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-colors ${colors} ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
      >
        {status === "saving" && (
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {label}
      </button>
      <p className="text-[9px] text-zinc-600 text-center mt-0.5">Checkpoint — keep going</p>
    </div>
  );
}
