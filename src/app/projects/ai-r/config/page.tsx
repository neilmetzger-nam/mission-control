"use client";

import { useEffect, useState } from "react";

interface EnvVar {
  key: string;
  env: string;
  status: string;
  notes: string;
}

export default function AirConfigPage() {
  const [envVars, setEnvVars] = useState<EnvVar[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/projects/ai-r/config")
      .then(r => r.json())
      .then(d => {
        setEnvVars(d.env ?? []);
        setUpdatedAt(d.updatedAt ?? "");
      })
      .catch(() => {});
  }, []);

  const missingCount = envVars.filter(v => v.status === "missing").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Config</h1>
        <p className="text-zinc-500 text-sm">Environment variables and service keys{updatedAt ? ` · Updated ${updatedAt}` : ""}</p>
      </div>

      {missingCount > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-amber-400">⚠️ {missingCount} env var{missingCount !== 1 ? "s" : ""} missing — deployment may fail</p>
        </div>
      )}

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="divide-y divide-zinc-800">
          {envVars.map(v => (
            <div key={v.key} className="flex items-center gap-3 px-4 py-3">
              <span className="text-sm font-mono text-zinc-300 min-w-0 flex-1">{v.key}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                v.status === "set"
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/15 text-red-400 border-red-500/20"
              }`}>
                {v.status}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-500 shrink-0">{v.env}</span>
              {v.notes && <span className="text-xs text-zinc-500 shrink-0 max-w-[200px] truncate">{v.notes}</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
