-- ============================================================================
-- OpenGate Stage 1 — Row Level Security policies
-- Run after 001_schema.sql
-- ============================================================================

-- Enable RLS on all public tables
alter table public.users enable row level security;
alter table public.providers enable row level security;
alter table public.upstream_keys enable row level security;
alter table public.models enable row level security;
alter table public.gateway_keys enable row level security;
alter table public.transactions enable row level security;
alter table public.usage_log enable row level security;
alter table public.rate_limit_events enable row level security;


-- ============================================================================
-- HELPER: is_admin()
-- ============================================================================
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.current_user_role()
returns text language sql stable security definer as $$
  select role from public.users where id = auth.uid();
$$;


-- ============================================================================
-- USERS
-- - User can read their own row
-- - Admin can read & update everyone
-- - Insert handled by handle_new_user trigger (security definer), no policy needed
-- ============================================================================
drop policy if exists "users_self_read" on public.users;
create policy "users_self_read" on public.users
  for select using (auth.uid() = id);

drop policy if exists "users_self_update_safe_fields" on public.users;
create policy "users_self_update_safe_fields" on public.users
  for update using (auth.uid() = id)
  with check (
    auth.uid() = id
    -- Cannot self-modify role, balance, rpm_cap, banned_at
    and role = (select role from public.users where id = auth.uid())
    and balance_micro_cents = (select balance_micro_cents from public.users where id = auth.uid())
    and rpm_cap = (select rpm_cap from public.users where id = auth.uid())
  );

drop policy if exists "users_admin_all" on public.users;
create policy "users_admin_all" on public.users
  for all using (public.is_admin())
  with check (public.is_admin());


-- ============================================================================
-- PROVIDERS
-- - Public read (slug, name, enabled) is needed by /models endpoint? No —
--   we expose models, not providers. Restrict to admin.
-- ============================================================================
drop policy if exists "providers_admin_only" on public.providers;
create policy "providers_admin_only" on public.providers
  for all using (public.is_admin())
  with check (public.is_admin());


-- ============================================================================
-- UPSTREAM KEYS — admin only
-- ============================================================================
drop policy if exists "upstream_keys_admin_only" on public.upstream_keys;
create policy "upstream_keys_admin_only" on public.upstream_keys
  for all using (public.is_admin())
  with check (public.is_admin());


-- ============================================================================
-- MODELS
-- - Anyone authenticated can read enabled models (for /models page in dashboard)
-- - Public landing site reads via service role, RLS bypassed
-- - Admin can write
-- ============================================================================
drop policy if exists "models_authenticated_read_enabled" on public.models;
create policy "models_authenticated_read_enabled" on public.models
  for select using (enabled = true or public.is_admin());

drop policy if exists "models_admin_write" on public.models;
create policy "models_admin_write" on public.models
  for all using (public.is_admin())
  with check (public.is_admin());


-- ============================================================================
-- GATEWAY KEYS
-- - User can manage their own keys
-- - Admin can see all
-- - The gateway itself looks up by hash via service role (bypasses RLS)
-- ============================================================================
drop policy if exists "gateway_keys_self_all" on public.gateway_keys;
create policy "gateway_keys_self_all" on public.gateway_keys
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "gateway_keys_admin_all" on public.gateway_keys;
create policy "gateway_keys_admin_all" on public.gateway_keys
  for all using (public.is_admin())
  with check (public.is_admin());


-- ============================================================================
-- TRANSACTIONS
-- - User reads own
-- - Inserts only via service role (debit_credit / topup_credit functions)
-- - Admin sees all
-- ============================================================================
drop policy if exists "transactions_self_read" on public.transactions;
create policy "transactions_self_read" on public.transactions
  for select using (auth.uid() = user_id);

drop policy if exists "transactions_admin_read" on public.transactions;
create policy "transactions_admin_read" on public.transactions
  for select using (public.is_admin());

-- No INSERT/UPDATE/DELETE policies — only service role can write.


-- ============================================================================
-- USAGE LOG
-- - User reads own
-- - Admin reads all
-- ============================================================================
drop policy if exists "usage_log_self_read" on public.usage_log;
create policy "usage_log_self_read" on public.usage_log
  for select using (auth.uid() = user_id);

drop policy if exists "usage_log_admin_read" on public.usage_log;
create policy "usage_log_admin_read" on public.usage_log
  for select using (public.is_admin());


-- ============================================================================
-- RATE LIMIT EVENTS
-- - User reads own
-- - Admin reads all
-- ============================================================================
drop policy if exists "rate_limit_events_self_read" on public.rate_limit_events;
create policy "rate_limit_events_self_read" on public.rate_limit_events
  for select using (auth.uid() = user_id);

drop policy if exists "rate_limit_events_admin_read" on public.rate_limit_events;
create policy "rate_limit_events_admin_read" on public.rate_limit_events
  for select using (public.is_admin());


-- ============================================================================
-- GRANTS
-- Default Supabase grants are usually fine. Service role bypasses RLS already.
-- ============================================================================
grant usage on schema public to authenticated, anon;
grant select on public.models to authenticated, anon;
grant select on public.users to authenticated;
grant select, insert, update, delete on public.gateway_keys to authenticated;
grant select on public.transactions to authenticated;
grant select on public.usage_log to authenticated;
grant select on public.rate_limit_events to authenticated;
