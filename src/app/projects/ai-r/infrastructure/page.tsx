"use client";

import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  status: string;
  url: string;
  notes: string;
}

const STATUS_DOT: Record<string, string> = {
  live: "bg-emerald-500",
  partial: "bg-amber-500",
  down: "bg-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  live: "Live",
  partial: "Partial",
  down: "Down",
};

export default function AirInfrastructurePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");

  useEffect(() => {
    fetch("/api/projects/ai-r/config")
      .then(r => r.json())
      .then(d => {
        setServices(d.services ?? []);
        setUpdatedAt(d.updatedAt ?? "");
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Infrastructure</h1>
        <p className="text-zinc-500 text-sm">Services, deployments, and connections{updatedAt ? ` · Updated ${updatedAt}` : ""}</p>
      </div>

      <div className="mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          {services.map(svc => (
            <div key={svc.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${STATUS_DOT[svc.status] ?? "bg-zinc-600"}`} />
                <div className="min-w-0">
                  <span className="text-sm text-zinc-300 font-medium">{svc.name}</span>
                  {svc.notes && <p className="text-xs text-zinc-500 truncate">{svc.notes}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-zinc-500">{STATUS_LABEL[svc.status] ?? svc.status}</span>
                {svc.url && (
                  <a href={svc.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">↗</a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium mb-2">Deployment</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Branch</span>
              <span className="text-xs text-zinc-400 font-mono">neil</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Platform</span>
              <span className="text-xs text-zinc-400">Vercel</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-300">Auto-deploy</span>
              <span className="text-xs text-emerald-400">on push</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
