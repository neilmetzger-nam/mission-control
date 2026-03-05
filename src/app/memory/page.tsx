"use client";

import { useState, useEffect } from "react";
import { Search, FileText, Brain } from "lucide-react";

interface MemoryFile {
  filename: string;
  path: string;
  content: string;
  modified: string;
}

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let inCode = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("```")) {
      if (inCode) {
        elements.push(
          <pre key={i} className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 overflow-x-auto my-2">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCode = false;
      } else {
        inCode = true;
      }
      continue;
    }

    if (inCode) {
      codeLines.push(line);
      continue;
    }

    if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-semibold mt-3 mb-1.5 text-zinc-200">{line.slice(3)}</h2>);
    } else if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-semibold mt-2 mb-1 text-zinc-300">{line.slice(4)}</h3>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <p key={i} className="text-sm text-zinc-400 leading-relaxed pl-4 before:content-['•'] before:absolute before:left-0 relative">
          <span className="text-zinc-600 mr-2">•</span>{line.slice(2)}
        </p>
      );
    } else if (line.startsWith("---")) {
      elements.push(<hr key={i} className="border-zinc-800 my-3" />);
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(<p key={i} className="text-sm text-zinc-400 leading-relaxed">{line}</p>);
    }
  }

  return elements;
}

export default function MemoryPage() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [longTermMemory, setLongTermMemory] = useState("");
  const [selected, setSelected] = useState<MemoryFile | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memory")
      .then((r) => r.json())
      .then((data) => {
        setLongTermMemory(data.longTermMemory ?? "");
        setFiles(data.files ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = files.filter((f) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return f.filename.toLowerCase().includes(q) || f.content.toLowerCase().includes(q);
  });

  const displayContent = selected?.content ?? "";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Memory Browser</h1>
        <p className="text-zinc-500 text-sm">Dave&apos;s workspace memory files</p>
      </div>

      {/* Long-Term Memory */}
      {longTermMemory && (
        <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Brain className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-semibold text-purple-300">Long-Term Memory (MEMORY.md)</h2>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {renderMarkdown(longTermMemory)}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search memory files..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600"
        />
      </div>

      {/* Split view */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ minHeight: "60vh" }}>
        {/* File list */}
        <div className="md:col-span-1 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 text-xs text-zinc-500">
            {filtered.length} file{filtered.length !== 1 ? "s" : ""}
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "55vh" }}>
            {loading ? (
              <p className="text-sm text-zinc-500 p-4">Loading...</p>
            ) : (
              filtered.map((f) => (
                <button
                  key={f.filename}
                  onClick={() => setSelected(f)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-800/50 hover:bg-zinc-800/50 transition-colors ${
                    selected?.filename === f.filename ? "bg-zinc-800" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    <span className="text-sm text-zinc-300 truncate">{f.filename}</span>
                  </div>
                  <div className="text-[10px] text-zinc-600 mt-0.5 pl-5.5">
                    {new Date(f.modified).toLocaleDateString()}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Content viewer */}
        <div className="md:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {selected ? (
            <div className="p-5 overflow-y-auto" style={{ maxHeight: "60vh" }}>
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">{selected.filename}</h3>
              {renderMarkdown(displayContent)}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-zinc-600 text-sm p-8">
              Select a file to view
            </div>
          )}
        </div>
      </div>
    </>
  );
}
