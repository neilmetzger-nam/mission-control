"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Project {
  id: string;
  name: string;
  tagline: string;
  status: string;
  phase: string;
  stack: string[];
  color: string;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-green-500/20 text-green-400 border-green-500/30",
    planned: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
    paused: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${styles[status] || styles.planned}`}>
      {status}
    </span>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setProjects(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-zinc-500 text-sm">Loading projects...</div>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{"\u{1F4C1}"} Projects</h1>
        <p className="text-zinc-500 text-sm">{projects.length} projects in portfolio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}/sprints`}
            className="group bg-zinc-900 rounded-xl border border-zinc-800 p-5 hover:border-zinc-600 transition-all"
            style={{ borderLeftColor: project.color, borderLeftWidth: "3px" }}
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-sm">{project.name}</h3>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-zinc-500 mb-3">{project.tagline}</p>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                {project.phase}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {project.stack.map((tech) => (
                <span key={tech} className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-500">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-600">View sprints</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-zinc-400" />
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
