"use client";

import { useState, useCallback } from "react";

type Status = "idle" | "landing" | "landed" | "error";

export default function LandingButton({ compact }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");

  const handleLand = useCallback(async () => {
    if (status === "landing") return;
    setStatus("landing");
    try {
      const res = await fetch("/api/session/land", { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      try {
        localStorage.setItem("mc-last-save", String(Date.now()));
        localStorage.setItem("mc-session-start", String(Date.now()));
        window.dispatchEvent(new Event("mc-refresh"));
      } catch { /* noop */ }
      setStatus("landed");
      setTimeout(() => setStatus("idle"), 4000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [status]);

  const label = {
    idle: "🛬 Land",
    landing: "Landing...",
    landed: "Landed ✅",
    error: "Failed — try again",
  }[status];

  const colors = {
    idle: "border-zinc-700 text-zinc-400 hover:border-emerald-500 hover:text-emerald-300",
    landing: "border-zinc-700 text-zinc-500 cursor-wait",
    landed: "border-green-500/40 text-green-400",
    error: "border-red-500/40 text-red-400",
  }[status];

  return (
    <div className={compact ? "" : ""}>
      <button
        onClick={handleLand}
        disabled={status === "landing"}
        className={`w-full flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-colors ${colors} ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
      >
        {status === "landing" && (
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {label}
      </button>
      <p className="text-[9px] text-zinc-600 text-center mt-0.5">Put the plane away</p>
    </div>
  );
}
