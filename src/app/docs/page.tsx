"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText, Search, Clock, User, Folder, Cpu,
  BookOpen, Wrench, TrendingUp, Brain, Zap, X,
  ChevronRight, Copy, Check
} from "lucide-react";
import type { DocEntry } from "../api/docs/route";

const TYPE_ICONS: Record<string, React.ElementType> = {
  architecture: Cpu,
  prompt: Zap,
  spec: FileText,
  brief: User,
  research: Search,
  strategy: TrendingUp,
  agent: Brain,
  task: Wrench,
  doc: FileText,
  runbook: BookOpen,
};

const TYPE_COLORS: Record<string, string> = {
  architecture: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  prompt: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  spec: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  brief: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  research: "text-green-400 bg-green-500/10 border-green-500/20",
  strategy: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  agent: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  task: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  doc: "text-gray-400 bg-gray-500/10 border-gray-500/20",
  runbook: "text-teal-400 bg-teal-500/10 border-teal-500/20",
};

const STATUS_COLORS: Record<string, string> = {
  ready: "text-green-400",
  draft: "text-yellow-400",
  shipped: "text-blue-400",
  archived: "text-gray-500",
};

const ALL_TYPES = ["all", "architecture", "prompt", "spec", "brief", "research", "strategy", "agent", "task"];

export default function DocsPage() {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [selected, setSelected] = useState<DocEntry | null>(null);
  const [reading, setReading] = useState<{ doc: DocEntry; content: string } | null>(null);
  const [readingLoading, setReadingLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const openReader = useCallback(async (doc: DocEntry) => {
    setReadingLoading(true);
    setReading(null);
    try {
      const res = await fetch(`/api/docs/content?path=${encodeURIComponent(doc.path)}`);
      const data = await res.json();
      setReading({ doc, content: data.content ?? "" });
    } catch {
      setReading({ doc, content: "Failed to load content." });
    } finally {
      setReadingLoading(false);
    }
  }, []);

  const copyContent = useCallback(() => {
    if (!reading) return;
    navigator.clipboard.writeText(reading.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [reading]);

  useEffect(() => {
    fetch("/api/docs")
      .then((r) => r.json())
      .then((data) => { setDocs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = docs.filter((d) => {
    if (d.status === "archived") return false;
    if (projectFilter !== "all" && d.project !== projectFilter) return false;
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (audienceFilter !== "all" && d.audience !== audienceFilter && d.audience !== "all") return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)) ||
        d.type.includes(q) ||
        (d.summary?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  // All unique tags across filtered docs
  const allTags = [...new Set(docs.flatMap((d) => d.tags))].sort();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-4">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <Brain className="w-3.5 h-3.5" /> Agency Portfolio
            </Link>
            <span>/</span>
            <span className="text-white">Document Library</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Document Library</h1>
              <p className="text-zinc-500 text-sm mt-1">
                {docs.length} docs indexed · {docs.filter(d => d.hasFrontmatter).length} tagged · {docs.filter(d => d.type === "prompt").length} Claude Code prompts ready
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-56 shrink-0">

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search docs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Project filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium">Project</p>
              {["all", "ai-r", "studio"].map((p) => (
                <button
                  key={p}
                  onClick={() => setProjectFilter(p)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm mb-0.5 transition-colors ${
                    projectFilter === p ? "bg-blue-500/20 text-blue-400" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {p === "all" ? "All Projects" : p === "ai-r" ? "AI-R" : "Studio"}
                </button>
              ))}
            </div>

            {/* Type filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium">Type</p>
              {ALL_TYPES.map((t) => {
                const count = docs.filter(d => t === "all" ? true : d.type === t).length;
                const Icon = t === "all" ? Folder : (TYPE_ICONS[t] ?? FileText);
                return (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-sm mb-0.5 flex items-center justify-between transition-colors ${
                      typeFilter === t ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5" />
                      {t === "all" ? "All Types" : t}
                    </span>
                    <span className="text-xs text-zinc-600">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* Audience filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium">Audience</p>
              {["all", "obie", "neil", "claude-code"].map((a) => (
                <button
                  key={a}
                  onClick={() => setAudienceFilter(a)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-sm mb-0.5 transition-colors ${
                    audienceFilter === a ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                  }`}
                >
                  {a === "all" ? "Everyone" : a === "claude-code" ? "Claude Code" : a.charAt(0).toUpperCase() + a.slice(1)}
                </button>
              ))}
            </div>

            {/* Popular tags */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-zinc-600 mb-2 font-medium">Tags</p>
              <div className="flex flex-wrap gap-1">
                {allTags.slice(0, 20).map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearch(tag)}
                    className="text-[10px] px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded-full hover:bg-zinc-700 hover:text-white transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex items-center justify-center h-64 text-zinc-500">
                <div className="text-center">
                  <div className="w-6 h-6 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
                  Scanning directories...
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-zinc-500">{filtered.length} documents</p>
                  {search && (
                    <button onClick={() => setSearch("")} className="text-xs text-zinc-500 hover:text-white">
                      Clear search
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.map((doc) => {
                    const Icon = TYPE_ICONS[doc.type] ?? FileText;
                    const colorClass = TYPE_COLORS[doc.type] ?? TYPE_COLORS.doc;
                    const isSelected = selected?.path === doc.path;

                    return (
                      <div
                        key={doc.path}
                        onClick={() => setSelected(isSelected ? null : doc)}
                        className={`bg-zinc-900 rounded-xl p-4 border cursor-pointer transition-all ${
                          isSelected
                            ? "border-blue-500/50 bg-zinc-800"
                            : "border-zinc-800 hover:border-zinc-600"
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`p-1.5 rounded-lg border shrink-0 ${colorClass}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-medium text-sm leading-tight mb-1">{doc.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-[10px] font-medium ${colorClass} px-1.5 py-0.5 rounded border`}>
                                {doc.type}
                              </span>
                              {doc.status !== "draft" && (
                                <span className={`text-[10px] ${STATUS_COLORS[doc.status]}`}>
                                  {doc.status}
                                </span>
                              )}
                              {!doc.hasFrontmatter && (
                                <span className="text-[10px] text-zinc-600">untagged</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Summary */}
                        {doc.summary && (
                          <p className="text-xs text-zinc-500 mb-2 leading-relaxed line-clamp-2">
                            {doc.summary}
                          </p>
                        )}

                        {/* Tags */}
                        {doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {doc.tags.slice(0, 5).map((tag) => (
                              <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-zinc-800 text-zinc-500 rounded-full">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 5 && (
                              <span className="text-[10px] text-zinc-600">+{doc.tags.length - 5}</span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between text-[10px] text-zinc-600 pt-2 border-t border-zinc-800">
                          <span className="flex items-center gap-1">
                            <Folder className="w-3 h-3" />
                            {doc.dir.split("/").pop()}
                          </span>
                          <div className="flex items-center gap-2">
                            {doc.audience !== "all" && (
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" /> {doc.audience}
                              </span>
                            )}
                            {doc.created && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" /> {doc.created}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Expanded detail */}
                        {isSelected && (
                          <div className="mt-3 pt-3 border-t border-zinc-700">
                            <div className="text-xs text-zinc-400 font-mono mb-2 break-all">{doc.path}</div>
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={(e) => { e.stopPropagation(); openReader(doc); }}
                                className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded-lg hover:bg-blue-500/30 flex items-center gap-1 transition-colors"
                              >
                                <BookOpen className="w-3 h-3" /> Read doc
                              </button>
                              {doc.type === "prompt" && (
                                <span className="text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 px-2 py-1 rounded-lg">
                                  ⚡ Claude Code
                                </span>
                              )}
                              {doc.audience === "obie" && (
                                <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-1 rounded-lg">
                                  📤 Obie
                                </span>
                              )}
                              <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-1 rounded-lg">
                                {doc.filename}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {filtered.length === 0 && (
                  <div className="text-center py-16 text-zinc-500">
                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                    <p>No documents match your filters.</p>
                    <button onClick={() => { setSearch(""); setTypeFilter("all"); setProjectFilter("all"); }} className="text-sm text-blue-400 mt-2 hover:underline">
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Reader Panel */}
      {(reading || readingLoading) && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="flex-1 bg-black/60 backdrop-blur-sm"
            onClick={() => { setReading(null); setReadingLoading(false); }}
          />
          {/* Panel */}
          <div className="w-full max-w-3xl bg-[#0f0f0f] border-l border-zinc-800 flex flex-col h-full overflow-hidden shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 shrink-0">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold text-sm truncate">
                  {readingLoading ? "Loading…" : reading?.doc.title}
                </h2>
                {reading && (
                  <p className="text-[10px] text-zinc-500 font-mono mt-0.5 truncate">{reading.doc.path}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4 shrink-0">
                {reading && (
                  <button
                    onClick={copyContent}
                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? "Copied" : "Copy"}
                  </button>
                )}
                <button
                  onClick={() => { setReading(null); setReadingLoading(false); }}
                  className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {readingLoading ? (
                <div className="flex items-center justify-center h-32 text-zinc-500">
                  <div className="text-center">
                    <div className="w-5 h-5 border-2 border-zinc-700 border-t-blue-500 rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm">Reading file…</p>
                  </div>
                </div>
              ) : reading ? (
                <MarkdownRenderer content={reading.content} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Lightweight Markdown Renderer ──────────────────────────────────────────────
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <div key={i} className="my-3">
          {lang && <div className="text-[10px] text-zinc-500 font-mono bg-zinc-900 border border-zinc-700 border-b-0 px-3 py-1 rounded-t-lg">{lang}</div>}
          <pre className={`bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-200 p-4 overflow-x-auto ${lang ? "rounded-b-lg" : "rounded-lg"}`}>
            {codeLines.join("\n")}
          </pre>
        </div>
      );
      i++;
      continue;
    }

    // Headings
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^(#+)/)?.[1].length ?? 1;
      const text = line.replace(/^#+\s*/, "");
      const cls = [
        "text-xl font-bold text-white mt-6 mb-2",
        "text-lg font-semibold text-white mt-5 mb-2",
        "text-base font-semibold text-zinc-200 mt-4 mb-1.5",
        "text-sm font-semibold text-zinc-300 mt-3 mb-1",
        "text-sm font-medium text-zinc-400 mt-2 mb-1",
        "text-xs font-medium text-zinc-500 mt-2 mb-1",
      ][level - 1];
      elements.push(<div key={i} className={cls}>{inlineFormat(text)}</div>);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(-{3,}|_{3,}|\*{3,})$/.test(line.trim())) {
      elements.push(<hr key={i} className="border-zinc-700 my-4" />);
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      elements.push(
        <div key={i} className="border-l-2 border-zinc-600 pl-4 my-2 text-zinc-400 text-sm italic">
          {inlineFormat(line.slice(2))}
        </div>
      );
      i++;
      continue;
    }

    // Unordered list
    if (/^(\s*[-*+])\s/.test(line)) {
      const listItems: { indent: number; text: string }[] = [];
      while (i < lines.length && /^(\s*[-*+])\s/.test(lines[i])) {
        const indent = lines[i].match(/^(\s*)/)?.[1].length ?? 0;
        listItems.push({ indent, text: lines[i].replace(/^\s*[-*+]\s/, "") });
        i++;
      }
      elements.push(
        <ul key={i} className="my-2 space-y-1">
          {listItems.map((item, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-zinc-300" style={{ paddingLeft: item.indent * 4 }}>
              <span className="text-zinc-600 mt-0.5 shrink-0">•</span>
              <span>{inlineFormat(item.text)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line)) {
      const listItems: string[] = [];
      const start = parseInt(line.match(/^(\d+)/)?.[1] ?? "1");
      while (i < lines.length && /^\d+\.\s/.test(lines[i])) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ""));
        i++;
      }
      elements.push(
        <ol key={i} className="my-2 space-y-1 list-none">
          {listItems.map((text, idx) => (
            <li key={idx} className="flex gap-2 text-sm text-zinc-300">
              <span className="text-zinc-500 shrink-0 w-5 text-right">{start + idx}.</span>
              <span>{inlineFormat(text)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // YAML frontmatter — skip
    if (line === "---" && i === 0) {
      i++;
      while (i < lines.length && lines[i] !== "---") i++;
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Paragraph
    elements.push(
      <p key={i} className="text-sm text-zinc-300 leading-relaxed my-1">
        {inlineFormat(line)}
      </p>
    );
    i++;
  }

  return <div className="font-sans">{elements}</div>;
}

function inlineFormat(text: string): React.ReactNode {
  // Split on bold, italic, inline code, links
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\[([^\]]+)\]\(([^)]+)\))/g);
  return parts.filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={i} className="text-zinc-200 italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} className="bg-zinc-800 text-emerald-400 text-[11px] px-1.5 py-0.5 rounded font-mono">{part.slice(1, -1)}</code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{linkMatch[1]}</a>;
    }
    return part;
  });
}
