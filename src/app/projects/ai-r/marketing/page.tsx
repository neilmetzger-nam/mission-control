"use client";
import { useState, useEffect } from "react";

export default function AIRMarketingPage() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/api/workspace?section=project-docs&project=ai-r")
      .then(r => r.json())
      .then(d => {
        const gtm = d.files?.find((f: {name:string;content:string}) => f.name.includes("go-to-market"));
        if (gtm) setContent(gtm.content);
      });
  }, []);

  const sections = content.split("\n## ").slice(1).map(s => {
    const lines = s.split("\n");
    return { title: lines[0], body: lines.slice(1).join("\n") };
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold mb-1">AI-R — Go-To-Market</h1>
        <p className="text-zinc-500 text-sm">Build in public → HN launch → beta customers → scale</p>
      </div>

      {/* Core message */}
      <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-orange-400 mb-1">The Hook</p>
        <p className="text-zinc-300 text-sm">"AI-R replaces your POS, ordering site, and scheduling tools with one AI platform — $70/mo, works with your hardware, and you own every customer."</p>
        <p className="text-zinc-500 text-xs mt-2">⚠️ Do NOT claim &quot;save 30% on commissions&quot; — see Brand Guide for correct DoorDash positioning.</p>
      </div>

      {sections.map((s, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="font-semibold mb-3 text-white">{s.title}</h2>
          <div className="space-y-1.5">
            {s.body.split("\n").filter(l => l.trim()).map((line, j) => {
              if (line.startsWith("### ")) return <h3 key={j} className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mt-3">{line.replace("### ","")}</h3>;
              if (line.startsWith("- **")) {
                const [label, ...rest] = line.slice(2).split(":**");
                return <div key={j} className="text-xs flex gap-2"><span className="text-white font-medium shrink-0">{label.replace("**","")}:</span><span className="text-zinc-400">{rest.join(":**")}</span></div>;
              }
              if (line.startsWith("- ")) return <div key={j} className="text-xs text-zinc-400 flex gap-2"><span className="text-zinc-600 shrink-0">·</span><span>{line.slice(2)}</span></div>;
              if (line.startsWith("**")) return <p key={j} className="text-xs text-zinc-300 font-medium">{line.replace(/\*\*/g,"")}</p>;
              return <p key={j} className="text-xs text-zinc-500">{line}</p>;
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
