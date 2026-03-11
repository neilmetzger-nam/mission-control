"use client";

import { useState, useEffect, useCallback } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock, Package, Rocket } from "lucide-react";

interface Task {
  id: string;
  title: string;
  status: string;
  assignee?: string;
  migration_notes?: string;
  sprintTitle: string;
  milestoneTitle: string;
  projectId: string;
}

interface Sprint {
  id: string;
  title: string;
  tasks: Task[];
}

interface Milestone {
  id: string;
  title: string;
  sprints: Sprint[];
}

interface SprintData {
  projectId: string;
  updatedAt?: string;
  milestones: Milestone[];
}

const PROJECTS = ["ai-r", "orion-mcp", "plateai", "time-trek", "ember-azure"];

export default function EngineeringPage() {
  const [readyTasks, setReadyTasks] = useState<Task[]>([]);
  const [stagingTasks, setStagingTasks] = useState<Task[]>([]);
  const [recentDone, setRecentDone] = useState<Task[]>([]);
  const [obieTasks, setObieTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<string>("");

  const fetchAll = useCallback(async () => {
    const allTasks: Task[] = [];
    let latestUpdate = "";

    for (const projectId of PROJECTS) {
      try {
        const res = await fetch(`/api/sprints/${projectId}`);

        if (!res.ok) continue;

        const data: SprintData = await res.json();

        if (data.updatedAt && data.updatedAt > latestUpdate) {
          latestUpdate = data.updatedAt;
        }

        for (const m of data.milestones) {
          for (const s of m.sprints) {
            for (const t of s.tasks) {
              allTasks.push({
                ...t,
                sprintTitle: s.title,
                milestoneTitle: m.title,
                projectId,
              });
            }
          }
        }
      } catch {
        // skip missing projects
      }
    }

    setReadyTasks(allTasks.filter((t) => t.status === "ready_for_staging"));
    setStagingTasks(allTasks.filter((t) => t.status === "in_staging"));
    setRecentDone(
      allTasks
        .filter((t) => t.status === "done" || t.status === "in_prod")
        .slice(-10)
        .reverse(),
    );
    setObieTasks(allTasks.filter((t) => t.assignee === "obie"));
    setUpdatedAt(latestUpdate);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-500">Loading engineering handoff...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-8 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Engineering Handoff — AI-R
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Tasks ready for staging, migration notes, and deployment status
              </p>
            </div>
            {updatedAt && (
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Clock className="w-3 h-3" />
                Last updated: {updatedAt}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-8 space-y-10">
        {/* Section 1: Ready for Staging */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold">Ready for Staging</h2>
            {readyTasks.length > 0 && (
              <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {readyTasks.length}
              </span>
            )}
          </div>

          {readyTasks.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <p className="text-zinc-500">
                Nothing queued for staging right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {readyTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {task.projectId} &middot; {task.milestoneTitle} &middot;{" "}
                        {task.sprintTitle}
                      </p>
                    </div>
                    <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-1 rounded-full whitespace-nowrap">
                      ready for staging
                    </span>
                  </div>
                  {task.migration_notes && (
                    <div className="mt-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-yellow-400 mb-0.5">
                          Migration Required
                        </p>
                        <p className="text-xs text-yellow-300/80">
                          {task.migration_notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 2: In Staging */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-bold">In Staging</h2>
            {stagingTasks.length > 0 && (
              <span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {stagingTasks.length}
              </span>
            )}
          </div>

          {stagingTasks.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-500 text-sm">
                Nothing in staging right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {stagingTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {task.projectId} &middot; {task.sprintTitle}
                    </p>
                  </div>
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-1 rounded-full">
                    in staging
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 3: Recently Shipped */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h2 className="text-lg font-bold">Recently Shipped</h2>
          </div>

          {recentDone.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-500 text-sm">No completed tasks yet.</p>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
              {recentDone.map((task, i) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i < recentDone.length - 1
                      ? "border-b border-zinc-800/50"
                      : ""
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500/50 shrink-0" />
                  <span className="flex-1 text-sm text-zinc-400">
                    {task.title}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {task.projectId}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Section 4: Obie's Queue */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ArrowRight className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold">Obie&apos;s Queue</h2>
            {obieTasks.length > 0 && (
              <span className="bg-purple-500/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full">
                {obieTasks.length}
              </span>
            )}
          </div>

          {obieTasks.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-zinc-500 text-sm">
                No tasks assigned to Obie right now.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {obieTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-zinc-900 border border-purple-500/20 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium">{task.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      {task.projectId} &middot; {task.sprintTitle}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-zinc-700 text-zinc-300">
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-zinc-800 px-8 py-6 mt-8">
        <p className="text-xs text-zinc-600 text-center">
          Mission Control &mdash; mc.ai-restaurant.net
        </p>
      </footer>
    </div>
  );
}
