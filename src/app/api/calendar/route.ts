import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CAL_PATH = path.join(process.cwd(), "data", "calendar.json");

interface CalendarEvent {
  id: string;
  title: string;
  owner: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  type: string;
  project: string | null;
  notes: string | null;
  recurring: string | null;
}

function readEvents(): CalendarEvent[] {
  try {
    return JSON.parse(fs.readFileSync(CAL_PATH, "utf-8"));
  } catch {
    return [];
  }
}

function writeEvents(events: CalendarEvent[]) {
  fs.writeFileSync(CAL_PATH, JSON.stringify(events, null, 2), "utf-8");
}

export async function GET(request: NextRequest) {
  const owner = request.nextUrl.searchParams.get("owner");
  let events = readEvents();
  if (owner) {
    events = events.filter((e) => e.owner === owner);
  }
  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const events = readEvents();
    const newEvent: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: body.title ?? "Untitled",
      owner: body.owner ?? "neil",
      date: body.date ?? new Date().toISOString().slice(0, 10),
      startTime: body.startTime ?? "09:00",
      endTime: body.endTime ?? "10:00",
      allDay: body.allDay ?? false,
      type: body.type ?? "event",
      project: body.project ?? null,
      notes: body.notes ?? null,
      recurring: body.recurring ?? null,
    };
    events.push(newEvent);
    writeEvents(events);
    return NextResponse.json(newEvent, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const events = readEvents();
    const idx = events.findIndex((e) => e.id === body.id);
    if (idx === -1) return NextResponse.json({ error: "not found" }, { status: 404 });
    events[idx] = { ...events[idx], ...body };
    writeEvents(events);
    return NextResponse.json(events[idx]);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const events = readEvents();
  const filtered = events.filter((e) => e.id !== id);
  if (filtered.length === events.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  writeEvents(filtered);
  return NextResponse.json({ deleted: id });
}
