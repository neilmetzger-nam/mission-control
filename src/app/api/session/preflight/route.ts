import { NextResponse } from "next/server";

export async function POST() {
  const url = process.env.OPENCLAW_WEBHOOK_URL;
  if (!url) {
    return NextResponse.json(
      { error: "OPENCLAW_WEBHOOK_URL not configured" },
      { status: 500 },
    );
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "✈️ Pre-flight checklist — read all project memory, sprint files, and planner. Send the Morning Brief now.",
      }),
    });

    return NextResponse.json({ ok: true, triggeredAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
