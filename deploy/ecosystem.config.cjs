// PM2 ecosystem for OpenGate + 9Router + Bot on a single VPS.
//
// Layout:
//   /opt/opengate   — this repo
//   /opt/9router    — git clone https://github.com/decolua/9router (build first)
//
// Bring up:
//   pm2 start deploy/ecosystem.config.cjs
//   pm2 save
//   pm2 startup       # one-time: enable boot persistence
//
// Logs:
//   pm2 logs opengate
//   pm2 logs opengate-bot
//   pm2 logs 9router
//
// Restart after pulling:
//   pm2 reload opengate
//   pm2 reload opengate-bot
//   pm2 reload 9router

module.exports = {
  apps: [
    {
      name: "opengate",
      cwd: "/opt/opengate",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "512M",
      autorestart: true,
      watch: false,
      merge_logs: true,
      time: true,
    },
    {
      name: "opengate-bot",
      cwd: "/opt/opengate",
      script: "bot/start.js",
      env: {
        NODE_ENV: "production",
      },
      max_memory_restart: "256M",
      autorestart: true,
      watch: false,
      merge_logs: true,
      time: true,
    },
    {
      name: "9router",
      cwd: "/opt/9router",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: "20128",
        HOSTNAME: "127.0.0.1",
        DATA_DIR: "/var/lib/9router",
        REQUIRE_API_KEY: "true",
        AUTH_COOKIE_SECURE: "true",
        BASE_URL: "http://localhost:20128",
      },
      max_memory_restart: "1G",
      autorestart: true,
      watch: false,
      merge_logs: true,
      time: true,
    },
  ],
};
