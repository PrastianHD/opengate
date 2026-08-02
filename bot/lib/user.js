// User management for the Telegram bot.

import getSupabase from "./supabase.js";

/**
 * Find or create a user by Telegram ID.
 * Returns the user row.
 */
export async function findOrCreateUser(telegramId, firstName, username) {
  const sb = getSupabase();

  // Try find existing
  const { data: existing } = await sb
    .from("users")
    .select("id, email, display_name, role, balance_micro_cents, telegram_id, banned_at")
    .eq("telegram_id", telegramId)
    .maybeSingle();

  if (existing) return existing;

  // Create new user
  const id = crypto.randomUUID();
  const email = `tg_${telegramId}@opengate.local`;
  const displayName = firstName || username || `User ${telegramId}`;

  const { data: created, error } = await sb
    .from("users")
    .insert({
      id,
      telegram_id: telegramId,
      email,
      display_name: displayName,
      role: "user",
      balance_micro_cents: 0,
    })
    .select("id, email, display_name, role, balance_micro_cents, telegram_id, banned_at")
    .single();

  if (error) throw new Error(`Failed to create user: ${error.message}`);
  return created;
}

/**
 * Check if a user is an admin.
 */
export function isAdmin(user) {
  return user && user.role === "admin";
}

/**
 * Get user balance in IDR (micro-cents → IDR).
 */
export function balanceToIDR(microCents) {
  return Math.round(microCents * 0.018);
}

/**
 * Get recent usage for a user.
 */
export async function getRecentUsage(userId, limit = 5) {
  const sb = getSupabase();
  const { data } = await sb
    .from("usage_log")
    .select("model_id, input_tokens, output_tokens, cost_micro_cents, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}
