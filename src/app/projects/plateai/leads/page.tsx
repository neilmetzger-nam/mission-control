"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mail, Plus, Trash2, CheckCircle, Clock } from "lucide-react";

interface Lead {
  id: string;
  restaurantName: string;
  contactName: string;
  email: string;
  cuisine: string;
  dishCount: string;
  status: "new" | "contacted" | "converted" | "dead";
  notes: string;
  createdAt: string;
}

const STATUS_CONFIG = {
  new:       { label: "New",       style: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  contacted: { label: "Contacted", style: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  converted: { label: "Converted ✓", style: "bg-green-500/20 text-green-400 border-green-500/30" },
  dead:      { label: "Dead",      style: "bg-zinc-700/50 text-zinc-500 border-zinc-700" },
};

const STORAGE_KEY = "plateai-leads";

function loadLeads(): Lead[] {
  try {
    const s = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

function saveLeads(leads: Lead[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ restaurantName: "", contactName: "", email: "", cuisine: "", dishCount: "", notes: "" });

  useEffect(() => { setLeads(loadLeads()); }, []);

  function addLead() {
    if (!form.restaurantName || !form.email) return;
    const newLead: Lead = {
      id: Date.now().toString(),
      ...form,
      status: "new",
      createdAt: new Date().toISOString(),
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    saveLeads(updated);
    setForm({ restaurantName: "", contactName: "", email: "", cuisine: "", dishCount: "", notes: "" });
    setShowAdd(false);
  }

  function updateStatus(id: string, status: Lead["status"]) {
    const updated = leads.map(l => l.id === id ? { ...l, status } : l);
    setLeads(updated);
    saveLeads(updated);
  }

  function deleteLead(id: string) {
    const updated = leads.filter(l => l.id !== id);
    setLeads(updated);
    saveLeads(updated);
  }

  const counts = {
    new: leads.filter(l => l.status === "new").length,
    contacted: leads.filter(l => l.status === "contacted").length,
    converted: leads.filter(l => l.status === "converted").length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/projects/plateai" className="text-zinc-500 hover:text-zinc-300 text-sm">PlateAI</Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-300 text-sm">Leads</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Lead Tracker</h1>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{counts.new}</div>
            <div className="text-xs text-zinc-500 mt-1">New</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{counts.contacted}</div>
            <div className="text-xs text-zinc-500 mt-1">Contacted</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{counts.converted}</div>
            <div className="text-xs text-zinc-500 mt-1">Converted</div>
          </div>
        </div>

        {/* Add form */}
        {showAdd && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">Add Lead</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "restaurantName", label: "Restaurant Name *", placeholder: "The Urban Table" },
                { key: "contactName", label: "Contact Name", placeholder: "Maria" },
                { key: "email", label: "Email *", placeholder: "maria@restaurant.com" },
                { key: "cuisine", label: "Cuisine", placeholder: "Italian" },
                { key: "dishCount", label: "Dish Count", placeholder: "20–50" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{f.label}</label>
                  <input
                    type="text"
                    value={(form as Record<string,string>)[f.key]}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    placeholder={f.placeholder}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500"
                  />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-xs text-zinc-400 mb-1 block">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500 resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={addLead} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold text-white transition">Save Lead</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white transition">Cancel</button>
            </div>
          </div>
        )}

        {/* Lead list */}
        {leads.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <Mail size={40} className="mx-auto mb-4 opacity-30" />
            <p>No leads yet — first one&apos;s coming soon.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leads.map(lead => (
              <div key={lead.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">{lead.restaurantName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[lead.status].style}`}>
                      {STATUS_CONFIG[lead.status].label}
                    </span>
                  </div>
                  <div className="text-sm text-zinc-400">{lead.contactName} · {lead.email}</div>
                  {lead.cuisine && <div className="text-xs text-zinc-500 mt-1">{lead.cuisine} · {lead.dishCount} dishes</div>}
                  {lead.notes && <div className="text-xs text-zinc-500 mt-1 italic">{lead.notes}</div>}
                  <div className="text-xs text-zinc-600 mt-2 flex items-center gap-1">
                    <Clock size={10} /> {new Date(lead.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={e => updateStatus(lead.id, e.target.value as Lead["status"])}
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-300 outline-none"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="converted">Converted</option>
                    <option value="dead">Dead</option>
                  </select>
                  <button onClick={() => deleteLead(lead.id)} className="text-zinc-600 hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
