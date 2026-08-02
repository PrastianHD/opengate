-- ============================================================================
-- OpenGate Stage 8 — Telegram Bot Support
--
-- Adds telegram_id to users table so the bot can create/manage users
-- directly without Supabase Auth.
--
-- Run AFTER 001_schema.sql through 004_9router.sql.
-- ============================================================================

-- 1. Drop FK constraint to auth.users (bot creates users with generated UUIDs)
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_id_fkey;

-- 2. Add telegram_id column (unique, nullable for existing web users)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS telegram_id bigint UNIQUE;

-- 3. Index for fast lookup by telegram_id
CREATE INDEX IF NOT EXISTS idx_users_telegram_id ON public.users(telegram_id);

-- 4. Verify
SELECT
  column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;
