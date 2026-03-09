import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "review-queue.json");

export async function GET() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const items = JSON.parse(raw);
  return NextResponse.json(items);
}
