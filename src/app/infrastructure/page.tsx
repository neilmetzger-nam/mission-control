export default function InfrastructurePage() {
  const piTailscaleIp = "100.68.30.87";
  const macMiniIp = "100.101.120.24";

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">Infrastructure</h1>
        <p className="text-zinc-400 text-sm">Red Bar Sushi · 525 E Market St, Leesburg VA</p>
      </div>

      {/* Pi Print Server */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">🥧 Pi Print Server</h2>
          <a href={`http://${piTailscaleIp}:3333/status`} target="_blank" rel="noopener noreferrer"
            className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full hover:bg-green-500/20 transition">
            Check Status ↗
          </a>
        </div>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-800">
            {[
              ["Hostname", "air525market"],
              ["Local IP", "192.168.1.74"],
              ["Tailscale IP", piTailscaleIp],
              ["SSH User", "air"],
              ["SSH Password", "Redbar2026$"],
              ["Print Server", `http://${piTailscaleIp}:3333/status`],
              ["Restart", "sudo systemctl restart air-box"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="py-2 pr-4 text-zinc-400 w-40">{k}</td>
                <td className="py-2 text-zinc-100 font-mono text-xs">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Tailscale Network */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">🔒 Tailscale Network</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wide">
              <th className="text-left py-2 pr-4">Device</th>
              <th className="text-left py-2 pr-4">Tailscale IP</th>
              <th className="text-left py-2">OS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {[
              ["Mac mini (home)", macMiniIp, "macOS"],
              ["Pi (restaurant)", piTailscaleIp, "Linux"],
              ["iPhone", "100.66.248.95", "iOS"],
              ["Laptop", "100.127.86.107", "macOS (offline)"],
            ].map(([device, ip, os]) => (
              <tr key={device}>
                <td className="py-2 pr-4 text-zinc-100">{device}</td>
                <td className="py-2 pr-4 text-zinc-100 font-mono text-xs">{ip}</td>
                <td className="py-2 text-zinc-400 text-xs">{os}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Square Terminals */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">💳 Square Terminals</h2>
        <p className="text-xs text-zinc-500">Location: Sushi & Thai - Leesburg · <span className="font-mono">L4BMAT2DZWQP0</span></p>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-zinc-500 text-xs uppercase tracking-wide">
              <th className="text-left py-2 pr-4">Terminal</th>
              <th className="text-left py-2 pr-4">Device ID</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {[
              ["Handheld 0346", "516WS21606100346", "✅ Terminal API paired"],
              ["Handheld 0686", "516WS21606100686", "⏳ Logged in — API pairing pending"],
              ["S700 (order)", "TBD", "🛒 $299 at dashboard.stripe.com/terminal/shop"],
            ].map(([name, id, status]) => (
              <tr key={name}>
                <td className="py-2 pr-4 text-zinc-100">{name}</td>
                <td className="py-2 pr-4 text-zinc-400 font-mono text-xs">{id}</td>
                <td className="py-2 text-zinc-300 text-xs">{status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Dev Servers */}
      <section className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">🖥️ Dev Servers</h2>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-zinc-800">
            {[
              ["AIR-Web (Tailscale)", `http://neils-mac-mini.tail45495a.ts.net:3000`],
              ["Mission Control", "http://localhost:3002"],
              ["Router Admin", "http://192.168.1.1"],
            ].map(([k, v]) => (
              <tr key={k}>
                <td className="py-2 pr-4 text-zinc-400 w-48">{k}</td>
                <td className="py-2 text-zinc-100 font-mono text-xs">
                  <a href={v} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition">{v}</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
