import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HANDOFF_PATH = path.join(
  process.env.HOME ?? "/Users/neilmetzger",
  ".openclaw",
  "workspace",
  "memory",
  "handoff.md",
);

export async function POST(request: NextRequest) {
  try {
    const { index } = await request.json();
    if (typeof index !== "number") {
      return NextResponse.json({ error: "index required" }, { status: 400 });
    }

    if (!fs.existsSync(HANDOFF_PATH)) {
      return NextResponse.json({ error: "handoff.md not found" }, { status: 404 });
    }

    const content = fs.readFileSync(HANDOFF_PATH, "utf-8");
    const lines = content.split("\n");

    let openIdx = 0;
    let modified = false;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (/^[-*]\s+/.test(trimmed) && !trimmed.includes("✅")) {
        if (openIdx === index) {
          lines[i] = lines[i].replace(/^(\s*[-*]\s+)/, "$1✅ ");
          modified = true;
          break;
        }
        openIdx++;
      }
    }

    if (!modified) {
      return NextResponse.json({ error: "index out of range" }, { status: 400 });
    }

    fs.writeFileSync(HANDOFF_PATH, lines.join("\n"), "utf-8");

    // Return updated counts in same shape as GET
    let total = 0;
    let open = 0;
    const items: { text: string; source: string }[] = [];
    for (const line of lines) {
      const t = line.trim();
      if (/^[-*]\s+/.test(t)) {
        total++;
        if (!t.includes("✅")) {
          open++;
          if (items.length < 8) {
            items.push({ text: t.replace(/^[-*]\s+/, ""), source: "handoff" });
          }
        }
      }
    }

    const status = open === 0 ? "green" : open <= 3 ? "amber" : "red";
    return NextResponse.json({ openCount: open, total, items, status });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
