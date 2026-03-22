import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STATE_PATH = path.join(process.cwd(), "data", "session-context.json");
const OPENCLAW_PORT = 18789;

interface SessionState {
  sessionStart: string;
}

function readState(): SessionState | null {
  try {
    return JSON.parse(fs.readFileSync(STATE_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function writeState(state: SessionState) {
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), "utf-8");
}

async function getOpenClawContext(): Promise<{ used: number; max: number; pct: number } | null> {
  try {
    // OpenClaw gateway RPC — get session status
    const res = await fetch(`http://127.0.0.1:${OPENCLAW_PORT}/api/v1/sessions/main`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    // Look for context fields in the response
    const contextUsed = data?.context?.used ?? data?.contextTokens ?? null;
    const contextMax = data?.context?.max ?? data?.contextMax ?? null;
    if (contextUsed !== null && contextMax !== null && contextMax > 0) {
      const pctRemaining = Math.round((1 - contextUsed / contextMax) * 100);
      return { used: contextUsed, max: contextMax, pct: Math.max(0, pctRemaining) };
    }
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  // Try real OpenClaw context data first
  const real = await getOpenClawContext();
  
  if (real) {
    let status: string;
    if (real.pct > 60) status = "green";
    else if (real.pct > 30) status = "amber";
    else status = "red";

    return NextResponse.json({
      pctRemaining: real.pct,
      contextUsed: real.used,
      contextMax: real.max,
      source: "openclaw",
      status,
    });
  }

  // Fallback: timer-based heuristic
  let state = readState();
  if (!state) {
    state = { sessionStart: new Date().toISOString() };
    writeState(state);
  }

  const startMs = new Date(state.sessionStart).getTime();
  const nowMs = Date.now();
  const minutesElapsed = Math.round((nowMs - startMs) / 60000);

  const maxMinutes = 200;
  const pctRemaining = Math.max(0, Math.round(100 - (minutesElapsed / maxMinutes) * 100));

  let status: string;
  if (pctRemaining > 60) status = "green";
  else if (pctRemaining > 30) status = "amber";
  else status = "red";

  return NextResponse.json({ minutesElapsed, pctRemaining, source: "heuristic", status });
}

// POST to reset session
export async function POST() {
  const state: SessionState = { sessionStart: new Date().toISOString() };
  writeState(state);
  return NextResponse.json({ ok: true, sessionStart: state.sessionStart });
}
