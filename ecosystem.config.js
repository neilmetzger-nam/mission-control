// PM2 ecosystem config for Mission Control
// Fixes EADDRINUSE crash loop by:
//   1. Running `next start` (single process) instead of `next dev` (spawns orphan-prone Turbopack workers)
//   2. Pre-start port cleanup script to kill any lingering process on 3001
//   3. Extended kill_timeout so next-server has time to release the port

const path = require("path");

module.exports = {
  apps: [
    {
      name: "mission-control",
      cwd: path.resolve(__dirname),
      script: "npx",
      args: "next start -p 3001 -H 0.0.0.0",
      interpreter: "none",

      // Kill the entire process tree (next-server children included)
      treekill: true,
      kill_timeout: 5000,

      // Restart policy: wait 3s between restarts, max 10 restarts in 60s
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: "10s",

      // Logging
      out_file: "/tmp/pm2-mission-control.log",
      error_file: "/tmp/pm2-mission-control-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // Environment
      env: {
        NODE_ENV: "production",
        PORT: "3001",
      },
    },
  ],
};
