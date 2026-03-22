import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "projects", "ai-r-config.json");

export async function GET() {
  try {
    const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ env: [], services: [], security: [] });
  }
}
