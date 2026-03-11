import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = process.env.HOME
  ? path.join(process.env.HOME, ".openclaw", "workspace")
  : "/Users/neilmetzger/.openclaw/workspace";

export interface TrackerIssue {
  id: string;
  title: string;
  type: string;
  assignee: string;
  status: string;
  statusEmoji: string;
  priority: string;
  project: string;
}

function parseStatus(raw: string): { status: string; statusEmoji: string } {
  if (raw.includes("blocked")) return { status: "blocked", statusEmoji: "🔴" };
  if (raw.includes("ready")) return { status: "ready", statusEmoji: "🟡" };
  if (raw.includes("in-progress")) return { status: "in-progress", statusEmoji: "🟢" };
  if (raw.includes("done")) return { status: "done", statusEmoji: "✅" };
  if (raw.includes("backlog")) return { status: "backlog", statusEmoji: "💤" };
  return { status: raw.trim(), statusEmoji: "" };
}

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";

export async function GET(req: Request) {
  if (IS_CLOUD) return NextResponse.json({ issues: [], raw: "", _cloud: true });

  const { searchParams } = new URL(req.url);
  const projectFilter = searchParams.get("project");
  const trackerPath = path.join(WORKSPACE, "agency", "TRACKER.md");

  if (!fs.existsSync(trackerPath)) {
    return NextResponse.json({ issues: [], raw: "" });
  }

  const raw = fs.readFileSync(trackerPath, "utf-8");
  const lines = raw.split("\n");

  const issues: TrackerIssue[] = [];
  let currentProject = "";

  for (const line of lines) {
    if (line.startsWith("### ")) {
      currentProject = line.replace("### ", "").trim();
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.startsWith("|--") || trimmed.startsWith("| ID")) continue;

    const cols = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);

    if (cols.length >= 6) {
      const { status, statusEmoji } = parseStatus(cols[4]);
      issues.push({
        id: cols[0],
        title: cols[1],
        type: cols[2],
        assignee: cols[3],
        status,
        statusEmoji,
        priority: cols[5],
        project: currentProject,
      });
    }
  }

  const filtered = projectFilter
    ? issues.filter((i) => i.project.toLowerCase().includes(projectFilter.toLowerCase()))
    : issues;

  return NextResponse.json({ issues: filtered, raw });
}
