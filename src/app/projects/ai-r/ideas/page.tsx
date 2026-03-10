"use client";

import { useState } from "react";

const IDEAS = [
  {
    category: "Upsell Engine", emoji: "💡",
    items: [
      { title: "Item-triggered suggestion cards on phone POS", detail: "Hardcoded Red Bar pairings. Server adds item → card slides up with suggestion.", status: "in-sprint" },
      { title: "Co-purchase SQL analysis", detail: "Nightly job refreshes rules from real order data.", status: "queued" },
      { title: "Liam auto-generates pairings on menu import", detail: "Owner approves/rejects AI suggestions before they go live.", status: "queued" },
      { title: "/home/upsells control panel", detail: "Table of all rules, conversion rates, on/off toggle per time of day.", status: "queued" },
      { title: "Vino — wine pairing agent", detail: "Paste wine list → Liam maps every wine to compatible dishes → auto-loads into upsell rules.", status: "idea" },
      { title: "Server personalization", detail: "Track accept/dismiss per server. Push rules each server converts best.", status: "idea" },
    ]
  },
  {
    category: "Ambient Listener", emoji: "🎤",
    items: [
      { title: "Silent suggestion cards on phone", detail: "No earpiece — pop up silently on server's phone during table interaction.", status: "queued" },
      { title: "Whisper transcription", detail: "Server phone mic in background. Cross-reference what customer said vs what server entered.", status: "idea" },
      { title: "QR scan → order history", detail: "When diner scans QR, ambient listener knows what they ordered before.", status: "idea" },
      { title: "Daily specials context injection", detail: "Maestro always knows today's specials, 86 list, high-margin items.", status: "in-sprint" },
    ]
  },
  {
    category: "Lead Gen Tools", emoji: "🎣",
    items: [
      { title: "Chargeback Fighter — public tool", detail: "Upload delivery statement → AI finds recoverable charges → show $ before signup.", status: "queued" },
      { title: "Delivery Fee Calculator", detail: "Enter monthly volume → see exact commission cost → email capture for full report.", status: "queued" },
      { title: "PlateAI — free food photos", detail: "Upload CSV → 5 free AI food photos auto-populate Gloria page. Want more → sign up.", status: "queued" },
      { title: "Demo image generation hook", detail: "After Gloria page: 'Add your photos to make it yours.' Emotional moment that drives signup.", status: "idea" },
      { title: "DoorDash driver referral network", detail: "Drivers talk to managers every day. Referral fee per signup.", status: "idea" },
    ]
  },
  {
    category: "SEO / Content", emoji: "🔍",
    items: [
      { title: "/vs-toast — AI-R vs Toast POS", detail: "Target exact Google searches restaurant owners are doing.", status: "idea" },
      { title: "/vs-doordash — zero commission vs 30%", detail: "Intercept owners searching for DoorDash alternatives.", status: "idea" },
      { title: "/vs-square — AI-R vs Square", detail: "High volume search term, clear differentiation.", status: "idea" },
    ]
  },
  {
    category: "Demo Flow", emoji: "🎬",
    items: [
      { title: "CSV → Gloria → Setup Planner flow", detail: "Seamless demo payoff. No gates, no pressure.", status: "queued" },
      { title: "Value comparison on landing page", detail: "$1,000+/mo value at $70/mo. Show the math, not a feature list.", status: "queued" },
    ]
  },
];

const STATUS_STYLES: Record<string, string> = {
  "in-sprint": "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
  "queued": "bg-amber-500/20 text-amber-400 border border-amber-500/30",
  "idea": "bg-zinc-700 text-zinc-400 border border-zinc-600",
  "done": "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
};

const STATUS_LABEL: Record<string, string> = {
  "in-sprint": "In Sprint", "queued": "Queued", "idea": "Idea", "done": "Done",
};

export default function IdeasPage() {
  const [filter, setFilter] = useState("all");
  const categories = ["all", ...IDEAS.map(i => i.category)];
  const filtered = filter === "all" ? IDEAS : IDEAS.filter(i => i.category === filter);
  const totalIdeas = IDEAS.reduce((s, c) => s + c.items.length, 0);
  const inSprint = IDEAS.reduce((s, c) => s + c.items.filter(i => i.status === "in-sprint").length, 0);
  const queued = IDEAS.reduce((s, c) => s + c.items.filter(i => i.status === "queued").length, 0);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">💡 AI-R Ideas Board</h1>
        <p className="text-zinc-400 text-sm">Feature ideas captured from sessions. Everything tracked, nothing lost.</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[["Total Ideas", totalIdeas, "text-white"], ["In Sprint", inSprint, "text-cyan-400"], ["Queued", queued, "text-amber-400"]].map(([label, val, color]) => (
          <div key={label as string} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{val}</p>
          </div>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === cat ? "bg-zinc-700 text-white" : "bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800"}`}>
            {cat === "all" ? "All" : cat}
          </button>
        ))}
      </div>
      <div className="space-y-6">
        {filtered.map(category => (
          <div key={category.category}>
            <h2 className="text-lg font-semibold text-white mb-3">{category.emoji} {category.category}</h2>
            <div className="space-y-2">
              {category.items.map((item, i) => (
                <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.title}</p>
                    <p className="text-xs text-zinc-500 mt-1">{item.detail}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium whitespace-nowrap ${STATUS_STYLES[item.status]}`}>
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
