"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Status = "idle" | "landing" | "waiting" | "landed" | "error";

const WAIT_SECONDS = 30;

export default function LandingButton({ compact }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status>("idle");
  const [countdown, setCountdown] = useState(WAIT_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  };

  const startCountdown = useCallback(() => {
    setCountdown(WAIT_SECONDS);
    setStatus("waiting");
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearTimer();
          setStatus("landed");
          setTimeout(() => setStatus("idle"), 4000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearTimer(), []);

  const handleLand = useCallback(async () => {
    if (status === "landing" || status === "waiting") return;
    setStatus("landing");
    try {
      const res = await fetch("/api/session/land", { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      try {
        localStorage.setItem("mc-last-save", String(Date.now()));
        localStorage.setItem("mc-session-start", String(Date.now()));
        window.dispatchEvent(new Event("mc-refresh"));
      } catch { /* noop */ }
      startCountdown();
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [status, startCountdown]);

  const label = {
    idle:    "🛬 Land",
    landing: "Landing...",
    waiting: `Dave is writing... ${countdown}s`,
    landed:  "Landed ✅",
    error:   "Failed — try again",
  }[status];

  const subLabel = {
    idle:    "Put the plane away",
    landing: "Saving session...",
    waiting: "Telegram summary coming soon",
    landed:  "Check Telegram ↗",
    error:   "Try again",
  }[status];

  const colors = {
    idle:    "border-zinc-700 text-zinc-400 hover:border-emerald-500 hover:text-emerald-300",
    landing: "border-zinc-700 text-zinc-500 cursor-wait",
    waiting: "border-emerald-500/40 text-emerald-400",
    landed:  "border-green-500/40 text-green-400",
    error:   "border-red-500/40 text-red-400",
  }[status];

  const isDisabled = status === "landing" || status === "waiting";

  return (
    <div>
      <button
        onClick={handleLand}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-colors ${colors} ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
      >
        {(status === "landing" || status === "waiting") && (
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {label}
      </button>
      <p className="text-[9px] text-zinc-600 text-center mt-0.5">{subLabel}</p>
    </div>
  );
}
