import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const BRIEF_PATH = path.join(
  process.env.HOME ?? "",
  ".openclaw",
  "workspace",
  "memory",
  "preflight-brief.md",
);

export async function GET() {
  try {
    if (!fs.existsSync(BRIEF_PATH)) {
      return NextResponse.json({ lines: [], updatedAt: null });
    }

    const content = fs.readFileSync(BRIEF_PATH, "utf-8");
    const stat = fs.statSync(BRIEF_PATH);

    const lines: string[] = [];
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (/^[-*]\s+/.test(trimmed)) {
        lines.push(trimmed.replace(/^[-*]\s+/, ""));
      }
    }

    const updatedAt = stat.mtime.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }) + ", " + stat.mtime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    return NextResponse.json({ lines, updatedAt });
  } catch (e) {
    return NextResponse.json({ lines: [], updatedAt: null, error: String(e) });
  }
}
