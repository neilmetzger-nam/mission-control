"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import { Clock, Globe, Server, CreditCard, Plug } from "lucide-react";

// ─── Ping status type ───────────────────────────────────
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
  { label: "Production", url: "https://ai-restaurant.net" },
  { label: "Vercel Dev", url: "https://air-web-neil-neil-metzgers-projects.vercel.app" },
  { label: "Local Dev", url: "http://localhost:3001" },
];

const INFRA = [
  { label: "Pi Print Server", url: "http://192.168.1.74:3333/status" },
  { label: "Dev Server", url: "http://192.168.1.78:3000/pwa" },
];

const API_STATUS = [
  { api: "UberEats Marketplace", status: "Applied 2/22/26 — pending", emoji: "⏳" },
  { api: "Grubhub Marketplace", status: "Applied — pending", emoji: "⏳" },
  { api: "DoorDash Marketplace", status: "Not applied", emoji: "🔴" },
  { api: "DoorDash Drive", status: "Portal active — needs sandbox test", emoji: "✅" },
  { api: "OpenTable", status: "Applied — pending", emoji: "⏳" },
  { api: "Resy", status: "Not applied", emoji: "🔴" },
  { api: "Yelp Reservations", status: "Not applied", emoji: "🔴" },
  { api: "Plaid", status: "Approved", emoji: "✅" },
  { api: "Square", status: "Connected", emoji: "✅" },
  { api: "Stripe", status: "Key set — terminal location needed", emoji: "⚠️" },
  { api: "ElevenLabs", status: "Connected", emoji: "✅" },
  { api: "Clerk", status: "Connected", emoji: "✅" },
  { api: "Check Payroll (checkhq.com)", status: "Not applied", emoji: "🔴" },
  { api: "Google Ads API", status: "Enabled — key in Vercel", emoji: "✅" },
  { api: "Meta Marketing API", status: "Not applied", emoji: "🔴" },
  { api: "TikTok Marketing API", status: "Not applied", emoji: "🔴" },
  { api: "Google Business Profile API", status: "Enabled — GOOGLE_API_KEY in Vercel", emoji: "✅" },
  { api: "Google Places API", status: "Enabled — GOOGLE_API_KEY in Vercel", emoji: "✅" },
  { api: "Gemini API", status: "Enabled — GEMINI_API_KEY in Vercel", emoji: "✅" },
];

const TARGET = new Date("2026-03-15T23:59:59");

function countdown(): string {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return "Launch day!";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}d ${hours}h remaining`;
}

// ─── Sub-component for environment rows ─────────────────
function EnvRow({ label, url }: { label: string; url: string }) {
  const status = usePing(url);
  return (
    <tr className="border-b border-zinc-800/50">
      <td className="px-4 py-3 text-sm text-zinc-300">{label}</td>
      <td className="px-4 py-3 text-xs text-zinc-500 font-mono">{url}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <StatusDot status={status} />
          <span className="text-xs text-zinc-500">
            {status === "loading" ? "checking..." : status}
          </span>
        </div>
      </td>
    </tr>
  );
}

function InfraRow({ label, url }: { label: string; url: string }) {
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
export default function AirSettingsPage() {
  const [clock, setClock] = useState(countdown());

  useEffect(() => {
    const interval = setInterval(() => setClock(countdown()), 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Settings</h1>
        <p className="text-zinc-500 text-sm">Environments, infrastructure, and integrations</p>
      </div>

      {/* Environments */}
      <div className="mb-6">
        <SectionHeader icon={Globe} label="Environments" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">Label</th>
                <th className="text-left px-4 py-2 font-medium">URL</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {ENVIRONMENTS.map((env) => (
                <EnvRow key={env.label} {...env} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Contacts */}
      <div className="mb-6">
        <SectionHeader icon={Globe} label="Key Contacts" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          <div className="px-4 py-3">
            <span className="text-sm text-zinc-300">Neil Metzger</span>
            <span className="text-xs text-zinc-500 ml-2">— Owner / Product</span>
          </div>
          <div className="px-4 py-3">
            <span className="text-sm text-zinc-300">Obie</span>
            <span className="text-xs text-zinc-500 ml-2">— Engineering / Cloud Run (backend only)</span>
          </div>
        </div>
      </div>

      {/* Infrastructure */}
      <div className="mb-6">
        <SectionHeader icon={Server} label="Infrastructure" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          {INFRA.map((item) => (
            <InfraRow key={item.label} {...item} />
          ))}
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
            <span className="text-sm text-zinc-300">Neon DB</span>
            <span className="text-xs text-zinc-400">Neon Postgres</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">Vercel Project</span>
            <span className="text-xs text-zinc-400 font-mono">air-web-neil</span>
          </div>
        </div>
      </div>

      {/* Sprint Deadline */}
      <div className="mb-6">
        <SectionHeader icon={Clock} label="Sprint Deadline" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-4 flex items-center justify-between">
          <div>
            <span className="text-sm text-zinc-300">Beta Launch</span>
            <span className="text-xs text-zinc-500 ml-2">March 15, 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-sm text-yellow-400 font-medium">{clock}</span>
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="mb-6">
        <SectionHeader icon={CreditCard} label="Payment" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">Square</span>
            <span className="text-xs text-green-400">✅ Connected (Production)</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">Stripe</span>
            <span className="text-xs text-green-400">✅ Key set (terminal location needed)</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300 font-mono text-xs">STRIPE_TERMINAL_LOCATION_ID</span>
            <span className="text-xs text-yellow-400">⚠️ Missing</span>
          </div>
        </div>
      </div>

      {/* Third-Party API Status */}
      <div>
        <SectionHeader icon={Plug} label="Third-Party API Status" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
                <th className="text-left px-4 py-2 font-medium">API</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {API_STATUS.map((row) => (
                <tr key={row.api} className="border-b border-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-300">{row.api}</td>
                  <td className="px-4 py-3 text-xs text-zinc-400">
                    {row.emoji} {row.status}
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
