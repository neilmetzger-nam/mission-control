import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HOME = process.env.HOME ?? "/Users/neilmetzger";
const HANDOFF_PATH = path.join(HOME, ".openclaw", "workspace", "memory", "handoff.md");
const SESSION_PATH = path.join(process.cwd(), "data", "session-context.json");

export async function POST() {
  try {
    const landedAt = new Date().toISOString();

    // 1. Count open loops
    let openLoops = 0;
    try {
      if (fs.existsSync(HANDOFF_PATH)) {
        const content = fs.readFileSync(HANDOFF_PATH, "utf-8");
        for (const line of content.split("\n")) {
          const t = line.trim();
          if (/^[-*]\s+/.test(t) && !t.includes("✅")) openLoops++;
        }
      }
    } catch { /* noop */ }

    // 2. Append landing entry to handoff.md
    try {
      let content = "";
      if (fs.existsSync(HANDOFF_PATH)) {
        content = fs.readFileSync(HANDOFF_PATH, "utf-8");
      }
      const dt = new Date().toLocaleString("en-US", {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true,
      });
      const entry = `\n- 🛬 Landed: ${dt} — ${openLoops} open loops remaining\n`;
      if (content.includes("## Landings")) {
        content = content.replace(/(## Landings[^\n]*\n)/, `$1${entry}`);
      } else {
        content += `\n\n## Landings\n${entry}`;
      }
      fs.writeFileSync(HANDOFF_PATH, content, "utf-8");
    } catch { /* noop */ }

    // 3. Reset session context
    try {
      fs.writeFileSync(SESSION_PATH, JSON.stringify({ sessionStart: landedAt }, null, 2), "utf-8");
    } catch { /* noop */ }

    // 4. Wake Dave via webhook (silent on failure)
    const hookUrl = process.env.OPENCLAW_HOOK_URL;
    const hookToken = process.env.OPENCLAW_HOOK_TOKEN;
    if (hookUrl && hookToken) {
      try {
        await fetch(`${hookUrl}/hooks/wake`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${hookToken}`,
          },
          body: JSON.stringify({
            text: "🛬 Neil just landed the plane. Write the landing handoff summary now: update memory/handoff.md with what happened this session, update memory/preflight-brief.md with current state, and close any completed loops.",
            mode: "now",
          }),
        });
      } catch { /* silent — never block landing */ }
    }

    // 5. Return
    return NextResponse.json({ ok: true, openLoops, landedAt });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
