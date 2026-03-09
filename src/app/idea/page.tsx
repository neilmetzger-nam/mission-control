"use client";

import { useState } from "react";
import Link from "next/link";

interface MonetizationTier {
  tier: string;
  price?: string;
  description: string;
}

interface StackItem {
  name: string;
  category: string;
  hosting: string;
}

interface Milestone {
  title: string;
  sprints: {
    title: string;
    tasks: { title: string; assignee: string }[];
  }[];
}

interface ProjectPlan {
  name: string;
  id: string;
  tagline: string;
  color: string;
  monetization: MonetizationTier[];
  stack: StackItem[];
  sharedCapabilities: string[];
  milestones: Milestone[];
}

function HostingBadge({ hosting }: { hosting: string }) {
  const styles: Record<string, string> = {
    vercel: "bg-green-500/20 text-green-400 border-green-500/30",
    "cloud-run": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "vercel+cloud-run": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${styles[hosting] || styles["cloud-run"]}`}>
      {hosting}
    </span>
  );
}

export default function IdeaPage() {
  const [idea, setIdea] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState<ProjectPlan | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedMilestone, setExpandedMilestone] = useState<number | null>(null);

  async function generate() {
    if (!idea.trim()) return;
    setLoading(true);
    setError("");
    setPlan(null);
    setSaved(false);

    try {
      const res = await fetch("/api/idea/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea }),
      });
      if (!res.ok) throw new Error("Failed to generate plan");
      const data = await res.json();
      setPlan(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function saveProject() {
    if (!plan) return;
    setSaving(true);

    try {
      const res = await fetch("/api/projects/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: plan.id,
          name: plan.name,
          tagline: plan.tagline,
          status: "planned",
          phase: "Ideation",
          stack: plan.stack.map((s) => s.name),
          color: plan.color,
        }),
      });
      if (!res.ok) throw new Error("Failed to save project");
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{"\u{1F4A1}"} New Idea</h1>
        <p className="text-zinc-500 text-sm">Describe your idea and let AI generate a project plan</p>
      </div>

      {/* Input */}
      <div className="mb-6">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea..."
          rows={4}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
        />
        <button
          onClick={generate}
          disabled={loading || !idea.trim()}
          className="mt-3 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? "Generating..." : "Generate Project Plan"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <div className="animate-pulse text-zinc-500 text-sm">Thinking through your idea...</div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Result */}
      {plan && (
        <div className="space-y-4">
          {/* Header */}
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5" style={{ borderLeftColor: plan.color, borderLeftWidth: "3px" }}>
            <h2 className="text-lg font-bold mb-1">{plan.name}</h2>
            <p className="text-sm text-zinc-400">{plan.tagline}</p>
          </div>

          {/* Monetization */}
          {plan.monetization && plan.monetization.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Monetization</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {plan.monetization.map((tier) => (
                  <div key={tier.tier} className="bg-zinc-800/50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{tier.tier}</span>
                      {tier.price && <span className="text-xs text-green-400">{tier.price}</span>}
                    </div>
                    <p className="text-xs text-zinc-500">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stack */}
          {plan.stack && plan.stack.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Stack</h3>
              <div className="flex flex-wrap gap-2">
                {plan.stack.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 bg-zinc-800/50 rounded-lg px-3 py-1.5">
                    <span className="text-xs text-zinc-300">{item.name}</span>
                    <HostingBadge hosting={item.hosting} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shared Capabilities */}
          {plan.sharedCapabilities && plan.sharedCapabilities.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Shared Capabilities</h3>
              <ul className="space-y-1">
                {plan.sharedCapabilities.map((cap, i) => (
                  <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">{"\u2713"}</span>
                    {cap}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Milestones */}
          {plan.milestones && plan.milestones.length > 0 && (
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Milestones</h3>
              <div className="space-y-2">
                {plan.milestones.map((ms, mi) => (
                  <div key={mi} className="border border-zinc-800 rounded-lg">
                    <button
                      onClick={() => setExpandedMilestone(expandedMilestone === mi ? null : mi)}
                      className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800/50"
                    >
                      {ms.title}
                      <span className="text-zinc-600 text-xs">
                        {ms.sprints.reduce((a, s) => a + s.tasks.length, 0)} tasks
                      </span>
                    </button>
                    {expandedMilestone === mi && (
                      <div className="px-4 pb-3 space-y-3">
                        {ms.sprints.map((sprint, si) => (
                          <div key={si}>
                            <div className="text-xs text-zinc-500 font-medium mb-1.5">{sprint.title}</div>
                            <div className="space-y-1">
                              {sprint.tasks.map((task, ti) => (
                                <div key={ti} className="flex items-center gap-2 text-xs text-zinc-400 pl-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                                  <span className="flex-1">{task.title}</span>
                                  <span className="text-[10px] text-zinc-600">
                                    {task.assignee === "agent" ? "\u{1F916}" : task.assignee === "human" ? "\u{1F464}" : "\u2753"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save */}
          {!saved ? (
            <button
              onClick={saveProject}
              disabled={saving}
              className="w-full px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {saving ? "Saving..." : "Save as Project"}
            </button>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-center">
              <span className="text-green-400 text-sm font-medium">Project saved!</span>
              <Link href={`/projects/${plan.id}/sprints`} className="block text-xs text-green-400/70 mt-1 hover:text-green-300">
                View sprint board {"\u2192"}
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}
