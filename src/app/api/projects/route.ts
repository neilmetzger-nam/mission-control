import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "projects.json");

export async function GET() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const projects = JSON.parse(raw);
  return NextResponse.json(projects);
}
