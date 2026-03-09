import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execFile } from "child_process";

const SCAN_PATH = join(process.cwd(), "data/security-scan.json");
const SCRIPT_PATH = join(
  process.env.HOME || "/Users/neilmetzger",
  ".openclaw/workspace/scripts/sentinel.mjs"
);

export async function GET() {
  if (!existsSync(SCAN_PATH)) {
    return NextResponse.json(
      { lastRun: null, score: null, findings: [] },
      { status: 200 }
    );
  }
  return NextResponse.json(JSON.parse(readFileSync(SCAN_PATH, "utf-8")));
}

export async function POST(req: Request) {
  const key = req.headers.get("x-orion-key");
  if (key !== process.env.ORION_INTERNAL_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return new Promise<Response>((resolve) => {
    execFile("node", [SCRIPT_PATH], { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        resolve(
          NextResponse.json(
            { error: "Scan failed", details: stderr || err.message },
            { status: 500 }
          )
        );
        return;
      }

      let result = { lastRun: null, score: null, findings: [] };
      if (existsSync(SCAN_PATH)) {
        result = JSON.parse(readFileSync(SCAN_PATH, "utf-8"));
      }

      resolve(NextResponse.json({ ok: true, output: stdout, ...result }));
    });
  });
}
