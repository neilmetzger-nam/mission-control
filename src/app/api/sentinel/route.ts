import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const IS_CLOUD = process.env.NEXT_PUBLIC_IS_CLOUD === "true";
const SCAN_PATH = join(process.cwd(), "data/security-scan.json");

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
  if (IS_CLOUD) {
    return NextResponse.json({ error: "Sentinel scan not available in cloud mode" }, { status: 503 });
  }

  const key = req.headers.get("x-orion-key");
  if (key !== process.env.ORION_INTERNAL_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const HOME = process.env.HOME || "/root";
  const scriptPath = [HOME, ".openclaw", "workspace", "scripts", "sentinel.mjs"].join("/");

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { execFile } = require("child_process") as typeof import("child_process");

  return new Promise<Response>((resolve) => {
    execFile("node", [scriptPath], { timeout: 30000 }, (err: Error | null, stdout: string, stderr: string) => {
      if (err) {
        resolve(
          NextResponse.json(
            { error: "Scan failed", details: stderr || err.message },
            { status: 500 }
          )
        );
        return;
      }

      let result: Record<string, unknown> = { lastRun: null, score: null, findings: [] };
      if (existsSync(SCAN_PATH)) {
        result = JSON.parse(readFileSync(SCAN_PATH, "utf-8"));
      }

      resolve(NextResponse.json({ ok: true, output: stdout, ...result }));
    });
  });
}
