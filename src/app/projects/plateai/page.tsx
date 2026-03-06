"use client";

import Link from "next/link";
import { Users, DollarSign, Mail, TrendingUp, ExternalLink } from "lucide-react";

const STATS = [
  { label: "Total Leads", value: "0", icon: Mail, color: "text-orange-400" },
  { label: "Paying Customers", value: "0", icon: Users, color: "text-green-400" },
  { label: "MRR", value: "$0", icon: DollarSign, color: "text-blue-400" },
  { label: "Conversion Rate", value: "—", icon: TrendingUp, color: "text-purple-400" },
];

const QUICK_LINKS = [
  { label: "Leads", href: "/projects/plateai/leads", desc: "Intake form submissions" },
  { label: "Customers", href: "/projects/plateai/customers", desc: "Paying subscribers" },
];

export default function PlateAIProject() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/projects" className="text-zinc-500 hover:text-zinc-300 text-sm">Projects</Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-300 text-sm">PlateAI</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Plate<span className="text-orange-500">AI</span>
            </h1>
            <p className="text-zinc-400 mt-1">AI food photography & content for restaurants</p>
          </div>
          <a
            href="https://getplateai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 hover:border-zinc-500 hover:text-white transition text-sm"
          >
            getplateai.com <ExternalLink size={14} />
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map((s) => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <s.icon size={18} className={`${s.color} mb-3`} />
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {QUICK_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-600 transition group"
            >
              <div className="font-semibold text-white group-hover:text-orange-400 transition">{l.label}</div>
              <div className="text-sm text-zinc-500 mt-1">{l.desc}</div>
            </Link>
          ))}
        </div>

        {/* Info */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-4">Project Info</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-zinc-500">Domain</span><div className="text-zinc-200 mt-1">getplateai.com</div></div>
            <div><span className="text-zinc-500">Repo</span><div className="text-zinc-200 mt-1">neilmetzger-nam/plateai-website</div></div>
            <div><span className="text-zinc-500">Inbox</span><div className="text-zinc-200 mt-1">dave@getplateai.com</div></div>
            <div><span className="text-zinc-500">Pricing</span><div className="text-zinc-200 mt-1">$49 / $99 / $199 per mo</div></div>
            <div><span className="text-zinc-500">Status</span><div className="text-orange-400 mt-1 font-medium">🟠 Pre-revenue — collecting leads</div></div>
            <div><span className="text-zinc-500">Launched</span><div className="text-zinc-200 mt-1">March 6, 2026</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
