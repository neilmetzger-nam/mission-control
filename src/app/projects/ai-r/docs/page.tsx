"use client";

import { FileText, ExternalLink, FolderOpen } from "lucide-react";
import Link from "next/link";

const FILE_GROUPS = [
  {
    label: "Strategy",
    files: [
      { name: "operator-faqs.md", path: "agency/projects/ai-r/strategy/operator-faqs.md" },
      { name: "go-to-market.md", path: "agency/projects/ai-r/strategy/go-to-market.md" },
      { name: "marketing-positioning.md", path: "agency/projects/ai-r/strategy/marketing-positioning.md" },
      { name: "delivery-liberation.md", path: "agency/projects/ai-r/strategy/delivery-liberation.md" },
    ],
  },
  {
    label: "Specs & Docs",
    files: [
      { name: "product-architecture.md", path: "agency/projects/ai-r/docs/product-architecture.md" },
      { name: "gloria-ordering-page.md", path: "agency/projects/ai-r/docs/gloria-ordering-page.md" },
      { name: "restaurant-intake-pipeline.md", path: "agency/projects/ai-r/docs/restaurant-intake-pipeline.md" },
      { name: "restaurant-config-model.md", path: "agency/projects/ai-r/docs/restaurant-config-model.md" },
      { name: "website-positioning.md", path: "agency/projects/ai-r/docs/website-positioning.md" },
    ],
  },
  {
    label: "Claude Code Prompts",
    files: [
      { name: "claude-code-mcp-v2-task-queue.md", path: "prompts/claude-code-mcp-v2-task-queue.md" },
      { name: "claude-code-sentinel.md", path: "prompts/claude-code-sentinel.md" },
      { name: "print-routing-receipts.md", path: "prompts/print-routing-receipts.md" },
      { name: "pwa-two-device-modes.md", path: "prompts/pwa-two-device-modes.md" },
    ],
  },
  {
    label: "Research",
    files: [
      { name: "competitor-demos.md", path: "agency/projects/ai-r/research/competitor-demos.md" },
      { name: "delivery-conversion-engine.md", path: "agency/projects/ai-r/research/delivery-conversion-engine.md" },
      { name: "loyalty-competitive-analysis.md", path: "agency/projects/ai-r/research/loyalty-competitive-analysis.md" },
      { name: "restaurant-settings-spec.md", path: "agency/projects/ai-r/research/restaurant-settings-spec.md" },
    ],
  },
  {
    label: "Sprint & Planning",
    files: [
      { name: "obie-sprint-plan.md", path: "agency/projects/ai-r/obie-sprint-plan.md" },
      { name: "red-bar-rollout.md", path: "agency/projects/ai-r/red-bar-rollout.md" },
      { name: "IMPLEMENTATION.md", path: "agency/projects/ai-r/IMPLEMENTATION.md" },
      { name: "deployment-plan.md", path: "agency/projects/ai-r/deployment-plan.md" },
    ],
  },
  {
    label: "Media & YouTube",
    files: [
      { name: "youtube-ep1-script.md", path: "projects/youtube-ep1-script.md" },
      { name: "hacker-news-draft.md", path: "agency/projects/ai-r/media/hacker-news-draft.md" },
      { name: "social-strategy.md", path: "agency/projects/ai-r/media/social-strategy.md" },
    ],
  },
];

export default function AirDocsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Docs</h1>
        <p className="text-zinc-500 text-sm">All workspace files tied to this project</p>
      </div>

      <div className="space-y-6">
        {FILE_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 mb-2">
              <FolderOpen className="w-4 h-4 text-zinc-500" />
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{group.label}</span>
            </div>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
              {group.files.map((file) => (
                <Link
                  key={file.path}
                  href={'/memory?file=' + encodeURIComponent(file.path)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-zinc-500 shrink-0 group-hover:text-indigo-400" />
                  <span className="text-sm text-zinc-300 font-mono flex-1">{file.name}</span>
                  <span className="text-xs text-zinc-600 group-hover:text-zinc-400 truncate max-w-xs hidden sm:block">{file.path}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-600 group-hover:text-indigo-400 shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
