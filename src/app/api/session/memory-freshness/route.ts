import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_DIR = path.join(
  process.env.HOME ?? "/Users/neilmetzger",
  ".openclaw",
  "workspace",
  "memory",
  "projects",
);

export async function GET() {
  try {
    if (!fs.existsSync(MEMORY_DIR)) {
      return NextResponse.json({ oldestAgeHours: null, oldestFile: null, status: "red" });
    }

    const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith(".md"));
    if (files.length === 0) {
      return NextResponse.json({ oldestAgeHours: null, oldestFile: null, status: "red" });
    }

    let oldestMtime = Infinity;
    let oldestFile = "";

    for (const file of files) {
      const stat = fs.statSync(path.join(MEMORY_DIR, file));
      if (stat.mtimeMs < oldestMtime) {
        oldestMtime = stat.mtimeMs;
        oldestFile = file;
      }
    }

    const ageHours = Math.round((Date.now() - oldestMtime) / 3600000);

    let status: string;
    if (ageHours < 24) status = "green";
    else if (ageHours < 72) status = "amber";
    else status = "red";

    return NextResponse.json({ oldestAgeHours: ageHours, oldestFile, status });
  } catch (e) {
    return NextResponse.json({ oldestAgeHours: null, oldestFile: null, status: "red", error: String(e) });
  }
}
