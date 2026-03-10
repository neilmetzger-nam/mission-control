export default function ResearchPage() {
  const screenshots = [
    {
      file: "/research/square/square-ai-chatbot.jpg",
      title: "Square's AI — Sales Chatbot",
      quote: "Their AI exists to sell you Square products, not run your restaurant.",
      takeaway: "When asked about menu pricing strategy: 'I appreciate the question, but I'm specifically here to help with Square products. For menu analysis, you'd want to consult with a business consultant.'",
      label: "🔴 Their answer",
    },
    {
      file: "/research/square/square-ai-consultant-response.jpg",
      title: "Square AI: 'Go hire a consultant'",
      quote: "A restaurant owner asks about menu pricing strategy. Square AI tells them to hire a business consultant.",
      takeaway: "AI-R answer: 'Your Pad Thai margin dropped 4% — likely portion creep Thursday night. Your top upsell right now is Singha Beer at 73% conversion. Sarah is your best converter. Push it to all servers tonight?'",
      label: "🔴 vs ✅ Ours",
    },
    {
      file: "/research/square/square-ai-upsell-response.jpg",
      title: "Square AI: 'Upsell your top sellers'",
      quote: "Asked 'what should I upsell tonight?' — Square lists items that already sell the most. That's a popularity list, not an upsell strategy.",
      takeaway: "AI-R: pushes margin-aware suggestions directly to server phones at the table in real time. Square: shows owner a list and hopes they do something with it.",
      label: "🔴 vs ✅ Ours",
    },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">🔬 Competitive Research</h1>
        <p className="text-zinc-400 text-sm">Real screenshots from Square's AI — captured March 9, 2026. Use in /vs-square page and sales pitches.</p>
      </div>

      <div className="space-y-8">
        {screenshots.map((s, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800">
              <h2 className="text-lg font-semibold text-white">{s.title}</h2>
              <p className="text-sm text-zinc-400 mt-1">{s.quote}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.file} alt={s.title} className="rounded-lg w-full border border-zinc-700" />
              </div>
              <div className="p-4 flex flex-col justify-center">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">{s.label}</span>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  {s.takeaway}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-emerald-400 mb-2">💡 Key Insight</h2>
        <p className="text-sm text-zinc-300">
          Square's AI is a <strong className="text-white">sales chatbot</strong> dressed up as an analytics tool.
          It tells you what happened (backward-looking) and recommends you hire consultants or raise prices.
          AI-R tells you what to do <strong className="text-white">right now</strong> — and does it for your servers automatically.
        </p>
        <p className="text-sm text-zinc-400 mt-3">
          Use these screenshots in the <a href="/projects/ai-r/ideas" className="text-emerald-400 underline">/vs-square landing page</a> and investor decks.
        </p>
      </div>
    </div>
  );
}
