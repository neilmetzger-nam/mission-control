import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const HOME = process.env.HOME ?? "/Users/neilmetzger";

// All directories to scan for .md files
const SCAN_PATHS = [
  { dir: `${HOME}/.openclaw/workspace/agency/projects/ai-r/docs`, project: "ai-r" },
  { dir: `${HOME}/.openclaw/workspace/agency/projects/ai-r/research`, project: "ai-r" },
  { dir: `${HOME}/.openclaw/workspace/agency/projects/ai-r/strategy`, project: "ai-r" },
  { dir: `${HOME}/.openclaw/workspace/agency/projects/ai-r/tasks`, project: "ai-r" },
  { dir: `${HOME}/.openclaw/workspace/agency/projects/ai-r/prompts`, project: "ai-r" },
  { dir: `${HOME}/Desktop/AIR-Web/prompts`, project: "ai-r" },
  { dir: `${HOME}/Desktop/AIR-Web/docs`, project: "ai-r" },
  { dir: `${HOME}/.openclaw/workspace/agency/projects/studio`, project: "studio" },
];

function inferType(filePath: string, dirPath: string): string {
  const dirName = path.basename(dirPath);
  const fileName = path.basename(filePath, ".md").toLowerCase();
  if (dirName === "research") return "research";
  if (dirName === "strategy") return "strategy";
  if (dirName === "tasks") return "task";
  if (dirName === "prompts") return "prompt";
  if (fileName.includes("brief") || fileName.includes("obie")) return "brief";
  if (fileName.includes("arch") || fileName.includes("mcp")) return "architecture";
  if (fileName.includes("spec") || fileName.includes("delta") || fileName.includes("schema")) return "spec";
  return "doc";
}

function inferTitle(filePath: string): string {
  return path
    .basename(filePath, ".md")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export interface DocEntry {
  path: string;
  title: string;
  project: string;
  type: string;
  tags: string[];
  status: string;
  audience: string;
  created: string;
  summary?: string;
  hasFrontmatter: boolean;
  dir: string;
  filename: string;
}

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";

export async function GET() {
  if (IS_CLOUD) return NextResponse.json([]);

  const docs: DocEntry[] = [];

  for (const { dir, project } of SCAN_PATHS) {
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(dir, file);
      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const { data, content } = matter(raw);

        const hasFrontmatter = Object.keys(data).length > 0;

        // Extract first non-empty line as summary fallback
        const firstLine = content
          .split("\n")
          .map((l) => l.replace(/^#+\s*/, "").trim())
          .find((l) => l.length > 20 && !l.startsWith("---"));

        docs.push({
          path: filePath,
          title: data.title ?? inferTitle(filePath),
          project: data.project ?? project,
          type: data.type ?? inferType(filePath, dir),
          tags: data.tags ?? [],
          status: data.status ?? "draft",
          audience: data.audience ?? "all",
          created: data.created ? String(data.created).substring(0, 10) : "",
          summary: data.summary ?? firstLine?.substring(0, 120),
          hasFrontmatter,
          dir: path.relative(HOME, dir),
          filename: file,
        });
      } catch {
        // Skip unreadable files
      }
    }
  }

  // Sort: frontmatted first, then by created desc, then alphabetical
  docs.sort((a, b) => {
    if (a.hasFrontmatter !== b.hasFrontmatter) return a.hasFrontmatter ? -1 : 1;
    if (a.created && b.created) return b.created.localeCompare(a.created);
    return a.title.localeCompare(b.title);
  });

  return NextResponse.json(docs);
}
