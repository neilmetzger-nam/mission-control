"use client";

import { useState, useEffect } from "react";
import { Clapperboard, UtensilsCrossed, ExternalLink } from "lucide-react";

interface ProjectData {
  id: string;
  name: string;
  product: string;
  description: string;
  entity: string;
  hosted: string;
  repo: string;
  stack: string;
  mcpTools: string;
  agents: string;
  status: string;
  icon: React.ElementType;
}

function parsePortfolio(raw: string): ProjectData[] {
  const projects: ProjectData[] = [];
  const sections = raw.split("### ").slice(1);

  for (const section of sections) {
    const lines = section.split("\n").filter((l) => l.trim());
    const titleLine = lines[0] ?? "";
    const isStudio = titleLine.includes("Studio");
    const isAir = titleLine.includes("AI-R");

    if (!isStudio && !isAir) continue;

    const fields: Record<string, string> = {};
    for (const line of lines.slice(1)) {
      const match = line.match(/^- \*\*(.+?):\*\*\s*(.+)/);
      if (match) fields[match[1]] = match[2];
    }

    projects.push({
      id: isStudio ? "studio" : "ai-r",
      name: isStudio ? "Prompt Studio" : "AI-R",
      product: fields["Product"] ?? "",
      description: fields["Description"] ?? "",
      entity: isStudio ? "Internal" : (fields["Entity"] ?? ""),
      hosted: fields["Hosted"] ?? "",
      repo: fields["Repo"] ?? "",
      stack: fields["Stack"] ?? "",
      mcpTools: fields["MCP Tools"] ?? "",
      agents: fields["Agents"] ?? "",
      status: fields["Status"] ?? "",
      icon: isStudio ? Clapperboard : UtensilsCrossed,
    });
  }
  return projects;
}

function StatusBadge({ status }: { status: string }) {
  const isActive = status.toLowerCase().includes("active");
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full border ${
        isActive
          ? "bg-green-500/20 text-green-400 border-green-500/30"
          : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      }`}
    >
      {isActive ? "active" : "blocked"}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/docs/content?path=" + encodeURIComponent(
      (typeof window !== "undefined" ? "" : "") +
      "/Users/neilmetzger/.openclaw/workspace/agency/PORTFOLIO.md"
    ))
      .then((r) => r.json())
      .then((data) => {
        if (data.content) {
          setProjects(parsePortfolio(data.content));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Projects</h1>
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">Projects</h1>
        <p className="text-zinc-500 text-sm">All client projects managed by the agency</p>
      </div>

      <div className="space-y-4">
        {projects.map((project) => {
          const Icon = project.icon;
          return (
            <a
              key={project.id}
              href="#"
              className="block bg-zinc-900 rounded-xl border border-zinc-800 p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-zinc-800">
                    <Icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="font-semibold">{project.name}</h2>
                    <p className="text-xs text-zinc-500">{project.entity}</p>
                  </div>
                </div>
                <StatusBadge status={project.status} />
              </div>

              {project.product && (
                <p className="text-sm text-blue-400 mb-2">{project.product}</p>
              )}
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{project.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {project.stack && (
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-zinc-500 block mb-1">Stack</span>
                    <span className="text-zinc-300">{project.stack}</span>
                  </div>
                )}
                {project.agents && (
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-zinc-500 block mb-1">Agents</span>
                    <span className="text-zinc-300">{project.agents}</span>
                  </div>
                )}
                {project.mcpTools && (
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-zinc-500 block mb-1">MCP Tools</span>
                    <span className="text-zinc-300">{project.mcpTools}</span>
                  </div>
                )}
                {project.hosted && (
                  <div className="bg-zinc-800/50 rounded-lg p-3">
                    <span className="text-zinc-500 block mb-1">Hosted</span>
                    <span className="text-zinc-300 flex items-center gap-1">
                      {project.hosted}
                      <ExternalLink className="w-3 h-3 text-zinc-500" />
                    </span>
                  </div>
                )}
              </div>

              {project.status && (
                <p className="text-xs text-zinc-500 mt-4 leading-relaxed">
                  <span className="text-zinc-600">Status:</span> {project.status}
                </p>
              )}
            </a>
          );
        })}
      </div>
    </>
  );
}
