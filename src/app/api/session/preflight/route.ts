import { NextResponse } from "next/server";

export async function POST() {
  const hookUrl = process.env.OPENCLAW_HOOK_URL;
  const hookToken = process.env.OPENCLAW_HOOK_TOKEN;

  if (hookUrl && hookToken) {
    try {
      await fetch(hookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${hookToken}`,
        },
        body: JSON.stringify({
          text: "✈️ Neil just clicked Pre-Flight. Do these 3 things now: (1) Read memory/handoff.md, memory/preflight-brief.md, and today's daily note. (2) Check http://localhost:3001/api/planner for current tasks. (3) Send Neil a Telegram message: confirm you're calibrated with a 2-line summary of current state (open loops count, most urgent item today).",
          mode: "now",
        }),
      });
    } catch { /* silent */ }
  }

  return NextResponse.json({ ok: true, triggeredAt: new Date().toISOString() });
}
