import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const data = JSON.parse(readFileSync(join(process.cwd(), "data/infrastructure.json"), "utf-8"));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ services: [], databases: [], gcp: {}, devices: [] });
  }
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const path = join(process.cwd(), "data/infrastructure.json");
  const data = JSON.parse(readFileSync(path, "utf-8"));
  // Merge top-level keys
  const updated = { ...data, ...body };
  require("fs").writeFileSync(path, JSON.stringify(updated, null, 2));
  return NextResponse.json({ ok: true });
}
