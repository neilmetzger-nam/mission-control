"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";

export default function AirIssuesPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight mb-1">AI-R Issues</h1>
        <p className="text-zinc-500 text-sm">Bug tracking and feature requests</p>
      </div>

      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
        <p className="text-zinc-500 text-sm mb-3">
          AI-R issues are tracked in the main tracker.
        </p>
        <Link
          href="/tracker"
          className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Open Tracker <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </>
  );
}
