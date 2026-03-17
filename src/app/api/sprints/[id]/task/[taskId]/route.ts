import { NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const VALID_STATUSES = [
  "queued", "in-progress", "done", "blocked",
  "agent-working", "needs-review",
  "ready_for_staging", "in_staging", "in_prod",
];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; taskId: string }> }) {
  const { id, taskId } = await params;
  const body = await req.json();

  // Validate status if provided
  if (body.status && !VALID_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: `Invalid status: ${body.status}` }, { status: 400 });
  }

  const filePath = join(process.cwd(), "data/sprints", `${id}.json`);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  // Allowed fields: status, migration_notes, assignee, title, claudePrompt, notes, completedAt
  const allowedFields = ["status", "migration_notes", "assignee", "title", "claudePrompt", "notes", "completedAt"];
  const updates: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  data.milestones.forEach((m: any) =>
    m.sprints.forEach((s: any) =>
      s.tasks.forEach((t: any) => {
        if (t.id === taskId) Object.assign(t, updates);
      })
    )
  );

  data.updatedAt = new Date().toISOString().split("T")[0];
  writeFileSync(filePath, JSON.stringify(data, null, 2));
  return NextResponse.json({ ok: true });
}
