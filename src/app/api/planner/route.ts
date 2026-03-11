import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";
const WORKSPACE = process.env.HOME
  ? path.join(process.env.HOME, ".openclaw", "workspace")
  : "/Users/neilmetzger/.openclaw/workspace";

const PLANNER_PATH = IS_CLOUD ? "" : path.join(WORKSPACE, "PLANNER.md");

function readMd(): string {
  try { return fs.readFileSync(PLANNER_PATH, "utf-8"); } catch { return ""; }
}

function parsePlanner(md: string) {
  const sections: Record<string, string[]> = {
    today: [], thisWeek: [], thisMonth: [], thisQuarter: [],
    thisYear: [], top5: [], delegated: [], backlog: [],
  };
  let cur = "";
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (/^##\s+🔴\s+Today/i.test(t)) { cur = "today"; continue; }
    if (/^##\s+📅\s+This Week/i.test(t)) { cur = "thisWeek"; continue; }
    if (/^##\s+📆\s+This Month/i.test(t)) { cur = "thisMonth"; continue; }
    if (/^##\s+🗓️/.test(t)) { cur = "thisQuarter"; continue; }
    if (/^##\s+📌\s+This Year/i.test(t)) { cur = "thisYear"; continue; }
    if (/^##\s+🎯\s+Top 5/i.test(t)) { cur = "top5"; continue; }
    if (/^##\s+🤝\s+Delegated/i.test(t)) { cur = "delegated"; continue; }
    if (/^##\s+📋\s+Backlog/i.test(t)) { cur = "backlog"; continue; }
    if (/^##/.test(t)) { cur = ""; continue; }
    if (!cur) continue;
    if (/^\d+\.\s+/.test(t)) sections[cur].push(t.replace(/^\d+\.\s+/, ""));
    else if (/^[-*]\s+/.test(t)) sections[cur].push(t.replace(/^[-*]\s+/, ""));
    else if (cur === "delegated" && t.startsWith("|") && !/[-:]/.test(t.replace(/[|]/g,"").trim().slice(0,3)) && !/Item/.test(t)) {
      const cols = t.split("|").map(s => s.trim()).filter(Boolean);
      if (cols.length >= 3) sections.delegated.push(JSON.stringify({ item: cols[0], who: cols[1], status: cols[2] }));
    }
  }
  return sections;
}

export async function GET() {
  if (IS_CLOUD) {
    return NextResponse.json({ today: [], thisWeek: [], thisMonth: [], thisQuarter: [], thisYear: [], top5: [], delegated: [], backlog: [], _cloud: true });
  }
  const md = readMd();
  const s = parsePlanner(md);
  const delegated = s.delegated.map(d => { try { return JSON.parse(d); } catch { return { item: d, who: "", status: "🟡 Waiting" }; }});
  return NextResponse.json({ today: s.today, thisWeek: s.thisWeek, thisMonth: s.thisMonth, thisQuarter: s.thisQuarter, thisYear: s.thisYear, top5: s.top5, delegated, backlog: s.backlog });
}

export async function POST(request: Request) {
  try {
    const { action, section, item, index } = await request.json();
    let md = readMd();
    if (action === "add" && section && item) {
      const headers: Record<string,string> = { today: "🔴 Today", thisWeek: "📅 This Week", thisMonth: "📆 This Month" };
      const header = headers[section];
      if (header) {
        const lines = md.split("\n");
        let insertAt = -1;
        let inSection = false;
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(header)) { inSection = true; continue; }
          if (inSection && /^##/.test(lines[i].trim())) { if (insertAt < 0) insertAt = i; break; }
          if (inSection && /^\d+\./.test(lines[i].trim())) insertAt = i + 1;
        }
        if (insertAt > -1) {
          const num = lines.slice(0, insertAt).filter(l => /^\d+\./.test(l.trim())).length + 1;
          lines.splice(insertAt, 0, `${num}. ${item}`);
          fs.writeFileSync(PLANNER_PATH, lines.join("\n"), "utf-8");
        }
      }
    }
    return GET();
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
