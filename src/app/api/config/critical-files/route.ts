import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HOME = process.env.HOME ?? "/Users/neilmetzger";

const CRITICAL_FILES = [
  { path: ".openclaw/workspace/MEMORY.md", label: "Dave's long-term memory — curated decisions, context, history" },
  { path: ".openclaw/workspace/agency/TRACKER.md", label: "All project issues across AI-R and Studio" },
  { path: ".openclaw/workspace/agency/ROSTER.md", label: "All agents across all projects" },
  { path: ".openclaw/workspace/agency/PORTFOLIO.md", label: "All client projects" },
  { path: ".openclaw/workspace/agency/IDEAS.md", label: "Future initiatives backlog" },
  { path: ".openclaw/workspace/agency/projects/ai-r/deadlines.md", label: "Beta sprint deadlines" },
  { path: ".openclaw/workspace/agency/projects/ai-r/SPRINT-QUEUE.md", label: "Sprint task queue" },
  { path: "Desktop/AIR-Web/prompts/", label: "All Claude Code prompts for AI-R" },
  { path: "Desktop/mission-control/prompts/", label: "All Claude Code prompts for Mission Control" },
];

export interface CriticalFile {
  path: string;
  label: string;
  exists: boolean;
  lastModified: string | null;
  sizeKb: number | null;
}

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";

export async function GET() {
  if (IS_CLOUD) {
    return NextResponse.json({ files: CRITICAL_FILES.map(e => ({ path: e.path, label: e.label, exists: false, lastModified: null, sizeKb: null })), _cloud: true });
  }

  const results: CriticalFile[] = CRITICAL_FILES.map((entry) => {
    const fullPath = path.join(HOME, entry.path);
    try {
      const stat = fs.statSync(fullPath);
      return {
        path: entry.path,
        label: entry.label,
        exists: true,
        lastModified: stat.mtime.toISOString(),
        sizeKb: Math.round((stat.size / 1024) * 10) / 10,
      };
    } catch {
      return {
        path: entry.path,
        label: entry.label,
        exists: false,
        lastModified: null,
        sizeKb: null,
      };
    }
  });

  return NextResponse.json({ files: results });
}
