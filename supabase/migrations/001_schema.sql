-- ============================================================================
-- OpenGates Stage 1 — Schema (Supabase / Postgres)
-- Run order: 001_schema.sql -> 002_rls.sql -> 003_seed.sql
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

-- ============================================================================
-- USERS
-- Linked 1:1 with auth.users (Supabase managed). We mirror minimal fields here
-- and add app-specific columns (role, balance, rpm_cap).
-- ============================================================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  display_name text,
  avatar_url text,

  role text not null default 'user'
    check (role in ('user', 'reseller', 'admin')),

  -- Balance in micro-cents. 1 USD = 1_000_000. BIGINT range is safe for any realistic balance.
  balance_micro_cents bigint not null default 0,

  -- Safety RPM cap (anti-abuse, NOT a billing feature). 0 = use default (200).
  rpm_cap int not null default 0,

  -- For resellers: which user issued this account (null for top-level users)
  issued_by uuid references public.users(id) on delete set null,

  banned_at timestamptz,
  ban_reason text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_users_role on public.users(role);
create index if not exists idx_users_issued_by on public.users(issued_by);


-- ============================================================================
-- PROVIDERS
-- Upstream API providers (Kiro Dev, OpenRouter, Ollama, etc).
-- Admin-managed.
-- ============================================================================
create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  base_url text not null,

  -- Adapter type — used by the gateway to pick the right transformer
  -- 'openai_compat' covers OpenRouter, GLM, Minimax, OpenCode Free, Kiro Dev (assumed)
  -- 'ollama' has its own /api/generate format
  -- 'nvidia_nim' has slight header / model-name quirks
  adapter text not null default 'openai_compat'
    check (adapter in ('openai_compat', 'ollama', 'nvidia_nim')),

  -- Default headers as JSON (e.g. {"X-Custom-Auth": "..."}). Bearer auth handled per-key.
  default_headers jsonb not null default '{}'::jsonb,

  enabled boolean not null default true,
  priority int not null default 100,    -- lower = preferred
  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_providers_enabled on public.providers(enabled);


-- ============================================================================
-- UPSTREAM KEYS
-- Multiple API keys per provider for rotation + failover.
-- Encrypted at rest using Supabase Vault (api_key_encrypted).
-- ============================================================================
create table if not exists public.upstream_keys (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers(id) on delete cascade,

  label text not null,                  -- human-readable: "Main account", "Backup"
  api_key_encrypted text not null,      -- store encrypted (use pgsodium / vault)
  api_key_last4 text,                   -- last 4 chars for display

  enabled boolean not null default true,
  priority int not null default 100,
  weight int not null default 1,        -- for weighted round-robin

  -- Cooldown state (set when 429 / quota error received)
  cooldown_until timestamptz,
  last_error text,
  last_error_at timestamptz,

  -- Optional per-key budget tracking (provider-side limit, not user-facing)
  monthly_budget_usd_cents bigint,
  monthly_used_micro_cents bigint not null default 0,
  monthly_reset_at timestamptz not null default date_trunc('month', now()) + interval '1 month',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_upstream_keys_provider on public.upstream_keys(provider_id, enabled);
create index if not exists idx_upstream_keys_cooldown on public.upstream_keys(cooldown_until);


-- ============================================================================
-- MODELS
-- Public-facing model catalog. Admin sets pricing (with markup).
-- Each model maps to one provider + provider's model name.
-- ============================================================================
create table if not exists public.models (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,             -- "claude-opus-4.7" (used in API requests)
  display_name text not null,            -- "Claude Opus 4.7"
  provider_id uuid not null references public.providers(id) on delete restrict,
  upstream_model_id text not null,       -- the model name to send upstream

  tier text not null default 'standard'
    check (tier in ('flagship', 'standard', 'fast')),

  -- Pricing in micro-cents per 1M tokens. Final price after markup.
  -- 1 USD = 1_000_000 micro-cents
  -- Claude Opus input $15/M = 15_000_000 micro-cents per 1M tokens
  input_price_per_m_micro_cents bigint not null,
  output_price_per_m_micro_cents bigint not null,

  context_tokens int not null,           -- e.g. 200000
  max_output_tokens int not null,        -- e.g. 32000

  description text,
  enabled boolean not null default true,

  -- Capabilities (used for routing logic & UI filters)
  supports_streaming boolean not null default true,
  supports_tools boolean not null default false,
  supports_vision boolean not null default false,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_models_slug on public.models(slug);
create index if not exists idx_models_provider on public.models(provider_id);
create index if not exists idx_models_enabled on public.models(enabled);


-- ============================================================================
-- GATEWAY KEYS
-- API keys issued to users. Format: ogt_live_{32 random chars}
-- Stored hashed (sha256). Plain key shown only once at creation.
-- ============================================================================
create table if not exists public.gateway_keys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  label text not null,                          -- user-given name "Cursor", "Cline"
  key_hash text unique not null,                -- sha256(plain_key)
  key_prefix text not null,                     -- "ogt_live_abcd" for UI display
  key_last4 text not null,

  enabled boolean not null default true,

  -- Optional per-key restrictions
  model_whitelist text[],                       -- null = all models allowed
  rpm_cap int,                                  -- null = inherit from user

  -- Optional spending cap on this specific key (independent of user balance)
  spending_cap_micro_cents bigint,
  spending_used_micro_cents bigint not null default 0,

  expires_at timestamptz,
  last_used_at timestamptz,
  revoked_at timestamptz,

  created_at timestamptz not null default now()
);

create index if not exists idx_gateway_keys_user on public.gateway_keys(user_id);
create index if not exists idx_gateway_keys_hash on public.gateway_keys(key_hash);
create index if not exists idx_gateway_keys_enabled on public.gateway_keys(enabled);


-- ============================================================================
-- TRANSACTIONS
-- Append-only ledger. Every credit movement (top-up, debit, refund, adjust).
-- Source of truth for balance — users.balance_micro_cents is a cache.
-- ============================================================================
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,

  kind text not null
    check (kind in ('topup', 'debit', 'refund', 'adjust', 'bonus')),

  amount_micro_cents bigint not null,           -- positive = credit, negative = debit
  balance_after_micro_cents bigint not null,    -- snapshot for audit

  -- For debits: link to the usage row that caused this
  usage_log_id uuid,

  -- Free-form context
  description text,
  reference text,                                -- payment ref, telegram msg id, etc.
  metadata jsonb not null default '{}'::jsonb,

  created_by uuid references public.users(id),  -- admin id for manual adjusts
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_user on public.transactions(user_id, created_at desc);
create index if not exists idx_transactions_kind on public.transactions(kind);
create index if not exists idx_transactions_usage on public.transactions(usage_log_id);


-- ============================================================================
-- USAGE LOG
-- Per-request log. Used for: analytics, billing audit, debugging, abuse detection.
-- High-volume table — consider partitioning by month later.
-- ============================================================================
create table if not exists public.usage_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  gateway_key_id uuid references public.gateway_keys(id) on delete set null,
  model_id uuid not null references public.models(id) on delete restrict,
  provider_id uuid not null references public.providers(id) on delete restrict,
  upstream_key_id uuid references public.upstream_keys(id) on delete set null,

  endpoint text not null,                       -- "/v1/chat/completions"
  request_id text,                              -- internal id for tracing

  input_tokens int not null default 0,
  output_tokens int not null default 0,
  total_tokens int not null default 0,

  -- Final cost charged to user (post-markup)
  cost_micro_cents bigint not null default 0,
  -- Internal cost (what we paid upstream, pre-markup) — for margin analysis
  upstream_cost_micro_cents bigint not null default 0,

  duration_ms int,
  status_code int not null default 200,
  error text,

  -- Streaming-specific
  is_stream boolean not null default false,
  ttft_ms int,                                  -- time to first token

  created_at timestamptz not null default now()
);

create index if not exists idx_usage_log_user on public.usage_log(user_id, created_at desc);
create index if not exists idx_usage_log_key on public.usage_log(gateway_key_id, created_at desc);
create index if not exists idx_usage_log_model on public.usage_log(model_id);
create index if not exists idx_usage_log_created on public.usage_log(created_at desc);


-- ============================================================================
-- RATE LIMIT STATE (Postgres fallback — primary store is Upstash Redis)
-- We keep this for audit / monitoring. Redis is ephemeral.
-- ============================================================================
create table if not exists public.rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  gateway_key_id uuid references public.gateway_keys(id) on delete set null,

  kind text not null
    check (kind in ('rpm_exceeded', 'balance_exhausted', 'key_disabled', 'model_not_allowed')),

  context jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_events_user on public.rate_limit_events(user_id, created_at desc);


-- ============================================================================
-- TRIGGERS
-- Keep updated_at fresh
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

drop trigger if exists trg_providers_updated_at on public.providers;
create trigger trg_providers_updated_at
  before update on public.providers
  for each row execute function public.set_updated_at();

drop trigger if exists trg_upstream_keys_updated_at on public.upstream_keys;
create trigger trg_upstream_keys_updated_at
  before update on public.upstream_keys
  for each row execute function public.set_updated_at();

drop trigger if exists trg_models_updated_at on public.models;
create trigger trg_models_updated_at
  before update on public.models
  for each row execute function public.set_updated_at();


-- ============================================================================
-- HANDLE NEW USER
-- Auto-create users row when someone signs up via auth.users
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.users (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- ============================================================================
-- ATOMIC DEBIT FUNCTION
-- Used by gateway: deduct credit + insert transaction in single trip.
-- Returns true if successful, false if insufficient balance.
-- ============================================================================
create or replace function public.debit_credit(
  p_user_id uuid,
  p_amount_micro_cents bigint,         -- positive number = amount to debit
  p_usage_log_id uuid,
  p_description text default null
)
returns table (
  success boolean,
  new_balance bigint,
  txn_id uuid
)
language plpgsql security definer as $$
declare
  v_balance bigint;
  v_txn_id uuid;
begin
  -- Lock user row
  select balance_micro_cents into v_balance
  from public.users
  where id = p_user_id
  for update;

  if v_balance is null then
    return query select false, 0::bigint, null::uuid;
    return;
  end if;

  if v_balance < p_amount_micro_cents then
    return query select false, v_balance, null::uuid;
    return;
  end if;

  v_balance := v_balance - p_amount_micro_cents;

  update public.users
    set balance_micro_cents = v_balance
    where id = p_user_id;

  insert into public.transactions
    (user_id, kind, amount_micro_cents, balance_after_micro_cents, usage_log_id, description)
  values
    (p_user_id, 'debit', -p_amount_micro_cents, v_balance, p_usage_log_id, p_description)
  returning id into v_txn_id;

  return query select true, v_balance, v_txn_id;
end;
$$;


-- ============================================================================
-- TOPUP CREDIT FUNCTION
-- Admin / payment webhook calls this to credit a user.
-- ============================================================================
create or replace function public.topup_credit(
  p_user_id uuid,
  p_amount_micro_cents bigint,
  p_kind text default 'topup',
  p_description text default null,
  p_reference text default null,
  p_created_by uuid default null
)
returns table (
  new_balance bigint,
  txn_id uuid
)
language plpgsql security definer as $$
declare
  v_balance bigint;
  v_txn_id uuid;
begin
  select balance_micro_cents into v_balance
  from public.users
  where id = p_user_id
  for update;

  v_balance := coalesce(v_balance, 0) + p_amount_micro_cents;

  update public.users
    set balance_micro_cents = v_balance
    where id = p_user_id;

  insert into public.transactions
    (user_id, kind, amount_micro_cents, balance_after_micro_cents, description, reference, created_by)
  values
    (p_user_id, p_kind, p_amount_micro_cents, v_balance, p_description, p_reference, p_created_by)
  returning id into v_txn_id;

  return query select v_balance, v_txn_id;
end;
$$;
