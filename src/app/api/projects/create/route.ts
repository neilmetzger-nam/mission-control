import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PROJECTS_PATH = path.join(process.cwd(), "data", "projects.json");
const SPRINTS_DIR = path.join(process.cwd(), "data", "sprints");

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { id, name, tagline, status, phase, url, repo, stack, color } = body;

  if (!id || !name) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }

  const raw = fs.readFileSync(PROJECTS_PATH, "utf-8");
  const projects = JSON.parse(raw);

  if (projects.some((p: { id: string }) => p.id === id)) {
    return NextResponse.json({ error: "Project ID already exists" }, { status: 409 });
  }

  const newProject = {
    id,
    name,
    tagline: tagline || "",
    status: status || "planned",
    phase: phase || "Ideation",
    url: url || null,
    repo: repo || null,
    stack: stack || [],
    color: color || "#6b7280",
  };

  projects.push(newProject);
  fs.writeFileSync(PROJECTS_PATH, JSON.stringify(projects, null, 2));

  // Create empty sprint file
  const sprintData = {
    projectId: id,
    milestones: [],
  };
  fs.writeFileSync(path.join(SPRINTS_DIR, `${id}.json`), JSON.stringify(sprintData, null, 2));

  return NextResponse.json(newProject, { status: 201 });
}
