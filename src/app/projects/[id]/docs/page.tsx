"use client";

import { use } from "react";
import Link from "next/link";

export default function ProjectDocsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-bold tracking-tight mb-2">{id.toUpperCase()} Docs</h1>
      <p className="text-zinc-500 text-sm mb-6">Docs coming soon</p>
      <Link
        href={`/projects/${id}`}
        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
      >
        {"\u2190"} Back to project
      </Link>
    </div>
  );
}
