import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "review-queue.json");

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const items = JSON.parse(raw);

  const item = items.find((i: { id: string }) => i.id === id);
  if (!item) {
    return NextResponse.json({ error: "Review item not found" }, { status: 404 });
  }

  item.status = status;
  fs.writeFileSync(DATA_PATH, JSON.stringify(items, null, 2));

  return NextResponse.json(item);
}
