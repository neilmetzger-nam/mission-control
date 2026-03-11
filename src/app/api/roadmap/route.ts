import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PROJECTS = [
  { id: "orion-mcp",   name: "Orion MCP",    emoji: "🧠", tagline: "HQ — intelligence layer for all products",  color: "indigo" },
  { id: "ai-r",        name: "AI-R Web",      emoji: "🍜", tagline: "Restaurant OS replacing POS + delivery",    color: "amber"  },
  { id: "time-trek",   name: "Time Trek",     emoji: "🏯", tagline: "Cinematic language learning game",          color: "violet" },
  { id: "plateai",     name: "PlateAI",       emoji: "📸", tagline: "Food photography SaaS for restaurants",     color: "emerald"},
  { id: "ember-azure", name: "Ember & Azure", emoji: "🔥", tagline: "Pan-Asian wood-fire restaurant, Leesburg",  color: "orange" },
];

export async function GET() {
  const projects = PROJECTS.map(p => {
    const path = join(process.cwd(), "data/sprints", `${p.id}.json`);
    const sprint = existsSync(path) ? JSON.parse(readFileSync(path, "utf-8")) : { milestones: [] };
    const milestones = sprint.milestones ?? [];
    const current = milestones.find((m: any) => m.status === "in-progress")
      ?? milestones.find((m: any) => m.status === "queued")
      ?? milestones[milestones.length - 1];
    const done = milestones.filter((m: any) => m.status === "done").length;
    const allTasks = milestones.flatMap((m: any) => (m.sprints ?? []).flatMap((s: any) => s.tasks ?? []));
    const openTasks = allTasks.filter((t: any) => t.status !== "done").length;
    return {
      ...p,
      milestones: milestones.map((m: any) => ({
        id: m.id, title: m.title, status: m.status,
        targetDate: m.targetDate, description: m.description,
        taskCount: (m.sprints ?? []).flatMap((s: any) => s.tasks ?? []).length,
        doneCount: (m.sprints ?? []).flatMap((s: any) => s.tasks ?? []).filter((t: any) => t.status === "done").length,
      })),
      currentMilestone: current ? { title: current.title, status: current.status, targetDate: current.targetDate } : null,
      milestoneDone: done,
      milestoneTotal: milestones.length,
      openTasks,
      updatedAt: sprint.updatedAt ?? null,
    };
  });
  return NextResponse.json({ projects });
}
