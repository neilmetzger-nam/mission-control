import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  const openai = new OpenAI();
  const { idea } = await req.json();

  if (!idea) {
    return NextResponse.json({ error: "idea is required" }, { status: 400 });
  }

  const systemPrompt = `You are an AI venture architect. Given a product idea, return a structured project plan as JSON with this exact shape:
{
  "name": "Project Name",
  "id": "kebab-case-id",
  "tagline": "One-line description",
  "color": "#hex color",
  "monetization": [
    { "tier": "Free", "description": "..." },
    { "tier": "Pro", "price": "$X/mo", "description": "..." },
    { "tier": "Enterprise", "price": "Custom", "description": "..." }
  ],
  "stack": [
    { "name": "Technology", "category": "frontend|backend|ai|infra", "hosting": "vercel|cloud-run|vercel+cloud-run" }
  ],
  "sharedCapabilities": ["Capability from existing portfolio projects that can be reused"],
  "milestones": [
    {
      "title": "Milestone name",
      "sprints": [
        {
          "title": "Sprint name",
          "tasks": [
            { "title": "Task description", "assignee": "agent|human|tbd" }
          ]
        }
      ]
    }
  ]
}
Return ONLY valid JSON, no markdown fences or explanation.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: idea },
      ],
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content || "";
    const plan = JSON.parse(content);
    return NextResponse.json(plan);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to generate plan";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
