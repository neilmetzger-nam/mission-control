"use client";

import { useEffect, useState } from "react";

interface EnvVar { key: string; group: string; status: string; notes: string; }
interface Service { id: string; name: string; status: string; url: string; notes: string; }
interface SecurityItem { id: string; area: string; severity: string; status: string; notes: string; }

interface ConfigData {
  updatedAt: string;
  stack: Record<string, string>;
  env: EnvVar[];
  services: Service[];
  security: SecurityItem[];
}

const STACK_EMOJI: Record<string, string> = {
  framework: "🧱", ui: "🎨", auth: "🔐", db: "🗄️", hosting: "☁️", state: "🔄",
  payments: "💳", ai: "🤖", voice: "🎙️", sms: "📱", storage: "📦", mcp: "⚡",
};

const SVC_DOT: Record<string, string> = { live: "bg-emerald-500", warning: "bg-amber-500", down: "bg-red-500" };
const ENV_BADGE: Record<string, string> = {
  set: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  warning: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  missing: "bg-red-500/15 text-red-400 border-red-500/20",
};
const SEV_BADGE: Record<string, string> = {
  high: "bg-red-500/15 text-red-400 border-red-500/20",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  low: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
};
const SEC_BADGE: Record<string, string> = {
  open: "bg-red-500/15 text-red-400 border-red-500/20",
  known: "bg-zinc-500/15 text-zinc-400 border-zinc-500/20",
  resolved: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
};

function CollapseSection({ label, badge, defaultOpen = true, children }: {
  label: string; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{label}</span>
          {badge}
        </div>
        <span className="text-zinc-600 text-xs">{open ? "▲" : "▼"}</span>
      </button>
      {open && children}
    </div>
  );
}

export default function AirConfigPage() {
  const [data, setData] = useState<ConfigData | null>(null);

  useEffect(() => {
    fetch("/api/projects/ai-r/config")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  if (!data) return (
    <div className="flex items-center justify-center py-16">
      <p className="text-zinc-500 text-sm">Loading...</p>
    </div>
  );

  const svcWarnings = data.services.filter(s => s.status === "warning" || s.status === "down").length;
  const envAttention = data.env.filter(v => v.status === "missing" || v.status === "warning").length;
  const totalAttention = svcWarnings + envAttention;

  const svcLive = data.services.filter(s => s.status === "live").length;
  const svcWarn = data.services.filter(s => s.status === "warning").length;
  const sortedServices = [...data.services].sort((a, b) => {
    const order: Record<string, number> = { live: 0, warning: 1, down: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });

  const envGroups = new Map<string, EnvVar[]>();
  for (const v of data.env) {
    const arr = envGroups.get(v.group) ?? [];
    arr.push(v);
    envGroups.set(v.group, arr);
  }

  const secOpen = data.security.filter(i => i.status === "open").length;
  const secKnown = data.security.filter(i => i.status === "known").length;
  const secResolved = data.security.filter(i => i.status === "resolved").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Config</h1>
        <p className="text-zinc-500 text-sm">Full stack reference{data.updatedAt ? ` · Updated ${data.updatedAt}` : ""}</p>
      </div>

      {totalAttention > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-amber-400">⚠️ {totalAttention} item{totalAttention !== 1 ? "s" : ""} need attention</p>
        </div>
      )}

      <div className="space-y-6">

        {/* Section 1 — Tech Stack */}
        {data.stack && (
          <div>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Tech Stack</p>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(data.stack).map(([key, value]) => (
                <div key={key} className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{STACK_EMOJI[key] ?? "📦"} {key}</p>
                  <p className="text-sm text-zinc-200 font-medium">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 2 — Services */}
        <CollapseSection label="Services"
          badge={<span className="text-[10px] text-zinc-500">{svcLive} live{svcWarn > 0 ? ` · ${svcWarn} needs attention` : ""}</span>}>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
            {sortedServices.map(svc => (
              <div key={svc.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${SVC_DOT[svc.status] ?? "bg-zinc-600"}`} />
                  <div className="min-w-0">
                    <span className="text-sm text-zinc-300 font-medium">{svc.name}</span>
                    {svc.notes && <p className="text-xs text-zinc-500 truncate">{svc.notes}</p>}
                  </div>
                </div>
                {svc.url && (
                  <a href={svc.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors shrink-0 ml-3">↗</a>
                )}
              </div>
            ))}
          </div>
        </CollapseSection>

        {/* Section 3 — Environment Variables */}
        <CollapseSection label="Environment Variables" defaultOpen={false}
          badge={envAttention > 0
            ? <span className="text-[10px] text-amber-400">{envAttention} need attention</span>
            : <span className="text-[10px] text-zinc-600">{data.env.length} vars</span>}>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            {[...envGroups.entries()].map(([group, vars]) => (
              <div key={group}>
                <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/80">
                  <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{group}</span>
                </div>
                <div className="divide-y divide-zinc-800/50">
                  {vars.map(v => (
                    <div key={v.key} className="flex items-center gap-3 px-4 py-2.5">
                      <span className="text-xs font-mono text-zinc-300 min-w-0 flex-1">{v.key}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${ENV_BADGE[v.status] ?? ENV_BADGE.set}`}>
                        {v.status}
                      </span>
                      {v.notes && <span className="text-[10px] text-zinc-500 shrink-0 max-w-[220px] truncate">{v.notes}</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CollapseSection>

        {/* Section 4 — Security */}
        <CollapseSection label="Security"
          badge={<span className="text-[10px] text-zinc-500">{secOpen} open · {secKnown} known · {secResolved} resolved</span>}>
          <div className="space-y-2">
            {data.security.map(item => (
              <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEV_BADGE[item.severity] ?? SEV_BADGE.low}`}>
                    {item.severity}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${SEC_BADGE[item.status] ?? SEC_BADGE.known}`}>
                    {item.status}
                  </span>
                  <span className={`text-sm font-medium flex-1 ${item.status === "resolved" ? "line-through text-zinc-600" : "text-zinc-200"}`}>
                    {item.area}
                  </span>
                </div>
                {item.notes && <p className="text-xs text-zinc-500 leading-relaxed">{item.notes}</p>}
              </div>
            ))}
          </div>
        </CollapseSection>

      </div>
    </>
  );
}
