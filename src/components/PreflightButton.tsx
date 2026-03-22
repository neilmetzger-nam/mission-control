"use client";

import { useState, useCallback, useEffect, useRef } from "react";

type Status = "idle" | "running" | "waiting" | "done" | "error";

const WAIT_SECONDS = 30;

export default function PreflightButton({ compact }: { compact?: boolean }) {
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
          setStatus("done");
          setTimeout(() => setStatus("idle"), 3000);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => () => clearTimer(), []);

  const handlePreflight = useCallback(async () => {
    if (status === "running" || status === "waiting") return;
    setStatus("running");
    try {
      const res = await fetch("/api/session/preflight", { method: "POST" });
      if (!res.ok) throw new Error("request failed");
      try {
        localStorage.setItem("mc-session-start", String(Date.now()));
        localStorage.setItem("mc-last-save", String(Date.now()));
        window.dispatchEvent(new Event("mc-refresh"));
      } catch { /* noop */ }
      startCountdown();
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4000);
    }
  }, [status, startCountdown]);

  const label = {
    idle:    "✈️ Pre-Flight",
    running: "Sending...",
    waiting: `Dave is reading... ${countdown}s`,
    done:    "✓ Dave is ready",
    error:   "Failed — try again",
  }[status];

  const subLabel = {
    idle:    "New flight — get current",
    running: "Waking Dave...",
    waiting: "Telegram reply coming soon",
    done:    "Check Telegram ↗",
    error:   "Try again",
  }[status];

  const colors = {
    idle:    "border-zinc-700 text-zinc-400 hover:border-amber-500 hover:text-amber-300",
    running: "border-zinc-700 text-zinc-500 cursor-wait",
    waiting: "border-amber-500/40 text-amber-400",
    done:    "border-green-500/40 text-green-400",
    error:   "border-red-500/40 text-red-400",
  }[status];

  const isDisabled = status === "running" || status === "waiting";

  return (
    <div>
      <button
        onClick={handlePreflight}
        disabled={isDisabled}
        className={`w-full flex items-center justify-center gap-2 rounded-lg border text-xs font-medium transition-colors ${colors} ${compact ? "px-2.5 py-1.5" : "px-3 py-2"}`}
      >
        {status === "running" && (
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {status === "waiting" && (
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
