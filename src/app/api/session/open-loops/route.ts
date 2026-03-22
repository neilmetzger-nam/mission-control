import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HANDOFF_PATH = path.join(
  process.env.HOME ?? "/Users/neilmetzger",
  ".openclaw",
  "workspace",
  "memory",
  "handoff.md",
);

export async function GET() {
  try {
    if (!fs.existsSync(HANDOFF_PATH)) {
      return NextResponse.json({ openCount: 0, total: 0, status: "green" });
    }

    const content = fs.readFileSync(HANDOFF_PATH, "utf-8");
    const lines = content.split("\n");

    let total = 0;
    let open = 0;
    const items: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (/^[-*]\s+/.test(trimmed)) {
        total++;
        if (!trimmed.includes("✅")) {
          open++;
          if (items.length < 8) {
            items.push(trimmed.replace(/^[-*]\s+/, ""));
          }
        }
      }
    }

    let status: string;
    if (open === 0) status = "green";
    else if (open <= 3) status = "amber";
    else status = "red";

    return NextResponse.json({ openCount: open, total, items, status });
  } catch (e) {
    return NextResponse.json({ openCount: 0, total: 0, status: "green", error: String(e) });
  }
}
