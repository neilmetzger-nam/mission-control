import { NextResponse } from "next/server";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join } from "path";

const WORKSPACE = "/Users/neilmetzger/.openclaw/workspace";
const IGNORE = ["node_modules", ".git", ".next", "avatars", "__pycache__", "docs"];

function tree(dir: string, depth = 0): object[] {
  if (depth > 4) return [];
  try {
    const entries = readdirSync(dir);
    return entries
      .filter(e => !IGNORE.includes(e) && !e.startsWith("."))
      .map(e => {
        const full = join(dir, e);
        const stat = statSync(full);
        if (stat.isDirectory()) {
          return { name: e, type: "dir", path: full.replace(WORKSPACE + "/", ""), children: tree(full, depth + 1) };
        }
        return { name: e, type: "file", path: full.replace(WORKSPACE + "/", ""), size: stat.size };
      });
  } catch { return []; }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filePath = searchParams.get("path");
  if (filePath) {
    const full = join(WORKSPACE, filePath);
    if (!full.startsWith(WORKSPACE)) return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (!existsSync(full)) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ content: readFileSync(full, "utf-8"), path: filePath });
  }
  return NextResponse.json({ tree: tree(WORKSPACE) });
}
