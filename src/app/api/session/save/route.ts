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
        message: "🛬 Landing checklist — save all project memory now",
      }),
    });

    return NextResponse.json({ ok: true, triggeredAt: new Date().toISOString() });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 502 });
  }
}
