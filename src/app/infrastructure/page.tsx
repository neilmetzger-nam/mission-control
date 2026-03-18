"use client";

import { useState, useEffect } from "react";
import { ExternalLink, Server, Database, Cpu, Monitor, RefreshCw, Table2, AlertTriangle } from "lucide-react";

interface Service {
  id: string; name: string; project: string; description: string;
  type: string; platform: string; url: string; repo: string;
  status: string; lastDeployed: string; stack: string[];
}
interface DbRecord {
  id: string; name: string; project: string; provider: string;
  plan?: string; endpoint?: string; host?: string; status: string; usedBy?: string[];
}
interface GcpConfig {
  projectId: string; projectName: string; region: string; registry: string; services: string[];
}
interface Device {
  id: string; name: string; role: string;
  tailscaleIp?: string; tailscaleHost?: string; localIp?: string; services?: string[];
}
interface InfraData { services: Service[]; databases: DbRecord[]; gcp: GcpConfig; devices: Device[]; }

const platformColors: Record<string, string> = {
  vercel: "bg-white/10 text-white border-white/20",
  cloudrun: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  local: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};
const platformLabels: Record<string, string> = {
  vercel: "▲ Vercel", cloudrun: "☁ Cloud Run", local: "🖥 Local",
};
const statusColors: Record<string, string> = {
  live: "bg-green-500/20 text-green-400 border-green-500/30",
  down: "bg-red-500/20 text-red-400 border-red-500/30",
  active: "bg-green-500/20 text-green-400 border-green-500/30",
};

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full border ${color}`}>{label}</span>;
}

export default function InfrastructurePage() {
  const [data, setData] = useState<InfraData | null>(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/infrastructure").then(r => r.json()).then(setData).catch(console.error);
  }, []);

  if (!data) return <div className="p-6"><h1 className="text-2xl font-bold mb-1">Infrastructure</h1><p className="text-zinc-500 text-sm">Loading...</p></div>;

  const projects = ["all", ...Array.from(new Set(data.services.map(s => s.project)))];
  const filtered = filter === "all" ? data.services : data.services.filter(s => s.project === filter);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Infrastructure</h1>
        <p className="text-zinc-500 text-sm">Every service, database, and device — one place.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Services", value: data.services.length, icon: Server },
          { label: "Live", value: data.services.filter(s => s.status === "live").length, icon: RefreshCw },
          { label: "Databases", value: data.databases.length, icon: Database },
          { label: "Devices", value: data.devices.length, icon: Monitor },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
            <Icon className="w-4 h-4 text-zinc-500" />
            <div><div className="text-xl font-bold">{value}</div><div className="text-xs text-zinc-500">{label}</div></div>
          </div>
        ))}
      </div>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2"><Server className="w-4 h-4 text-zinc-400" /> Services</h2>
          <div className="flex gap-2 flex-wrap">
            {projects.map(p => (
              <button key={p} onClick={() => setFilter(p)}
                className={`text-xs px-3 py-1 rounded-full border transition-colors ${filter === p ? "bg-blue-500/20 text-blue-400 border-blue-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map(svc => (
            <div key={svc.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium text-sm">{svc.name}</span>
                    <Badge label={platformLabels[svc.platform] ?? svc.platform} color={platformColors[svc.platform] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"} />
                    <Badge label={svc.status} color={statusColors[svc.status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"} />
                    <span className="text-xs text-zinc-600">{svc.project}</span>
                  </div>
                  <p className="text-xs text-zinc-500 mb-2">{svc.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {svc.stack.map(s => <span key={s} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{s}</span>)}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <a href={svc.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">Visit <ExternalLink className="w-3 h-3" /></a>
                  <a href={`https://github.com/${svc.repo}`} target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-500 hover:text-zinc-300">{svc.repo.split("/")[1]}</a>
                  <span className="text-xs text-zinc-600">deployed {svc.lastDeployed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3"><Database className="w-4 h-4 text-zinc-400" /> Databases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {data.databases.map(db => (
            <div key={db.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <span className="font-medium text-sm">{db.name}</span>
                <Badge label={db.status} color={statusColors[db.status] ?? "bg-zinc-700 text-zinc-300 border-zinc-600"} />
              </div>
              <p className="text-xs text-zinc-500 mb-2">{db.provider} · {db.project}</p>
              {db.endpoint && <p className="text-xs text-zinc-600 font-mono truncate">{db.endpoint}</p>}
              {db.host && <p className="text-xs text-zinc-600 font-mono truncate">{db.host}</p>}
              {db.usedBy && <div className="flex flex-wrap gap-1 mt-2">{db.usedBy.map(u => <span key={u} className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded">{u}</span>)}</div>}
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3"><Cpu className="w-4 h-4 text-zinc-400" /> Google Cloud (Cloud Run)</h2>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><span className="text-zinc-500 block text-xs mb-1">Project ID</span><span className="font-mono text-xs">{data.gcp.projectId}</span></div>
            <div><span className="text-zinc-500 block text-xs mb-1">Name</span><span>{data.gcp.projectName}</span></div>
            <div><span className="text-zinc-500 block text-xs mb-1">Region</span><span>{data.gcp.region}</span></div>
            <div><span className="text-zinc-500 block text-xs mb-1">Services</span><span>{data.gcp.services.length === 0 ? <span className="text-zinc-600">none yet</span> : data.gcp.services.length}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-zinc-800">
            <span className="text-zinc-500 text-xs block mb-1">Registry</span>
            <span className="font-mono text-xs text-zinc-400">{data.gcp.registry}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-semibold flex items-center gap-2 mb-3"><Monitor className="w-4 h-4 text-zinc-400" /> Devices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.devices.map(dev => (
            <div key={dev.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="font-medium text-sm mb-1">{dev.name}</div>
              <p className="text-xs text-zinc-500 mb-3">{dev.role}</p>
              <div className="space-y-1 text-xs font-mono">
                {dev.tailscaleHost && <div className="text-zinc-400">🌐 {dev.tailscaleHost}</div>}
                {dev.tailscaleIp && <div className="text-zinc-600">Tailscale: {dev.tailscaleIp}</div>}
                {dev.localIp && <div className="text-zinc-600">Local: {dev.localIp}</div>}
                {dev.services?.map(s => <div key={s} className="text-blue-400">⚡ {s}</div>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
