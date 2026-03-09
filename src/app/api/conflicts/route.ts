import { NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const PATH = join(process.cwd(), "data/conflicts.json");

export async function GET() {
  if (!existsSync(PATH)) return NextResponse.json([]);
  try { return NextResponse.json(JSON.parse(readFileSync(PATH, "utf-8"))); }
  catch { return NextResponse.json([]); }
}

export async function PATCH(req: Request) {
  const { id, resolution } = await req.json();
  if (!existsSync(PATH)) return NextResponse.json({ error: "no conflicts file" }, { status: 404 });
  const conflicts = JSON.parse(readFileSync(PATH, "utf-8"));
  const updated = conflicts.map((c: {id:string;status:string;resolution:string|null}) =>
    c.id === id ? { ...c, status: "resolved", resolution } : c
  );
  writeFileSync(PATH, JSON.stringify(updated, null, 2));
  return NextResponse.json({ ok: true });
}
