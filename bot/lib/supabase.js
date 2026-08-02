// Standalone Supabase client for the Telegram bot.
// Lazy init — env vars loaded before this is first accessed.

import { createClient } from "@supabase/supabase-js";

let _client = null;

export default function getSupabase() {
  if (_client) return _client;
  _client = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
  return _client;
}
