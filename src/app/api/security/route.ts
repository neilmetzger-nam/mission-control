import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const PATH = join(process.cwd(), "data/security.json");

export async function GET() {
  return NextResponse.json(JSON.parse(readFileSync(PATH, "utf-8")));
}

export async function PATCH(req: Request) {
  const { id, status, notes } = await req.json();
  const data = JSON.parse(readFileSync(PATH, "utf-8"));
  data.checks = data.checks.map((c: {id:string}) => c.id === id ? { ...c, status, ...(notes ? { notes } : {}) } : c);
  data.lastUpdated = new Date().toISOString().slice(0, 10);
  writeFileSync(PATH, JSON.stringify(data, null, 2));
  return NextResponse.json({ ok: true });
}
