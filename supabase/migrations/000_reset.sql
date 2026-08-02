-- ============================================================================
-- OpenGate — RESET (destructive)
--
-- Drops every OpenGate object in public schema, plus the auth.users trigger
-- installed by handle_new_user(). After this runs, replay 001 → 004 in order:
--
--   000_reset.sql
--   001_schema.sql
--   002_rls.sql
--   003_seed.sql
--   004_9router.sql
--
-- WARNING: this deletes ALL OpenGate data — users, balances, transactions,
-- gateway keys, usage logs, providers, models. Supabase auth.users itself is
-- preserved (managed by Supabase), but the public.users mirror is wiped.
--
-- Idempotent: every drop uses IF EXISTS, so re-running on a partially-applied
-- state is safe.
-- ============================================================================

-- 1. Drop the trigger we installed on auth.users (function would be dropped
--    with CASCADE below, but the trigger lives in the auth schema so name it
--    explicitly).
drop trigger if exists on_auth_user_created on auth.users;

-- 2. Drop tables. CASCADE removes FKs, indexes, RLS policies, table triggers.
drop table if exists public.rate_limit_events cascade;
drop table if exists public.usage_log          cascade;
drop table if exists public.transactions       cascade;
drop table if exists public.gateway_keys       cascade;
drop table if exists public.models             cascade;
drop table if exists public.upstream_keys      cascade;
drop table if exists public.providers          cascade;
drop table if exists public.users              cascade;

-- 3. Drop functions. CASCADE removes any remaining triggers/policies that
--    depend on them.
drop function if exists public.debit_credit(uuid, bigint, uuid, text)                                  cascade;
drop function if exists public.topup_credit(uuid, bigint, text, text, text, uuid)                      cascade;
drop function if exists public.handle_new_user()                                                       cascade;
drop function if exists public.set_updated_at()                                                        cascade;
drop function if exists public.is_admin()                                                              cascade;
drop function if exists public.current_user_role()                                                     cascade;
