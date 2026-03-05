"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Globe, Server } from "lucide-react";

// ─── Ping ───────────────────────────────────────────────
type PingStatus = "loading" | "up" | "down";

function usePing(url: string): PingStatus {
  const [status, setStatus] = useState<PingStatus>("loading");
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);

  useEffect(() => {
    if (!mounted) return;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch(url, { mode: "no-cors", signal: controller.signal })
      .then(() => setStatus("up"))
      .catch(() => setStatus("down"))
      .finally(() => clearTimeout(timeout));

    return () => { controller.abort(); clearTimeout(timeout); };
  }, [url, mounted]);

  return mounted ? status : "loading";
}

function StatusDot({ status }: { status: PingStatus }) {
  if (status === "loading") {
    return <span className="w-2 h-2 rounded-full bg-zinc-600 animate-pulse shrink-0" />;
  }
  return (
    <span className={`w-2 h-2 rounded-full shrink-0 ${status === "up" ? "bg-green-500" : "bg-red-500"}`} />
  );
}

function SectionHeader({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-zinc-500" />
      <h2 className="text-sm font-semibold text-zinc-300">{label}</h2>
    </div>
  );
}

// ─── Data ───────────────────────────────────────────────
const ENVIRONMENTS = [
  { label: "Local Dev", url: "http://localhost:3001" },
  { label: "Production", url: "https://ai-promptstudio.net" },
];

const ENGINES = [
  { agent: "Rex", emoji: "🎬", engine: "Kling", status: "Active" },
  { agent: "Mira", emoji: "🎥", engine: "Hailuo", status: "Active" },
  { agent: "Sage", emoji: "🖼️", engine: "Seedream", status: "Active" },
  { agent: "Echo", emoji: "🌊", engine: "Seedance", status: "Active" },
  { agent: "Nova", emoji: "🔊", engine: "Veo", status: "Active" },
  { agent: "Zip", emoji: "⚡", engine: "Nano", status: "Active" },
];

// ─── Sub-component ──────────────────────────────────────
function EnvRow({ label, url }: { label: string; url: string }) {
  const status = usePing(url);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50 last:border-0">
      <div>
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-xs text-zinc-600 font-mono ml-2">{url}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <StatusDot status={status} />
        <span className="text-xs text-zinc-500">
          {status === "loading" ? "checking..." : status}
        </span>
      </div>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────────
export default function StudioSettingsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Studio Settings</h1>
        <p className="text-zinc-500 text-sm">Environments, infrastructure, and engine roster</p>
      </div>

      {/* Environments */}
      <div className="mb-6">
        <SectionHeader icon={Globe} label="Environments" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          {ENVIRONMENTS.map((env) => (
            <EnvRow key={env.label} {...env} />
          ))}
        </div>
      </div>

      {/* Infrastructure */}
      <div className="mb-6">
        <SectionHeader icon={Server} label="Infrastructure" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">OpenArt Worker</span>
            <span className="text-xs text-zinc-400 font-mono">pnpm run worker</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">Source</span>
            <span className="text-xs text-zinc-400 font-mono">~/Desktop/BuilderIO/</span>
          </div>
        </div>
      </div>

      {/* Engine Roster */}
      <div>
        <SectionHeader icon={Server} label="Engine Roster" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Agent</th>
                <th className="text-left px-4 py-2 font-medium">Engine</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ENGINES.map((row) => (
                <tr key={row.agent} className="border-b border-zinc-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span>{row.emoji}</span>
                      <span className="text-zinc-200 font-medium">{row.agent}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{row.engine}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full border bg-green-500/20 text-green-400 border-green-500/30">
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
