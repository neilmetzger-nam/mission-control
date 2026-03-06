"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Plus, Trash2 } from "lucide-react";

interface Customer {
  id: string;
  restaurantName: string;
  contactName: string;
  email: string;
  plan: "starter" | "pro" | "studio";
  status: "active" | "churned" | "trial";
  startDate: string;
  notes: string;
}

const PLAN_CONFIG = {
  starter: { label: "Starter", price: 49, style: "bg-zinc-700/50 text-zinc-300 border-zinc-600" },
  pro:     { label: "Pro",     price: 99, style: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  studio:  { label: "Studio",  price: 199, style: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const STATUS_CONFIG = {
  active:  { label: "Active",  style: "bg-green-500/20 text-green-400 border-green-500/30" },
  trial:   { label: "Trial",   style: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  churned: { label: "Churned", style: "bg-red-500/20 text-red-400 border-red-500/30" },
};

const STORAGE_KEY = "plateai-customers";

function load(): Customer[] {
  try {
    const s = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    return s ? JSON.parse(s) : [];
  } catch { return []; }
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ restaurantName: "", contactName: "", email: "", plan: "starter" as Customer["plan"], notes: "" });

  useEffect(() => { setCustomers(load()); }, []);

  function save(c: Customer[]) {
    setCustomers(c);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  }

  function add() {
    if (!form.restaurantName || !form.email) return;
    save([{ id: Date.now().toString(), ...form, status: "trial", startDate: new Date().toISOString() }, ...customers]);
    setForm({ restaurantName: "", contactName: "", email: "", plan: "starter", notes: "" });
    setShowAdd(false);
  }

  const mrr = customers.filter(c => c.status === "active").reduce((sum, c) => sum + PLAN_CONFIG[c.plan].price, 0);
  const arr = mrr * 12;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Link href="/projects/plateai" className="text-zinc-500 hover:text-zinc-300 text-sm">PlateAI</Link>
              <span className="text-zinc-700">/</span>
              <span className="text-zinc-300 text-sm">Customers</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Customers</h1>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold transition">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <DollarSign size={18} className="text-green-400 mb-2" />
            <div className="text-2xl font-bold text-white">${mrr}<span className="text-sm text-zinc-500">/mo</span></div>
            <div className="text-xs text-zinc-500 mt-1">MRR</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <DollarSign size={18} className="text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-white">${arr.toLocaleString()}</div>
            <div className="text-xs text-zinc-500 mt-1">ARR</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <DollarSign size={18} className="text-orange-400 mb-2" />
            <div className="text-2xl font-bold text-white">{customers.filter(c => c.status === "active").length}</div>
            <div className="text-xs text-zinc-500 mt-1">Active Customers</div>
          </div>
        </div>

        {showAdd && (
          <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-4">Add Customer</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: "restaurantName", label: "Restaurant *", placeholder: "" },
                { key: "contactName", label: "Contact", placeholder: "" },
                { key: "email", label: "Email *", placeholder: "" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-zinc-400 mb-1 block">{f.label}</label>
                  <input type="text" value={(form as Record<string,string>)[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-orange-500" />
                </div>
              ))}
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Plan</label>
                <select value={form.plan} onChange={e => setForm({ ...form, plan: e.target.value as Customer["plan"] })}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white outline-none">
                  <option value="starter">Starter — $49/mo</option>
                  <option value="pro">Pro — $99/mo</option>
                  <option value="studio">Studio — $199/mo</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={add} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg text-sm font-semibold text-white transition">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border border-zinc-700 rounded-lg text-sm text-zinc-400 hover:text-white transition">Cancel</button>
            </div>
          </div>
        )}

        {customers.length === 0 ? (
          <div className="text-center py-20 text-zinc-500">
            <DollarSign size={40} className="mx-auto mb-4 opacity-30" />
            <p>No customers yet — first one&apos;s coming.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {customers.map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-semibold text-white">{c.restaurantName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_CONFIG[c.status].style}`}>{STATUS_CONFIG[c.status].label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PLAN_CONFIG[c.plan].style}`}>{PLAN_CONFIG[c.plan].label} · ${PLAN_CONFIG[c.plan].price}/mo</span>
                  </div>
                  <div className="text-sm text-zinc-400">{c.contactName} · {c.email}</div>
                </div>
                <button onClick={() => { const u = customers.filter(x => x.id !== c.id); setCustomers(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); }} className="text-zinc-600 hover:text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
