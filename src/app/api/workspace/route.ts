import { NextResponse } from "next/server";
import { readFileSync, readdirSync, existsSync } from "fs";
import { join } from "path";

const WORKSPACE = "/Users/neilmetzger/.openclaw/workspace";

function readFile(path: string): string {
  try { return readFileSync(path, "utf-8"); } catch { return ""; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get("section");

  if (section === "memory") {
    return NextResponse.json({ content: readFile(join(WORKSPACE, "MEMORY.md")) });
  }

  if (section === "ideas") {
    return NextResponse.json({ content: readFile(join(WORKSPACE, "agency/IDEAS.md")) });
  }

  if (section === "roster") {
    return NextResponse.json({ content: readFile(join(WORKSPACE, "agency/ROSTER.md")) });
  }

  if (section === "portfolio") {
    return NextResponse.json({ content: readFile(join(WORKSPACE, "agency/PORTFOLIO.md")) });
  }

  if (section === "daily") {
    const memDir = join(WORKSPACE, "memory");
    const files = readdirSync(memDir)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
      .sort().reverse().slice(0, 14); // last 14 days
    const days = files.map(f => ({
      date: f.replace(".md", ""),
      content: readFile(join(memDir, f)),
    }));
    return NextResponse.json({ days });
  }

  if (section === "project-docs") {
    const projectId = searchParams.get("project");
    if (!projectId) return NextResponse.json({ files: [] });
    const dir = join(WORKSPACE, "agency/projects", projectId);
    if (!existsSync(dir)) return NextResponse.json({ files: [] });
    const files = readdirSync(dir, { recursive: true })
      .filter((f): f is string => typeof f === "string" && f.endsWith(".md"))
      .map(f => ({ name: f, content: readFile(join(dir, f)) }));
    return NextResponse.json({ files });
  }

  // Default: return all sections summary
  return NextResponse.json({
    memory: readFile(join(WORKSPACE, "MEMORY.md")),
    ideas: readFile(join(WORKSPACE, "agency/IDEAS.md")),
    roster: readFile(join(WORKSPACE, "agency/ROSTER.md")),
  });
}
