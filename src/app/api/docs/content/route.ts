import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const HOME = process.env.HOME ?? "/Users/neilmetzger";

// Security: only allow reads from known workspace roots
const ALLOWED_ROOTS = [
  path.join(HOME, ".openclaw", "workspace"),
  path.join(HOME, "Desktop", "AIR-Web"),
  path.join(HOME, "Desktop", "mission-control"),
];

function isAllowed(filePath: string): boolean {
  const resolved = path.resolve(filePath);
  return ALLOWED_ROOTS.some((root) => resolved.startsWith(root)) && resolved.endsWith(".md");
}

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";

export async function GET(req: NextRequest) {
  if (IS_CLOUD) return NextResponse.json({ content: "", _cloud: true });

  const filePath = req.nextUrl.searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Missing path param" }, { status: 400 });
  }

  if (!isAllowed(filePath)) {
    return NextResponse.json({ error: "Path not allowed" }, { status: 403 });
  }

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json({ content, path: filePath, filename: path.basename(filePath) });
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
