"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Puzzle, Settings, Shield, AlertTriangle, Info } from "lucide-react";

interface EnvStatus {
  key: string;
  set: boolean;
}

interface SkillEntry {
  name: string;
}

interface CriticalFile {
  path: string;
  label: string;
  exists: boolean;
  lastModified: string | null;
  sizeKb: number | null;
}

export default function ConfigPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [criticalFiles, setCriticalFiles] = useState<CriticalFile[]>([]);
  const [vercelConfigured, setVercelConfigured] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/config").then((r) => r.json()),
      fetch("/api/config/critical-files").then((r) => r.json()),
      fetch("/api/vercel/env-status").then((r) => r.json()),
    ])
      .then(([configData, cfData, vercelData]) => {
        setEnvStatus(configData.envStatus ?? []);
        setSkills(configData.skills ?? []);
        setCriticalFiles(cfData.files ?? []);
        setVercelConfigured(vercelData.configured ?? false);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Configuration</h1>
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </>
    );
  }

  const missingFiles = criticalFiles.filter((f) => !f.exists);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Configuration</h1>
        <p className="text-zinc-500 text-sm">Environment variables, critical files, and installed skills</p>
      </div>

      {/* Missing file warning banner */}
      {missingFiles.length > 0 && (
        <div className="mb-6 space-y-2">
          {missingFiles.map((f) => (
            <div key={f.path} className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span className="text-sm text-red-400">
                Critical file missing: <span className="font-mono text-xs">{f.path}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Vercel setup instructions */}
      {vercelConfigured === false && (
        <div className="mb-6 flex items-start gap-2 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-zinc-400">
            <span className="text-blue-400 font-medium">Live API status not configured.</span>{" "}
            To enable: create a Vercel token at{" "}
            <span className="text-zinc-300">vercel.com/account/tokens</span>{" "}
            and add <span className="font-mono text-xs text-zinc-300">VERCEL_TOKEN</span> +{" "}
            <span className="font-mono text-xs text-zinc-300">VERCEL_PROJECT_ID</span> to{" "}
            <span className="font-mono text-xs text-zinc-300">.env.local</span>
          </div>
        </div>
      )}

      {/* Critical Files */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-300">
            Critical Files
            <span className="text-zinc-600 font-normal ml-2">
              ({criticalFiles.filter((f) => f.exists).length}/{criticalFiles.length} present)
            </span>
          </h2>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium w-6"></th>
                <th className="text-left px-4 py-2 font-medium">Path</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Contains</th>
                <th className="text-left px-4 py-2 font-medium hidden md:table-cell">Modified</th>
              </tr>
            </thead>
            <tbody>
              {criticalFiles.map((f) => (
                <tr key={f.path} className={`border-b border-zinc-800/50 ${!f.exists ? "bg-red-500/5" : ""}`}>
                  <td className="px-4 py-3">
                    <span className={`w-2 h-2 rounded-full inline-block ${f.exists ? "bg-green-500" : "bg-red-500"}`} />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-zinc-300">{f.path}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell">{f.label}</td>
                  <td className="px-4 py-3 text-xs text-zinc-500 hidden md:table-cell">
                    {f.lastModified
                      ? new Date(f.lastModified).toLocaleDateString()
                      : "—"}
                    {f.sizeKb !== null && (
                      <span className="text-zinc-600 ml-2">{f.sizeKb} KB</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Env Vars */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-300">Environment Variables</h2>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {envStatus.map((env) => (
            <div key={env.key} className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-sm text-zinc-300">{env.key}</span>
              {env.set ? (
                <div className="flex items-center gap-1.5 text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="text-xs">Set</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs">Missing</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Installed Skills */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Puzzle className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-300">
            Installed Skills
            <span className="text-zinc-600 font-normal ml-2">({skills.length})</span>
          </h2>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill.name}
                className="text-xs bg-zinc-800 border border-zinc-700 text-zinc-300 px-2.5 py-1 rounded-lg font-mono"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
