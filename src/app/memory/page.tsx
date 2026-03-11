"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface FileNode { name: string; type: "file"|"dir"; path: string; size?: number; children?: FileNode[]; }

type Section = "memory" | "rules" | "ideas" | "daily" | "files";

interface DayEntry { date: string; content: string; }

function parseMemorySections(md: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  const lines = md.split("\n");
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (current) sections.push({ title: current.title, content: current.lines.join("\n").trim() });
      current = { title: line.replace("## ", ""), lines: [] };
    } else if (line.startsWith("### ") && current) {
      current.lines.push(line);
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push({ title: current.title, content: current.lines.join("\n").trim() });
  return sections.filter(s => s.content.length > 0);
}

function parseIdeas(md: string): { title: string; content: string; priority: string }[] {
  const ideas: { title: string; content: string; priority: string }[] = [];
  const blocks = md.split("\n## ").slice(1);
  for (const block of blocks) {
    const lines = block.split("\n");
    const title = lines[0].trim();
    const content = lines.slice(1).join("\n").trim();
    const priority = content.toLowerCase().includes("high priority") ? "high"
      : content.toLowerCase().includes("low priority") ? "low" : "medium";
    ideas.push({ title, content, priority });
  }
  return ideas;
}

function MarkdownText({ text }: { text: string }) {
  // Simple inline renderer: bold, links, code
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|https?:\/\/\S+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**"))
          return <strong key={i} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`"))
          return <code key={i} className="text-blue-300 bg-zinc-800 px-1 rounded text-xs font-mono">{part.slice(1, -1)}</code>;
        if (part.startsWith("http"))
          return <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline break-all">{part}</a>;
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function MemorySection({ title, content }: { title: string; content: string }) {
  const [open, setOpen] = useState(false);
  const lines = content.split("\n").filter(l => l.trim());
  const preview = lines.slice(0, 3);
  const hasMore = lines.length > 3;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{title}</span>
          <span className="text-xs text-zinc-600">{open ? "▲" : "▼"} {lines.length} lines</span>
        </div>
      </button>
      <div className="px-4 pb-4 space-y-1.5">
        {(open ? lines : preview).map((line, i) => {
          if (line.startsWith("### ")) return <div key={i} className="text-xs font-semibold text-zinc-400 mt-2 pt-2 border-t border-zinc-800">{line.replace("### ", "")}</div>;
          if (line.startsWith("- ")) return <div key={i} className="text-xs text-zinc-400 flex gap-2"><span className="text-zinc-600 shrink-0">·</span><MarkdownText text={line.slice(2)} /></div>;
          if (line.startsWith("**")) return <div key={i} className="text-xs text-zinc-300"><MarkdownText text={line} /></div>;
          return <div key={i} className="text-xs text-zinc-500"><MarkdownText text={line} /></div>;
        })}
        {!open && hasMore && (
          <button onClick={() => setOpen(true)} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">+ {lines.length - 3} more lines</button>
        )}
      </div>
    </div>
  );
}

function IdeaCard({ idea }: { idea: { title: string; content: string; priority: string } }) {
  const [open, setOpen] = useState(false);
  const priorityColor = idea.priority === "high" ? "text-red-400 border-red-500/30 bg-red-500/10"
    : idea.priority === "low" ? "text-zinc-500 border-zinc-600 bg-zinc-800"
    : "text-yellow-400 border-yellow-500/30 bg-yellow-500/10";
  const lines = idea.content.split("\n").filter(l => l.trim());

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm flex-1">{idea.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor}`}>{idea.priority}</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1.5 border-t border-zinc-800 pt-3">
          {lines.map((line, i) => {
            if (line.startsWith("### ")) return <div key={i} className="text-xs font-semibold text-zinc-400 mt-2">{line.replace("### ","")}</div>;
            if (line.startsWith("- ")) return <div key={i} className="text-xs text-zinc-400 flex gap-2"><span className="text-zinc-600">·</span><MarkdownText text={line.slice(2)} /></div>;
            if (line.startsWith("**")) return <div key={i} className="text-xs text-zinc-300"><MarkdownText text={line} /></div>;
            return <div key={i} className="text-xs text-zinc-500"><MarkdownText text={line} /></div>;
          })}
        </div>
      )}
    </div>
  );
}

function DayLog({ day }: { day: DayEntry }) {
  const [open, setOpen] = useState(false);
  const lines = day.content.split("\n").filter(l => l.trim());
  const isToday = day.date === new Date().toISOString().slice(0, 10);

  return (
    <div className={`bg-zinc-900 border rounded-xl overflow-hidden ${isToday ? "border-blue-500/30" : "border-zinc-800"}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full text-left px-4 py-3 hover:bg-zinc-800/50 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{day.date}</span>
            {isToday && <span className="text-xs text-blue-400 border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 rounded-full">today</span>}
          </div>
          <span className="text-xs text-zinc-600">{lines.length} lines</span>
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-1 border-t border-zinc-800 pt-3 max-h-64 overflow-y-auto">
          {lines.map((line, i) => {
            if (line.startsWith("## ") || line.startsWith("### ")) return <div key={i} className="text-xs font-semibold text-zinc-400 mt-2">{line.replace(/^#+\s/, "")}</div>;
            if (line.startsWith("- ")) return <div key={i} className="text-xs text-zinc-400 flex gap-2"><span className="text-zinc-600">·</span><MarkdownText text={line.slice(2)} /></div>;
            return <div key={i} className="text-xs text-zinc-500"><MarkdownText text={line} /></div>;
          })}
        </div>
      )}
    </div>
  );
}


function FileTree({ nodes, expandedDirs, setExpandedDirs, onSelect, depth = 0 }: {
  nodes: FileNode[]; expandedDirs: Set<string>; depth?: number;
  setExpandedDirs: (fn: (prev: Set<string>) => Set<string>) => void;
  onSelect: (path: string) => void;
}) {
  return (
    <>
      {nodes.map(node => (
        <div key={node.path}>
          {node.type === "dir" ? (
            <>
              <button
                onClick={() => setExpandedDirs(prev => { const n = new Set(prev); n.has(node.path) ? n.delete(node.path) : n.add(node.path); return n; })}
                className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 text-xs"
                style={{ paddingLeft: `${8 + depth * 12}px` }}>
                <span>{expandedDirs.has(node.path) ? "▾" : "▸"}</span>
                <span>📁</span>
                <span>{node.name}</span>
              </button>
              {expandedDirs.has(node.path) && node.children && (
                <FileTree nodes={node.children} expandedDirs={expandedDirs} setExpandedDirs={setExpandedDirs} onSelect={onSelect} depth={depth + 1} />
              )}
            </>
          ) : (
            <button
              onClick={() => onSelect(node.path)}
              className="flex items-center gap-1.5 w-full text-left px-2 py-1 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 text-xs transition-colors"
              style={{ paddingLeft: `${8 + depth * 12}px` }}>
              <span>📄</span>
              <span className="truncate">{node.name}</span>
            </button>
          )}
        </div>
      ))}
    </>
  );
}

export default function MemoryPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-zinc-500 text-sm">Loading...</div>}>
      <MemoryPageInner />
    </Suspense>
  );
}

function MemoryPageInner() {
  const [section, setSection] = useState<Section>("memory");
  const [rules, setRules] = useState<Record<string,string>>({});
  const [memorySections, setMemorySections] = useState<{ title: string; content: string }[]>([]);
  const [ideas, setIdeas] = useState<{ title: string; content: string; priority: string }[]>([]);
  const [days, setDays] = useState<DayEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [openFile, setOpenFile] = useState<{path:string;content:string}|null>(null);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set([""]));
  const searchParams = useSearchParams();

  // Auto-open file from ?file= param
  useEffect(() => {
    const filePath = searchParams.get("file");
    if (filePath) {
      setSection("files");
      fetch(`/api/workspace/files?path=${encodeURIComponent(filePath)}`)
        .then(r => r.json())
        .then(d => setOpenFile(d));
    }
  }, [searchParams]);

  useEffect(() => {
    setLoading(true);
    if (section === "memory") {
      fetch("/api/workspace?section=memory").then(r => r.json()).then(d => {
        setMemorySections(parseMemorySections(d.content));
        setLoading(false);
      });
    } else if (section === "rules") {
      setLoading(true);
      fetch("/api/workspace?section=rules").then(r => r.json()).then(d => { setRules(d); setLoading(false); });
    } else if (section === "ideas") {
      fetch("/api/workspace?section=ideas").then(r => r.json()).then(d => {
        setIdeas(parseIdeas(d.content));
        setLoading(false);
      });
    } else if (section === "daily") {
      fetch("/api/workspace?section=daily").then(r => r.json()).then(d => {
        setDays(d.days);
        setLoading(false);
      });
    } else if (section === "files") {
      fetch("/api/workspace/files").then(r => r.json()).then(d => {
        setFileTree(d.tree || []);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [section]);

  const tabs: { id: Section; label: string; emoji: string }[] = [
    { id: "memory", label: "Memory", emoji: "🧠" },
    { id: "rules", label: "Rules", emoji: "⚙️" },
    { id: "ideas", label: "Ideas Board", emoji: "💡" },
    { id: "daily", label: "Daily Logs", emoji: "📅" },
    { id: "files", label: "My Files", emoji: "🗂️" },
  ];

  const filteredMemory = search
    ? memorySections.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.content.toLowerCase().includes(search.toLowerCase()))
    : memorySections;

  const filteredIdeas = search
    ? ideas.filter(i => i.title.toLowerCase().includes(search.toLowerCase()) || i.content.toLowerCase().includes(search.toLowerCase()))
    : ideas;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Memory</h1>
        <p className="text-zinc-500 text-sm">Everything Dave knows — long-term memory, ideas, and daily logs.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setSection(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors ${
              section === tab.id ? "bg-zinc-800 text-white border-zinc-700" : "text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white"
            }`}>
            <span>{tab.emoji}</span>{tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-300 placeholder-zinc-600 outline-none focus:border-zinc-600" />

      {loading && <p className="text-zinc-500 text-sm">Loading...</p>}

      {/* Memory sections */}
      {section === "memory" && !loading && (
        <div className="space-y-2">
          {filteredMemory.map((s, i) => <MemorySection key={i} title={s.title} content={s.content} />)}
        </div>
      )}

      {/* Rules */}
      {section === "rules" && !loading && (
        <div className="space-y-3">
          {Object.entries(rules).map(([key, content]) => (
            <div key={key} className="rounded-xl border border-zinc-800 bg-zinc-900/40">
              <div className="px-4 py-3 border-b border-zinc-800">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{
                  key === "heartbeat" ? "⏱ Heartbeat Rules" :
                  key === "agents" ? "🤖 Agent Behaviour" :
                  key === "soul" ? "✨ Soul (Who I Am)" :
                  key === "handoff" ? "🔁 Current Handoff" :
                  key === "tools" ? "🛠 Tools & Config" : key
                }</h3>
              </div>
              <pre className="px-4 py-3 text-xs text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">{content}</pre>
            </div>
          ))}
        </div>
      )}

      {/* Ideas */}
      {section === "ideas" && !loading && (
        <div className="space-y-2">
          {filteredIdeas.map((idea, i) => <IdeaCard key={i} idea={idea} />)}
        </div>
      )}

      {/* Files */}
      {section === "files" && !loading && (
        <div className="flex gap-4 min-h-96">
          <div className="w-56 shrink-0 space-y-0.5 overflow-y-auto">
            <FileTree nodes={fileTree} expandedDirs={expandedDirs} setExpandedDirs={setExpandedDirs} onSelect={(path) => {
              fetch(`/api/workspace/files?path=${encodeURIComponent(path)}`).then(r=>r.json()).then(d=>setOpenFile(d));
            }} />
          </div>
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl p-4 overflow-auto">
            {openFile ? (
              <>
                <div className="text-xs text-zinc-500 font-mono mb-3 pb-2 border-b border-zinc-800">{openFile.path}</div>
                <pre className="text-xs text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">{openFile.content}</pre>
              </>
            ) : (
              <p className="text-zinc-600 text-sm">Select a file to view</p>
            )}
          </div>
        </div>
      )}

      {/* Daily logs */}
      {section === "daily" && !loading && (
        <div className="space-y-2">
          {days.map(day => <DayLog key={day.date} day={day} />)}
        </div>
      )}
    </div>
  );
}

// Files browser — appended as separate export for /memory/files
export { }; 
