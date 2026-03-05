"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";
import { Clock, Globe, Server, CreditCard, Plug, RefreshCw } from "lucide-react";

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

function SectionHeader({ icon: Icon, label, extra }: { icon: React.ElementType; label: string; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="w-4 h-4 text-zinc-500" />
      <h2 className="text-sm font-semibold text-zinc-300">{label}</h2>
      {extra && <div className="ml-auto">{extra}</div>}
    </div>
  );
}

// ─── Static Data ────────────────────────────────────────
const ENVIRONMENTS = [
  { label: "Production", url: "https://ai-restaurant.net" },
  { label: "Vercel Dev", url: "https://air-web-neil-neil-metzgers-projects.vercel.app" },
  { label: "Local Dev", url: "http://localhost:3001" },
];

const INFRA = [
  { label: "Pi Print Server", url: "http://192.168.1.74:3333/status" },
  { label: "Dev Server", url: "http://192.168.1.78:3000/pwa" },
];

const TARGET = new Date("2026-03-15T23:59:59");

function countdown(): string {
  const diff = TARGET.getTime() - Date.now();
  if (diff <= 0) return "Launch day!";
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  return `${days}d ${hours}h remaining`;
}

// ─── Vercel env types ───────────────────────────────────
interface VercelEnvEntry {
  key: string;
  label: string;
  category: string;
  exists: boolean;
  environments: string[];
}

const CATEGORY_LABELS: Record<string, string> = {
  payments: "Payments",
  google: "Google",
  auth: "Auth & DB",
  ai: "AI",
  infra: "Infrastructure",
  fintech: "Fintech",
};

const CATEGORY_ORDER = ["payments", "google", "auth", "ai", "infra", "fintech"];

// ─── Sub-components ─────────────────────────────────────
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

function EnvKeyStatus({ entry }: { entry: VercelEnvEntry }) {
  const hasProd = entry.environments.includes("production");
  const hasPreview = entry.environments.includes("preview") || entry.environments.includes("development");

  let emoji: string;
  let color: string;
  let statusText: string;

  if (entry.exists && hasProd) {
    emoji = "✅";
    color = "text-green-400";
    statusText = "Production";
  } else if (entry.exists && hasPreview) {
    emoji = "⚠️";
    color = "text-yellow-400";
    statusText = "Preview/Dev only";
  } else if (entry.exists) {
    emoji = "✅";
    color = "text-green-400";
    statusText = "Set";
  } else {
    emoji = "🔴";
    color = "text-red-400";
    statusText = "Missing";
  }

  return (
    <tr className="border-b border-zinc-800/50">
      <td className="px-4 py-2.5 text-sm text-zinc-300">{entry.label}</td>
      <td className="px-4 py-2.5 text-xs text-zinc-600 font-mono">{entry.key}</td>
      <td className={`px-4 py-2.5 text-xs ${color}`}>
        {emoji} {statusText}
      </td>
    </tr>
  );
}

// ─── Main ───────────────────────────────────────────────
export default function AirSettingsPage() {
  const [clock, setClock] = useState(countdown());
  const [vercelEntries, setVercelEntries] = useState<VercelEnvEntry[]>([]);
  const [vercelConfigured, setVercelConfigured] = useState<boolean | null>(null);
  const [vercelLoading, setVercelLoading] = useState(true);
  const [vercelError, setVercelError] = useState<string | null>(null);

  const fetchVercelStatus = useCallback(() => {
    setVercelLoading(true);
    fetch("/api/vercel/env-status")
      .then((r) => r.json())
      .then((data) => {
        setVercelConfigured(data.configured);
        setVercelEntries(data.entries ?? []);
        setVercelError(data.error ?? null);
        setVercelLoading(false);
      })
      .catch(() => {
        setVercelError("Failed to fetch");
        setVercelLoading(false);
      });
  }, []);

  useEffect(() => {
    // Initial fetch + auto-refresh every 60s
    let cancelled = false;
    const doFetch = () => {
      if (cancelled) return;
      fetch("/api/vercel/env-status")
        .then((r) => r.json())
        .then((data) => {
          if (cancelled) return;
          setVercelConfigured(data.configured);
          setVercelEntries(data.entries ?? []);
          setVercelError(data.error ?? null);
          setVercelLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setVercelError("Failed to fetch");
          setVercelLoading(false);
        });
    };
    doFetch();
    const interval = setInterval(doFetch, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setClock(countdown()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Group entries by category
  const grouped = CATEGORY_ORDER
    .map((cat) => {
      const entries = vercelEntries.filter((e) => e.category === cat);
      const configured = entries.filter((e) => e.exists).length;
      return { category: cat, label: CATEGORY_LABELS[cat] ?? cat, entries, configured, total: entries.length };
    })
    .filter((g) => g.entries.length > 0);

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

      {/* Vercel API Keys — Live from Vercel */}
      <div className="mb-6">
        <SectionHeader
          icon={Plug}
          label="Vercel API Keys (Live)"
          extra={
            !vercelLoading && vercelConfigured && (
              <button
                onClick={fetchVercelStatus}
                className="text-zinc-600 hover:text-zinc-400 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )
          }
        />

        {vercelLoading ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-500 animate-pulse">Checking Vercel environment...</p>
          </div>
        ) : vercelConfigured === false ? (
          <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
            <p className="text-sm text-yellow-400 mb-2">Vercel integration not configured</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              To enable live API status: create a Vercel token at{" "}
              <span className="text-zinc-400">vercel.com/account/tokens</span>{" "}
              and add <span className="font-mono text-zinc-400">VERCEL_TOKEN</span> +{" "}
              <span className="font-mono text-zinc-400">VERCEL_PROJECT_ID</span> to{" "}
              Mission Control&apos;s <span className="font-mono text-zinc-400">.env.local</span>
            </p>
          </div>
        ) : vercelError ? (
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <p className="text-sm text-red-400">Error: {vercelError}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grouped.map((group) => (
              <div key={group.category} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">
                    {group.label}
                  </span>
                  <span className={`text-xs ${group.configured === group.total ? "text-green-400" : "text-yellow-400"}`}>
                    {group.configured}/{group.total} configured
                  </span>
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    {group.entries.map((entry) => (
                      <EnvKeyStatus key={entry.key} entry={entry} />
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment (static — these are about connection status, not just key existence) */}
      <div>
        <SectionHeader icon={CreditCard} label="Payment Integrations" />
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">Square</span>
            <span className="text-xs text-green-400">✅ Connected (Production)</span>
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-zinc-300">Stripe</span>
            <span className="text-xs text-green-400">✅ Key set (terminal location needed)</span>
          </div>
        </div>
      </div>
    </>
  );
}
