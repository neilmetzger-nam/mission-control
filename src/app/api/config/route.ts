import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENV_KEYS = [
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "CLERK_SECRET_KEY",
  "SQUARE_ACCESS_TOKEN",
  "STRIPE_SECRET_KEY",
  "ELEVENLABS_API_KEY",
  "NEON_DATABASE_URL",
  "BRAVE_API_KEY",
];

const SKILLS_DIR = "/Users/neilmetzger/.nvm/versions/node/v22.21.1/lib/node_modules/openclaw/skills/";

export interface EnvStatus {
  key: string;
  set: boolean;
}

export interface SkillEntry {
  name: string;
}

export async function GET() {
  const envStatus: EnvStatus[] = ENV_KEYS.map((key) => ({
    key,
    set: !!process.env[key],
  }));

  let skills: SkillEntry[] = [];
  try {
    const entries = fs.readdirSync(SKILLS_DIR);
    skills = entries
      .filter((e) => {
        const stat = fs.statSync(path.join(SKILLS_DIR, e));
        return stat.isDirectory();
      })
      .map((name) => ({ name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    // skills dir may not exist
  }

  return NextResponse.json({ envStatus, skills });
}
