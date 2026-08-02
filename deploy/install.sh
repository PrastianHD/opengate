#!/usr/bin/env bash
# deploy/install.sh
#
# One-shot bootstrap for OpenGate + 9Router VPS (Ubuntu 22.04 / 24.04).
# Run as deploy user (not root). Sudo is invoked where needed.
# Idempotent — re-running is safe.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/PrastianHD/opengate/main/deploy/install.sh | bash

set -euo pipefail

# ── Config ──
OPENGATE_REPO="${OPENGATE_REPO:-https://github.com/PrastianHD/opengate.git}"
OPENGATE_DIR="${OPENGATE_DIR:-/opt/opengate}"
OPENGATE_REF="${OPENGATE_REF:-main}"

NINEROUTER_REPO="${NINEROUTER_REPO:-https://github.com/decolua/9router.git}"
NINEROUTER_DIR="${NINEROUTER_DIR:-/opt/9router}"
NINEROUTER_REF="${NINEROUTER_REF:-main}"

NODE_VERSION="${NODE_VERSION:-22}"

# ── Helpers ──
log()  { printf '\033[1;36m▶\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m!\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31m✗\033[0m %s\n' "$*" >&2; exit 1; }
require_cmd() { command -v "$1" >/dev/null 2>&1; }

# ── Preflight ──
[ "$(id -u)" -ne 0 ] || die "Run as deploy user, not root."
require_cmd sudo || die "sudo required."
require_cmd curl || sudo apt-get install -y curl

# ── 1. System packages ──
log "Installing system packages..."
sudo apt-get update -y
sudo apt-get install -y \
  curl git build-essential ca-certificates \
  gnupg ufw nginx

# ── 2. Node.js $NODE_VERSION ──
if ! require_cmd node || [ "$(node -v | sed 's/v//;s/\..*//')" -lt "$NODE_VERSION" ]; then
  log "Installing Node.js $NODE_VERSION..."
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  log "Node $(node -v) already installed"
fi

# ── 3. PM2 ──
if ! require_cmd pm2; then
  log "Installing PM2..."
  sudo npm install -g pm2
else
  log "PM2 $(pm2 -v) already installed"
fi

# ── 4. Firewall ──
log "Configuring firewall..."
sudo ufw allow 22/tcp   comment "SSH"
sudo ufw allow 80/tcp   comment "HTTP"
sudo ufw allow 443/tcp  comment "HTTPS"
sudo ufw allow 3000/tcp comment "OpenGate"
sudo ufw allow 20128/tcp comment "9Router"
sudo ufw --force enable

# ── 5. State directories ──
log "Preparing directories..."
sudo mkdir -p /opt
sudo chown -R "$USER:$USER" /opt

# ── 6. Clone / update OpenGate ──
if [ -d "$OPENGATE_DIR/.git" ]; then
  log "Updating OpenGate..."
  git -C "$OPENGATE_DIR" fetch --tags origin
  git -C "$OPENGATE_DIR" checkout "$OPENGATE_REF"
  git -C "$OPENGATE_DIR" pull --ff-only || true
else
  log "Cloning OpenGate..."
  git clone --branch "$OPENGATE_REF" "$OPENGATE_REPO" "$OPENGATE_DIR"
fi

# ── 7. Clone / update 9Router ──
if [ -d "$NINEROUTER_DIR/.git" ]; then
  log "Updating 9Router..."
  git -C "$NINEROUTER_DIR" fetch --tags origin
  git -C "$NINEROUTER_DIR" checkout "$NINEROUTER_REF"
  git -C "$NINEROUTER_DIR" pull --ff-only || true
else
  log "Cloning 9Router..."
  git clone "$NINEROUTER_REPO" "$NINEROUTER_DIR"
  git -C "$NINEROUTER_DIR" checkout "$NINEROUTER_REF"
fi

# ── 8. Build OpenGate ──
log "Installing OpenGate deps..."
( cd "$OPENGATE_DIR" && npm ci )

if [ ! -f "$OPENGATE_DIR/.env.local" ]; then
  warn "Creating .env.local template — fill secrets before starting!"
  cat > "$OPENGATE_DIR/.env.local" << 'ENVEOF'
# ── Supabase ──
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# ── Gateway ──
GATEWAY_DEFAULT_RPM=200
GATEWAY_KEY_HASH_SALT=CHANGE_ME
UPSTREAM_KEY_ENCRYPTION_KEY=CHANGE_ME

# ── Rate Limiting (Upstash Redis) ──
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# ── 9Router Upstream ──
ROUTER_URL=http://localhost:20128
ROUTER_MASTER_KEY=sk-YOUR_ROUTER_KEY

# ── Telegram Bot ──
TELEGRAM_BOT_TOKEN=YOUR_BOT_TOKEN

# ── Paywuz QRIS ──
PAYWUZ_API_KEY=pk_live_YOUR_KEY
ENVEOF
fi

log "Building OpenGate..."
( cd "$OPENGATE_DIR" && npm run build )

# ── 9. Build 9Router ──
log "Installing 9Router deps..."
( cd "$NINEROUTER_DIR" && npm ci )

log "Building 9Router..."
( cd "$NINEROUTER_DIR" && npm run build )

# ── 10. PM2 — start all services ──
log "Starting services with PM2..."

# Ecosystem config
cat > "$OPENGATE_DIR/deploy/ecosystem.config.cjs" << 'PM2EOF'
module.exports = {
  apps: [
    {
      name: "opengate",
      cwd: "/opt/opengate",
      script: "node_modules/.bin/next",
      args: "start",
      env: { NODE_ENV: "production", PORT: 3000 },
      max_memory_restart: "512M",
    },
    {
      name: "opengate-bot",
      cwd: "/opt/opengate",
      script: "bot/start.js",
      env: { NODE_ENV: "production" },
      max_memory_restart: "256M",
    },
    {
      name: "9router",
      cwd: "/opt/9router",
      script: "node",
      args: "dist/index.js",
      env: { NODE_ENV: "production", PORT: 20128 },
      max_memory_restart: "1G",
    },
  ],
};
PM2EOF

pm2 startOrReload "$OPENGATE_DIR/deploy/ecosystem.config.cjs"
pm2 save

# Auto-start on boot
if ! systemctl list-units --type=service | grep -q '^pm2-'; then
  pm2 startup systemd -u "$USER" --hp "$HOME" || true
fi

# ── 11. Nginx ──
log "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/opengate > /dev/null << 'NGINXEOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_send_timeout 300s;
    }
}
NGINXEOF

sudo ln -sf /etc/nginx/sites-available/opengate /etc/nginx/sites-enabled/opengate
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ── 12. Validate ──
log "Validating services..."
sleep 3

check_port() {
  local port="$1" name="$2"
  if curl -fsS --max-time 5 "http://127.0.0.1:$port/" >/dev/null 2>&1; then
    log "$name responding on :$port ✓"
  else
    warn "$name not responding on :$port — check 'pm2 logs $name'"
  fi
}

check_port 3000  opengate
check_port 20128 9router
check_port 80    nginx

# ── Done ──
IP=$(hostname -I | awk '{print $1}')
cat <<EOF

═══════════════════════════════════════════════
  ✅ OpenGate deployed!
═══════════════════════════════════════════════

  Website:  http://$IP
  API:      http://$IP/v1/chat/completions

  Services:
    pm2 status              — check all
    pm2 logs opengate       — website logs
    pm2 logs opengate-bot   — bot logs
    pm2 logs 9router        — router logs
    pm2 restart all         — restart all

  Next steps:
    1. Edit .env.local with your real keys
    2. Configure Paywuz webhook: http://$IP/api/webhooks/paywuz
    3. Test: curl -X POST http://$IP/v1/chat/completions ...

═══════════════════════════════════════════════
EOF
