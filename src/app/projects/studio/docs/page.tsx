"use client";

import { FileText } from "lucide-react";

const SPEC_FILES = [
  "virtual-studio-agents.md",
  "engine-prompting-guide.md",
  "mcp-tool-map.md",
];

export default function StudioDocsPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Studio Docs</h1>
        <p className="text-zinc-500 text-sm">Specs and documentation</p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
        {SPEC_FILES.map((file) => (
          <div key={file} className="flex items-center gap-3 px-4 py-3">
            <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
            <span className="text-sm text-zinc-300 font-mono">{file}</span>
          </div>
        ))}
      </div>
    </>
  );
}
