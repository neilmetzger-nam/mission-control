import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const WORKSPACE = process.env.HOME
  ? path.join(process.env.HOME, ".openclaw", "workspace")
  : "/Users/neilmetzger/.openclaw/workspace";

export interface AgentEntry {
  name: string;
  emoji: string;
  project: string;
  domain: string;
  status: string;
  version: string;
  section: string;
}

function parseTable(lines: string[], section: string): AgentEntry[] {
  const agents: AgentEntry[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|") || trimmed.startsWith("|--") || trimmed.startsWith("| Agent")) continue;
    const cols = trimmed
      .split("|")
      .map((c) => c.trim())
      .filter(Boolean);
    if (cols.length >= 6) {
      agents.push({
        name: cols[0],
        emoji: cols[1],
        project: cols[2],
        domain: cols[3],
        status: cols[4],
        version: cols[5],
        section,
      });
    } else if (cols.length >= 4) {
      // Planned table has fewer columns
      agents.push({
        name: cols[0],
        emoji: cols[1],
        project: "Agency",
        domain: cols[2],
        status: "planned",
        version: "—",
        section,
      });
    }
  }
  return agents;
}

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";

export async function GET() {
  if (IS_CLOUD) return NextResponse.json({ agents: [], raw: "", _cloud: true });

  const rosterPath = path.join(WORKSPACE, "agency", "ROSTER.md");

  if (!fs.existsSync(rosterPath)) {
    return NextResponse.json({ agents: [], raw: "" });
  }

  const raw = fs.readFileSync(rosterPath, "utf-8");
  const lines = raw.split("\n");

  const agents: AgentEntry[] = [];
  let currentSection = "";
  let sectionLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (sectionLines.length > 0) {
        agents.push(...parseTable(sectionLines, currentSection));
      }
      currentSection = line.replace("## ", "").trim();
      sectionLines = [];
    } else {
      sectionLines.push(line);
    }
  }
  // flush last section
  if (sectionLines.length > 0) {
    agents.push(...parseTable(sectionLines, currentSection));
  }

  return NextResponse.json({ agents, raw });
}
