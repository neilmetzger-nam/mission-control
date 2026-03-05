import { NextResponse } from "next/server";

const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;

const EXPECTED_KEYS = [
  { key: "STRIPE_SECRET_KEY", label: "Stripe", category: "payments" },
  { key: "STRIPE_TERMINAL_LOCATION_ID", label: "Stripe Terminal Location", category: "payments" },
  { key: "SQUARE_ACCESS_TOKEN", label: "Square", category: "payments" },
  { key: "SQUARE_LOCATION_ID", label: "Square Location", category: "payments" },
  { key: "GOOGLE_API_KEY", label: "Google APIs (Places/Business/Ads)", category: "google" },
  { key: "GEMINI_API_KEY", label: "Gemini AI", category: "google" },
  { key: "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", label: "Clerk Auth", category: "auth" },
  { key: "CLERK_SECRET_KEY", label: "Clerk Secret", category: "auth" },
  { key: "ANTHROPIC_API_KEY", label: "Anthropic (Claude)", category: "ai" },
  { key: "OPENAI_API_KEY", label: "OpenAI", category: "ai" },
  { key: "NEXT_PUBLIC_ELEVENLABS_AGENT_ID", label: "ElevenLabs", category: "ai" },
  { key: "PI_BOX_URL", label: "Pi Print Server", category: "infra" },
  { key: "PLAID_CLIENT_ID", label: "Plaid", category: "fintech" },
];

export interface VercelEnvEntry {
  key: string;
  label: string;
  category: string;
  exists: boolean;
  environments: string[];
}

export async function GET() {
  if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
    return NextResponse.json({
      configured: false,
      entries: [],
      error: "VERCEL_TOKEN or VERCEL_PROJECT_ID not set",
    });
  }

  try {
    const res = await fetch(
      `https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/env`,
      {
        headers: { Authorization: `Bearer ${VERCEL_TOKEN}` },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        entries: [],
        error: `Vercel API returned ${res.status}`,
      });
    }

    const data = await res.json();
    const envVars: Array<{ key: string; target?: string[] }> = data.envs ?? [];

    // Build a map of key → environments it exists in
    const keyMap = new Map<string, string[]>();
    for (const env of envVars) {
      keyMap.set(env.key, env.target ?? []);
    }

    const entries: VercelEnvEntry[] = EXPECTED_KEYS.map((expected) => {
      const environments = keyMap.get(expected.key) ?? [];
      return {
        key: expected.key,
        label: expected.label,
        category: expected.category,
        exists: keyMap.has(expected.key),
        environments,
      };
    });

    return NextResponse.json({ configured: true, entries, error: null });
  } catch (err) {
    return NextResponse.json({
      configured: true,
      entries: [],
      error: `Failed to fetch: ${err instanceof Error ? err.message : "unknown"}`,
    });
  }
}
