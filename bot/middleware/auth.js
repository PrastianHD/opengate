// Auth middleware: look up user by telegram_id, attach to ctx.state.

import getSupabase from "../lib/supabase.js";

export async function authMiddleware(ctx, next) {
  ctx.state = ctx.state || {};
  if (!ctx.from) return next();
  const sb = getSupabase();

  const { data } = await sb
    .from("users")
    .select("id, email, display_name, role, balance_micro_cents, telegram_id, banned_at")
    .eq("telegram_id", ctx.from.id)
    .maybeSingle();

  ctx.state.user = data; // null if not registered yet
  return next();
}

/**
 * Guard: only allow admins. Must be used after authMiddleware.
 */
export async function adminGuard(ctx, next) {
  if (!ctx.state.user || ctx.state.user.role !== "admin") {
    return ctx.reply("⛔ Command ini hanya untuk admin.");
  }
  return next();
}
