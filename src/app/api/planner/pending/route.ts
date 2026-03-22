import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HOME = process.env.HOME ?? "/Users/neilmetzger";
const WORKSPACE = path.join(HOME, ".openclaw", "workspace");
const HANDOFF_PATH = path.join(WORKSPACE, "memory", "handoff.md");
const PLANNER_PATH = path.join(WORKSPACE, "PLANNER.md");
const MARKETING_PATH = path.join(process.cwd(), "data", "marketing.json");
const BRIEF_PATH = path.join(WORKSPACE, "memory", "preflight-brief.md");

interface PendingItem {
  id: string;
  text: string;
  source: "handoff" | "marketing" | "brief";
  sourceLabel: string;
  project: string | null;
}

function readFile(p: string): string {
  try { return fs.readFileSync(p, "utf-8"); } catch { return ""; }
}

function getPlacedTexts(): string[] {
  const md = readFile(PLANNER_PATH);
  const texts: string[] = [];
  let inSection = false;
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (/^##\s+🔴\s+Today/i.test(t) || /^##\s+📅\s+This Week/i.test(t)) {
      inSection = true;
      continue;
    }
    if (/^##/.test(t)) { inSection = false; continue; }
    if (!inSection) continue;
    if (/^\d+\.\s+/.test(t)) texts.push(t.replace(/^\d+\.\s+/, "").replace(/^~~|~~$/g, "").replace(/^\*\*|\*\*$/g, ""));
    else if (/^[-*]\s+/.test(t)) texts.push(t.replace(/^[-*]\s+/, "").replace(/^~~|~~$/g, "").replace(/^\*\*|\*\*$/g, ""));
  }
  return texts.map(t => t.toLowerCase());
}

function isPlaced(text: string, placedLower: string[]): boolean {
  const lower = text.toLowerCase();
  return placedLower.some(p => p.includes(lower) || lower.includes(p));
}

export async function GET() {
  try {
    const placedLower = getPlacedTexts();
    const items: PendingItem[] = [];

    // Source 1: handoff.md open loops
    const handoff = readFile(HANDOFF_PATH);
    if (handoff) {
      let idx = 0;
      for (const line of handoff.split("\n")) {
        const t = line.trim();
        if (/^[-*]\s+/.test(t) && !t.includes("✅")) {
          const text = t.replace(/^[-*]\s+/, "");
          if (text && !isPlaced(text, placedLower)) {
            items.push({ id: `handoff-${idx}`, text, source: "handoff", sourceLabel: "Open Loop", project: null });
          }
          idx++;
        }
      }
    }

    // Source 2: marketing queue (not-started or draft)
    try {
      const mkt = JSON.parse(readFile(MARKETING_PATH));
      if (mkt?.queue) {
        for (const item of mkt.queue) {
          if (item.status === "not-started" || item.status === "draft") {
            if (!isPlaced(item.title, placedLower)) {
              items.push({ id: `marketing-${item.id}`, text: item.title, source: "marketing", sourceLabel: "Marketing", project: item.project ?? null });
            }
          }
        }
      }
    } catch { /* no marketing data */ }

    // Source 3: preflight brief lines starting with ⚠️
    const brief = readFile(BRIEF_PATH);
    if (brief) {
      let idx = 0;
      for (const line of brief.split("\n")) {
        const t = line.trim();
        if (t.startsWith("⚠️")) {
          const text = t.replace(/^⚠️\s*/, "");
          if (text && !isPlaced(text, placedLower)) {
            items.push({ id: `brief-${idx}`, text, source: "brief", sourceLabel: "Copilot Brief", project: null });
          }
          idx++;
        }
      }
    }

    return NextResponse.json({ items, count: items.length });
  } catch (e) {
    return NextResponse.json({ items: [], count: 0, error: String(e) });
  }
}
