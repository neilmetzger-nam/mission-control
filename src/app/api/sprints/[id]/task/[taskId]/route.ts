import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const body = await req.json();
  const path = join(process.cwd(), "data/sprints", `${id}.json`);
  const data = JSON.parse(readFileSync(path, "utf-8"));

  data.milestones.forEach((m: any) =>
    m.sprints.forEach((s: any) =>
      s.tasks.forEach((t: any) => {
        if (t.id === taskId) Object.assign(t, body);
      })
    )
  );

  writeFileSync(path, JSON.stringify(data, null, 2));
  return NextResponse.json({ ok: true });
}
