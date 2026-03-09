"use client";

import { useState, useEffect, use } from "react";

interface ReviewItem {
  id: string;
  projectId: string;
  taskId: string;
  title: string;
  agent: string;
  summary: string;
  output: string;
  status: string;
  createdAt: string;
}

function ProjectBadge({ projectId }: { projectId: string }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
      {projectId}
    </span>
  );
}

export default function ProjectReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/review")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setItems(d.filter((i: ReviewItem) => i.projectId === id));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function updateStatus(itemId: string, status: string) {
    const res = await fetch(`/api/review/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, status } : i)));
    }
  }

  const pendingItems = items.filter((i) => i.status === "pending");
  const resolvedItems = items.filter((i) => i.status !== "pending");

  if (loading) {
    return <div className="text-center py-12 text-zinc-500 text-sm">Loading review queue...</div>;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-1">{id.toUpperCase()} Review Queue</h1>
        <p className="text-zinc-500 text-sm">
          {pendingItems.length} item{pendingItems.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {pendingItems.length === 0 && resolvedItems.length === 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <p className="text-zinc-500 text-sm">No items awaiting review for this project</p>
        </div>
      )}

      {pendingItems.length > 0 && (
        <div className="space-y-4 mb-8">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ProjectBadge projectId={item.projectId} />
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>
              <div className="mb-2">
                <span className="text-xs text-zinc-500">Agent: </span>
                <span className="text-xs text-zinc-300">{item.agent}</span>
              </div>
              <p className="text-xs text-zinc-400 mb-2">{item.summary}</p>
              <p className="text-[10px] text-zinc-600 mb-4">{item.output}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => updateStatus(item.id, "approved")}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors"
                >
                  {"\u2705"} Approve
                </button>
                <button
                  onClick={() => updateStatus(item.id, "changes-requested")}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded-lg transition-colors"
                >
                  {"\u{1F504}"} Request Changes
                </button>
                <button
                  onClick={() => updateStatus(item.id, "rejected")}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors"
                >
                  {"\u274C"} Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolvedItems.length > 0 && (
        <>
          <h2 className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-3">Resolved</h2>
          <div className="space-y-2">
            {resolvedItems.map((item) => (
              <div key={item.id} className="bg-zinc-900/50 rounded-xl border border-zinc-800/50 p-4 flex items-center gap-3">
                <ProjectBadge projectId={item.projectId} />
                <span className="text-sm text-zinc-500 flex-1">{item.title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500">{item.status}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
