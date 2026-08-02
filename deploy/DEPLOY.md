# DEPLOY.md — OpenGate + 9Router on a single VPS

End-to-end deployment guide. Two Node processes managed by PM2, fronted by
Caddy with auto Let's Encrypt.

```
Internet
   │
   ▼
Caddy :443  (auto-TLS)
   │
   ├── opengate.host       → 127.0.0.1:3000   OpenGate (this repo)
   └── api.opengate.host   → 127.0.0.1:3000   OpenGate (same Next.js app)
                                                      │
                                                      ▼
                                          127.0.0.1:20128  9Router (loopback only)
                                                      │
                                                      ▼
                                          AI providers (Kiro, Codex, GLM, …)
```

9Router binds to **127.0.0.1 only** — never reachable from the internet, so
the master key never traverses the public network. Firewall opens **80 + 443**.

---

## 1. Provision

Tested on Ubuntu 22.04 / 24.04. Minimum: 2 vCPU, 2 GB RAM, 20 GB disk.

```bash
sudo apt-get update
sudo apt-get install -y curl git build-essential

# Node 20 (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2
sudo npm install -g pm2

# Caddy
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' \
  | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' \
  | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

# UFW (skip if you use cloud firewall)
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

Point DNS A records `opengate.host` and `api.opengate.host` at the VPS IP
before continuing — Caddy needs them resolvable for cert issuance.

---

## 2. Clone + build

> **One-shot alternative:** `bash /opt/opengate/deploy/install.sh` does steps
> 2–6 automatically. Edit `NINEROUTER_REF` at the top of that script to lock a
> specific 9Router version before running. The walk-through below is the
> manual form for first-timers.

```bash
sudo mkdir -p /opt && sudo chown $USER:$USER /opt

# OpenGate
cd /opt
git clone https://github.com/<you>/opengate.git
cd opengate
npm ci
npm run build

# 9Router
cd /opt
git clone https://github.com/decolua/9router.git
cd 9router
# Pin to a known-good commit for reproducible builds. Bump intentionally
# after reviewing the upstream changelog. Replace <COMMIT_OR_TAG> with the
# value you want to lock to (e.g. v1.4.0, or a 7-char commit sha).
git checkout <COMMIT_OR_TAG>
npm ci
npm run build

# 9Router state directory (PM2 ecosystem points DATA_DIR here)
sudo mkdir -p /var/lib/9router
sudo chown $USER:$USER /var/lib/9router

sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2
```

---

## 3. OpenGate environment

```bash
cd /opt/opengate
cp .env.example .env.local
```

Fill `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://opengate.host

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Upstash (RPM rate limit) — optional but recommended
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Required secrets — generate fresh:
GATEWAY_KEY_HASH_SALT=$(openssl rand -hex 32)
UPSTREAM_KEY_ENCRYPTION_KEY=$(openssl rand -hex 32)

# 9Router (loopback) — only used by scripts/list-9router-models.mjs
ROUTER_URL=http://localhost:20128
ROUTER_MASTER_KEY=          # paste after Step 5
```

Re-build so Next.js picks up the env vars:

```bash
npm run build
```

---

## 4. Start both processes

```bash
pm2 start /opt/opengate/deploy/ecosystem.config.cjs
pm2 save
pm2 startup    # one-time, enables boot persistence (run the printed command)
pm2 ls         # both processes "online"
```

Quick sanity:

```bash
curl -i http://127.0.0.1:3000          # Next.js landing page
curl -i http://127.0.0.1:20128/v1/models   # expect 401 (REQUIRE_API_KEY=true)
```

---

## 5. 9Router first-run

Tunnel the 9Router dashboard to your laptop:

```bash
# from your laptop
ssh -L 20128:localhost:20128 user@vps
# then in a browser
open http://localhost:20128/dashboard
```

In the dashboard:

1. Login with `INITIAL_PASSWORD=123456` (set in env if you changed it). Change the password immediately.
2. **Connect upstream providers** (Claude Code OAuth, Codex OAuth, GLM API key, MiniMax API key, Kiro, etc.) — one or more accounts per provider.
3. **API Keys → Generate** → copy the new key. This is `ROUTER_MASTER_KEY`.
4. Paste that key back into `/opt/opengate/.env.local` (`ROUTER_MASTER_KEY=…`) and `pm2 reload opengate`.

---

## 6. Caddy

```bash
sudo cp /opt/opengate/deploy/Caddyfile /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile        # fix the email line
sudo systemctl reload caddy
sudo journalctl -u caddy -f           # watch cert issuance
```

Once cert issuance finishes:

```bash
curl -I https://opengate.host
curl -I https://api.opengate.host
```

---

## 7. Database migration

In Supabase SQL Editor, run in order:

1. `supabase/migrations/001_schema.sql`
2. `supabase/migrations/002_rls.sql`
3. `supabase/migrations/003_seed.sql`
4. `supabase/migrations/004_9router.sql`

After 004:
- `public.providers` has `9router` enabled (loopback) and 7 legacy rows disabled.
- `public.models` rows all point at `9router` with `upstream_model_id = NULL`.

---

## 8. Map model ids

Discover what 9Router actually serves:

```bash
cd /opt/opengate
ROUTER_URL=http://localhost:20128 \
ROUTER_MASTER_KEY=<the master key> \
  node scripts/list-9router-models.mjs
```

Sample output:

```
upstream_model_id            suggested_slug              owned_by
---------------------------  --------------------------  ----------
cc/claude-opus-4-7           cc-claude-opus-4-7          claude-code
kr/claude-sonnet-4.5         kr-claude-sonnet-4-5        kiro
glm/glm-4.7                  glm-glm-4-7                 glm
…
```

Map them:

1. Sign in to OpenGate at `https://opengate.host` with an admin account.
2. **Admin → Providers → 9Router (loopback) → Add upstream key** → paste `ROUTER_MASTER_KEY`. The key is encrypted with `UPSTREAM_KEY_ENCRYPTION_KEY` before being stored.
3. **Admin → Models** → for every row, set `upstream_model_id` to the matching id from step 1 (e.g. `kr/claude-sonnet-4.5` for the OpenGate slug `claude-sonnet-4.6`).

Models with a `NULL` `upstream_model_id` will fail at 9Router with `model_not_found` until mapped — intentional.

---

## 9. End-to-end smoke test

```bash
# Issue an OpenGate API key for yourself:
#   sign in at https://opengate.host → Dashboard → API Keys → New
#   copy the ogt-... value once

OGT_KEY=ogt-xxxxxxxx
curl https://api.opengate.host/v1/chat/completions \
  -H "Authorization: Bearer $OGT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4.6",
    "messages": [{"role":"user","content":"ping"}],
    "stream": false
  }'
```

Expected response headers:

```
X-OpenGate-Model: claude-sonnet-4.6
X-OpenGate-Cost-MicroCents: <number>
X-OpenGate-Balance-MicroCents: <remaining>
```

Streaming:

```bash
curl -N https://api.opengate.host/v1/chat/completions \
  -H "Authorization: Bearer $OGT_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4.6","messages":[{"role":"user","content":"hi"}],"stream":true}'
```

Verify in admin dashboard: usage row appears, balance debited, no upstream key cooldown.

---

## 10. Updating

OpenGate:

```bash
cd /opt/opengate
git pull
npm ci
npm run build
pm2 reload opengate
```

9Router:

```bash
cd /opt/9router
git fetch --tags
git checkout <NEW_COMMIT_OR_TAG>      # review upstream changelog first
npm ci
npm run build
pm2 reload 9router
```

---

## Operational notes

- **Backups**: 9Router SQLite at `/var/lib/9router/db/data.sqlite` — snapshot daily. Supabase handles its own backups.
- **Logs**: `pm2 logs`, `/var/log/pm2/*.log`, `journalctl -u caddy`.
- **Secrets rotation**: rotate `GATEWAY_KEY_HASH_SALT` would invalidate every issued user key — do not rotate post-launch. `UPSTREAM_KEY_ENCRYPTION_KEY` rotation requires re-encrypting every `upstream_keys` row.
- **9Router admin**: never expose port 20128 directly. Use SSH tunnel, or the IP-allowlisted Caddy block in `Caddyfile` (commented out by default).
- **Health**: `pm2 monit` for live CPU/memory; Caddy access log already includes upstream latency.
