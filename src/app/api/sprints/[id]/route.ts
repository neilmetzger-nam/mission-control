import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const path = join(process.cwd(), "data/sprints", `${id}.json`);
  if (!existsSync(path)) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(JSON.parse(readFileSync(path, "utf-8")));
}
