import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ENV_KEYS = [
  { key: "ORION_INTERNAL_KEY", label: "Orion Internal Key", required: true },
  { key: "VERCEL_TOKEN", label: "Vercel Token", required: true },
  { key: "VERCEL_PROJECT_ID", label: "Vercel Project ID (AIR-Web)", required: true },
];

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";
const SKILLS_DIR = "/Users/neilmetzger/.nvm/versions/node/v22.21.1/lib/node_modules/openclaw/skills/";

export interface EnvStatus {
  key: string;
  set: boolean;
}

export interface SkillEntry {
  name: string;
}

export async function GET() {
  const envStatus: EnvStatus[] = ENV_KEYS.map(({ key, label, required }) => ({
    key: label,
    set: !!process.env[key],
    required,
  }));

  let skills: SkillEntry[] = [];
  if (IS_CLOUD) return NextResponse.json({ envStatus, skills, _cloud: true });
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
