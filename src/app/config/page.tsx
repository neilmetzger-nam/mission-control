"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Puzzle, Settings } from "lucide-react";

interface EnvStatus {
  key: string;
  set: boolean;
}

interface SkillEntry {
  name: string;
}

export default function ConfigPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [skills, setSkills] = useState<SkillEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => {
        setEnvStatus(data.envStatus ?? []);
        setSkills(data.skills ?? []);
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

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Configuration</h1>
        <p className="text-zinc-500 text-sm">Environment variables and installed skills</p>
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
