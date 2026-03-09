"use client";
import { useState, useEffect } from "react";
import { Shield, ShieldAlert, ShieldCheck, ShieldX, Radar, RefreshCw } from "lucide-react";

interface Check {
  id: string; category: string; title: string; status: string; notes: string;
}

interface Finding {
  id: string; severity: "high" | "medium" | "low" | "info";
  check: string; description: string; file: string; line: number; status: string;
}

interface ScanResult {
  lastRun: string | null; score: number | null; findings: Finding[];
}

const statusConfig: Record<string, { color: string; bg: string; border: string; icon: string; label: string }> = {
  done:    { color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20",  icon: "✅", label: "Secured" },
  partial: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", icon: "⚠️", label: "Partial" },
  todo:    { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    icon: "🔴", label: "Open" },
  unknown: { color: "text-zinc-400",   bg: "bg-zinc-800",      border: "border-zinc-700",      icon: "❓", label: "Unknown" },
};

const severityConfig: Record<string, { color: string; bg: string; border: string; label: string }> = {
  high:   { color: "text-red-400",    bg: "bg-red-500/10",    border: "border-red-500/20",    label: "High" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20", label: "Medium" },
  low:    { color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20",   label: "Low" },
  info:   { color: "text-zinc-400",   bg: "bg-zinc-800",      border: "border-zinc-700",      label: "Info" },
};

export default function SecurityPage() {
  const [data, setData] = useState<{ lastUpdated: string; checks: Check[] } | null>(null);
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [tab, setTab] = useState<"checklist" | "sentinel">("sentinel");

  useEffect(() => {
    fetch("/api/security").then(r => r.json()).then(setData);
    fetch("/api/sentinel").then(r => r.json()).then(setScan);
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/security", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setData(prev => prev ? { ...prev, checks: prev.checks.map(c => c.id === id ? { ...c, status } : c) } : prev);
    setUpdating(null);
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const res = await fetch("/api/sentinel", {
        method: "POST",
        headers: { "x-orion-key": "local" },
      });
      const result = await res.json();
      if (result.ok) {
        setScan({ lastRun: result.lastRun, score: result.score, findings: result.findings });
      }
    } finally {
      setScanning(false);
    }
  };

  if (!data) return <div className="text-zinc-500 text-sm">Loading...</div>;

  const categories = [...new Set(data.checks.map(c => c.category))];
  const done = data.checks.filter(c => c.status === "done").length;
  const total = data.checks.length;
  const open = data.checks.filter(c => c.status === "todo").length;
  const pct = Math.round((done / total) * 100);

  const overallColor = open > 3 ? "text-red-400" : open > 0 ? "text-yellow-400" : "text-green-400";
  const OverallIcon = open > 3 ? ShieldAlert : open > 0 ? Shield : ShieldCheck;

  // Group findings by severity
  const findingsBySeverity = scan?.findings
    ? ["high", "medium", "low", "info"].map(sev => ({
        severity: sev,
        items: scan.findings.filter(f => f.severity === sev),
      })).filter(g => g.items.length > 0)
    : [];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2">
          <Shield className="w-6 h-6 text-zinc-400" /> Security
        </h1>
        <p className="text-zinc-500 text-sm">Security posture across all Orion services.</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-fit">
        <button onClick={() => setTab("sentinel")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === "sentinel" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
          <Radar className="w-4 h-4" /> Sentinel Scanner
        </button>
        <button onClick={() => setTab("checklist")}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${tab === "checklist" ? "bg-zinc-800 text-white" : "text-zinc-500 hover:text-zinc-300"}`}>
          <ShieldCheck className="w-4 h-4" /> Checklist
        </button>
      </div>

      {/* ── Sentinel Scanner Tab ──────────────────────────────────────── */}
      {tab === "sentinel" && (
        <>
          {/* Sentinel score card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Radar className={`w-10 h-10 ${scan?.score != null ? (scan.score >= 80 ? "text-green-400" : scan.score >= 50 ? "text-yellow-400" : "text-red-400") : "text-zinc-600"}`} />
                <div>
                  <div className="flex items-end gap-2">
                    {scan?.score != null ? (
                      <>
                        <span className={`text-3xl font-bold ${scan.score >= 80 ? "text-green-400" : scan.score >= 50 ? "text-yellow-400" : "text-red-400"}`}>
                          {scan.score}
                        </span>
                        <span className="text-zinc-500 text-sm mb-0.5">/100</span>
                      </>
                    ) : (
                      <span className="text-zinc-500 text-sm">No scan yet</span>
                    )}
                  </div>
                  {scan?.lastRun && (
                    <p className="text-xs text-zinc-500 mt-1">
                      Last scan: {new Date(scan.lastRun).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <button onClick={runScan} disabled={scanning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-xl transition-colors">
                <RefreshCw className={`w-4 h-4 ${scanning ? "animate-spin" : ""}`} />
                {scanning ? "Scanning..." : "Run Scan"}
              </button>
            </div>

            {scan?.findings && scan.findings.length > 0 && (
              <div className="flex gap-4 text-xs text-zinc-500 border-t border-zinc-800 pt-3 mt-2">
                <span className="text-red-400">{scan.findings.filter(f => f.severity === "high").length} high</span>
                <span className="text-yellow-400">{scan.findings.filter(f => f.severity === "medium").length} medium</span>
                <span className="text-blue-400">{scan.findings.filter(f => f.severity === "low").length} low</span>
                <span className="text-zinc-400">{scan.findings.filter(f => f.severity === "info").length} info</span>
              </div>
            )}
          </div>

          {/* Findings grouped by severity */}
          {findingsBySeverity.map(group => {
            const cfg = severityConfig[group.severity];
            return (
              <section key={group.severity}>
                <h2 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${cfg.color}`}>
                  {cfg.label} ({group.items.length})
                </h2>
                <div className="space-y-2">
                  {group.items.map(finding => (
                    <div key={finding.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${cfg.bg} ${cfg.color} border ${cfg.border} shrink-0 mt-0.5`}>
                          {finding.id}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200">{finding.description}</p>
                          <p className="text-xs text-zinc-500 mt-1 font-mono">
                            {finding.file}{finding.line > 0 && `:${finding.line}`}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded border ${cfg.color} ${cfg.border} ${cfg.bg} shrink-0`}>
                          {finding.check.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {scan?.findings?.length === 0 && scan.lastRun && (
            <div className="text-center py-12 text-zinc-500">
              <ShieldCheck className="w-12 h-12 mx-auto mb-3 text-green-400" />
              <p className="text-sm">All clear — no issues found.</p>
            </div>
          )}

          {!scan?.lastRun && (
            <div className="text-center py-12 text-zinc-500">
              <Radar className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
              <p className="text-sm">Run a scan to check for security issues across Orion repos.</p>
            </div>
          )}
        </>
      )}

      {/* ── Checklist Tab ─────────────────────────────────────────────── */}
      {tab === "checklist" && (
        <>
          {/* Score card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex items-center gap-6">
            <OverallIcon className={`w-12 h-12 ${overallColor} shrink-0`} />
            <div className="flex-1">
              <div className="flex items-end gap-2 mb-2">
                <span className={`text-4xl font-bold ${overallColor}`}>{pct}%</span>
                <span className="text-zinc-500 text-sm mb-1">secured</span>
              </div>
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${pct === 100 ? "bg-green-500" : pct > 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-4 mt-2 text-xs text-zinc-500">
                <span className="text-green-400">{done} secured</span>
                <span className="text-red-400">{open} open</span>
                <span className="text-yellow-400">{data.checks.filter(c=>c.status==="partial").length} partial</span>
                <span className="text-zinc-500">{data.checks.filter(c=>c.status==="unknown").length} unknown</span>
              </div>
            </div>
          </div>

          <p className="text-zinc-500 text-xs">Last updated {data.lastUpdated}.</p>

          {/* Checks by category */}
          {categories.map(cat => {
            const checks = data.checks.filter(c => c.category === cat);
            return (
              <section key={cat}>
                <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{cat}</h2>
                <div className="space-y-2">
                  {checks.map(check => {
                    const cfg = statusConfig[check.status] ?? statusConfig.unknown;
                    return (
                      <div key={check.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
                        <div className="flex items-start gap-3">
                          <span className="text-base shrink-0 mt-0.5">{cfg.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">{check.title}</span>
                              <span className={`text-xs ${cfg.color}`}>{cfg.label}</span>
                            </div>
                            <p className="text-xs text-zinc-500 leading-relaxed">{check.notes}</p>
                          </div>
                          {/* Quick status toggle */}
                          <div className="flex gap-1 shrink-0">
                            {["todo","partial","done"].map(s => (
                              <button key={s} onClick={() => updateStatus(check.id, s)}
                                disabled={updating === check.id}
                                className={`text-xs px-2 py-0.5 rounded border transition-colors ${check.status === s ? statusConfig[s].color + " " + statusConfig[s].border + " " + statusConfig[s].bg : "text-zinc-600 border-zinc-700 hover:border-zinc-600"}`}>
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}
