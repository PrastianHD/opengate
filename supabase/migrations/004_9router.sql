-- ============================================================================
-- OpenGate Stage 7 — Migrate to 9Router gateway
--
-- Architecture (single VPS, two Node processes managed by PM2):
--   User → opengate.host (Caddy TLS, port 443)
--        → OpenGate (localhost:3000)   — auth + quota + log
--        → 9Router  (localhost:20128)  — multi-provider routing + key rotation
--        → AI provider (Kiro, Claude Code, GLM, MiniMax, …)
--
--   9Router is NEVER exposed publicly. OpenGate calls it over loopback,
--   so the master key never leaves the box.
--
-- This migration is data-only. No code changes required:
--   * `lib/gateway/handler.js` already calls `pickUpstreamKey(provider_id)`
--     and forwards via the openai_compat adapter.
--   * With 9Router as the only enabled provider holding the master key,
--     `pickUpstreamKey` returns it on every request.
--
-- Run AFTER 001_schema.sql, 002_rls.sql, 003_seed.sql.
-- Idempotent — safe to re-run.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Insert (or upsert) the 9Router provider row
--    base_url is loopback because OpenGate and 9Router share the VPS.
--    priority=1 → lowest value, always preferred over legacy providers.
-- ----------------------------------------------------------------------------
insert into public.providers (slug, name, base_url, adapter, priority, enabled, notes)
values (
  '9router',
  '9Router (loopback)',
  'http://localhost:20128/v1',
  'openai_compat',
  1,
  true,
  'Single upstream gateway running on the same VPS. Handles multi-provider routing + per-provider key rotation internally. Reach over loopback only — do not expose port 20128.'
)
on conflict (slug) do update set
  name = excluded.name,
  base_url = excluded.base_url,
  adapter = excluded.adapter,
  priority = excluded.priority,
  enabled = excluded.enabled,
  notes = excluded.notes;


-- ----------------------------------------------------------------------------
-- 2. Disable legacy providers
--    Rows are kept (preserves usage_log FK references) but marked disabled
--    so pickUpstreamKey skips them. Drop later via a cleanup migration if
--    no historical usage_log rows still reference them.
-- ----------------------------------------------------------------------------
update public.providers
set enabled = false
where slug in (
  'kiro-dev',
  'opencode-free',
  'openrouter',
  'ollama',
  'nvidia-nim',
  'glm-official',
  'minimax-official'
);


-- ----------------------------------------------------------------------------
-- 3. Allow NULL upstream_model_id
--    Original schema (001) declared this NOT NULL. After migrating to 9Router
--    we want admins to fill the upstream id post-deploy via the UI, so the
--    constraint is loosened. Application-level validation in the gateway
--    handler still rejects requests where it's NULL.
-- ----------------------------------------------------------------------------
alter table public.models
  alter column upstream_model_id drop not null;


-- ----------------------------------------------------------------------------
-- 4. Re-point every model to the 9Router provider
--    upstream_model_id is reset to NULL — admin must fill the actual model
--    id used by 9Router (run scripts/list-9router-models.mjs to discover).
--    The handler will reject requests for models with a NULL upstream_model_id
--    when 9Router responds 400/404; this is intentional during migration.
-- ----------------------------------------------------------------------------
do $$
declare
  v_9router_id uuid := (select id from public.providers where slug = '9router');
begin
  if v_9router_id is null then
    raise exception '9router provider row missing — step 1 failed';
  end if;

  update public.models
  set
    provider_id = v_9router_id,
    upstream_model_id = null;
end $$;


-- ----------------------------------------------------------------------------
-- 5. Sanity output (visible in SQL Editor result panel)
-- ----------------------------------------------------------------------------
select
  m.slug             as opengate_slug,
  m.upstream_model_id as nine_router_id,
  p.slug             as routed_via
from public.models m
join public.providers p on p.id = m.provider_id
order by m.tier, m.slug;
