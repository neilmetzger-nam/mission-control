import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";
const WORKSPACE = process.env.HOME
  ? path.join(process.env.HOME, ".openclaw", "workspace")
  : "/Users/neilmetzger/.openclaw/workspace";

export interface MemoryFile {
  filename: string;
  path: string;
  content: string;
  modified: string;
}

export async function GET() {
  if (IS_CLOUD) {
    return NextResponse.json({ longTermMemory: "", files: [], _cloud: true });
  }

  const memoryDir = path.join(WORKSPACE, "memory");
  const memoryMdPath = path.join(WORKSPACE, "MEMORY.md");

  let longTermMemory = "";
  try {
    longTermMemory = fs.readFileSync(memoryMdPath, "utf-8");
  } catch {
    // MEMORY.md may not exist
  }

  let files: MemoryFile[] = [];
  try {
    const entries = fs.readdirSync(memoryDir).filter((f) => f.endsWith(".md"));
    files = entries
      .map((filename) => {
        const filePath = path.join(memoryDir, filename);
        const stat = fs.statSync(filePath);
        const content = fs.readFileSync(filePath, "utf-8");
        return {
          filename,
          path: filePath,
          content,
          modified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));
  } catch {
    // memory dir may not exist
  }

  return NextResponse.json({ longTermMemory, files });
}
