// Admin commands with pagination.

import getSupabase from "../lib/supabase.js";
import { formatIDR } from "../lib/format.js";

export function adminRekapHandler() {
  return async (ctx) => {
    const sb = getSupabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: txns } = await sb
      .from("transactions")
      .select("kind, amount_micro_cents")
      .gte("created_at", today.toISOString());

    const topups = (txns || []).filter((t) => t.kind === "topup");
    const debits = (txns || []).filter((t) => t.kind === "debit");
    const totalTopup = topups.reduce((s, t) => s + t.amount_micro_cents, 0);
    const totalDebit = debits.reduce((s, t) => s + Math.abs(t.amount_micro_cents), 0);

    const { count: userCount } = await sb.from("users").select("*", { count: "exact", head: true });
    const { count: keyCount } = await sb.from("gateway_keys").select("*", { count: "exact", head: true }).is("revoked_at", null);

    let text = `📊 *Rekap Hari Ini*\n\n`;
    text += `👥 Users: ${userCount || 0}\n🔑 Keys: ${keyCount || 0}\n\n`;
    text += `💰 Topup: ${topups.length} tx · ${formatIDR(Math.round(totalTopup * 0.018))}\n`;
    text += `📉 Usage: ${debits.length} tx · ${formatIDR(Math.round(totalDebit * 0.018))}`;

    ctx.reply(text, { parse_mode: "Markdown" });
  };
}

const USER_PAGE_SIZE = 10;

async function getUsersPage(page) {
  const sb = getSupabase();
  const start = page * USER_PAGE_SIZE;

  const { data: users } = await sb
    .from("users")
    .select("id, display_name, telegram_id, balance_micro_cents, role")
    .order("created_at", { ascending: false })
    .range(start, start + USER_PAGE_SIZE - 1);

  const { count } = await sb.from("users").select("*", { count: "exact", head: true });
  const totalPages = Math.ceil((count || 0) / USER_PAGE_SIZE);
  return { users: users || [], totalPages, page };
}

function renderUsersPage(users, page, totalPages) {
  let text = `👥 *Users (${page + 1}/${totalPages})*\n\n`;
  for (const u of users) {
    const bal = formatIDR(Math.round(u.balance_micro_cents * 0.018));
    text += `• *${u.display_name || "?"}* [${u.role}]\n  TG: \`${u.telegram_id}\` · ${bal}\n\n`;
  }

  const buttons = [];
  if (page > 0) buttons.push({ text: "◀ Prev", callback_data: `ausers:${page - 1}` });
  if (page + 1 < totalPages) buttons.push({ text: "Next ▶", callback_data: `ausers:${page + 1}` });

  return { text, buttons };
}

export function adminUsersHandler() {
  return async (ctx) => {
    const { users, totalPages, page } = await getUsersPage(0);
    if (users.length === 0) return ctx.reply("📭 Tidak ada user.");

    const { text, buttons } = renderUsersPage(users, page, totalPages);
    ctx.reply(text, {
      parse_mode: "Markdown",
      reply_markup: buttons.length ? { inline_keyboard: [buttons] } : undefined,
    });
  };
}

export function adminUsersCallbackHandler() {
  return async (ctx) => {
    const page = parseInt(ctx.callbackQuery.data.split(":")[1]) || 0;
    const { users, totalPages } = await getUsersPage(page);
    const { text, buttons } = renderUsersPage(users, page, totalPages);

    ctx.editMessageText(text, {
      parse_mode: "Markdown",
      reply_markup: buttons.length ? { inline_keyboard: [buttons] } : undefined,
    });
    ctx.answerCallbackQuery();
  };
}

export function adminRevokeHandler() {
  return async (ctx) => {
    const args = ctx.message.text.split(" ");
    const tgId = args[1];
    if (!tgId) return ctx.reply("Usage: /admin-revoke <telegram_id>");

    const sb = getSupabase();
    const { data: user } = await sb.from("users").select("id").eq("telegram_id", tgId).maybeSingle();
    if (!user) return ctx.reply("❌ User tidak ditemukan.");

    const { count } = await sb
      .from("gateway_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", user.id)
      .is("revoked_at", null);

    ctx.reply(`✅ ${count || 0} key di-revoke untuk ${tgId}.`);
  };
}

export function adminTopupHandler() {
  return async (ctx) => {
    const args = ctx.message.text.split(" ");
    const tgId = args[1];
    const amountStr = args[2];
    if (!tgId || !amountStr) return ctx.reply("Usage: /admin-topup <telegram_id> <rupiah>");

    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount <= 0) return ctx.reply("❌ Amount harus angka positif.");

    const sb = getSupabase();
    const { data: user } = await sb.from("users").select("id").eq("telegram_id", tgId).maybeSingle();
    if (!user) return ctx.reply("❌ User tidak ditemukan.");

    const microCents = Math.round((amount / 18_000) * 1_000_000);
    const { data, error } = await sb.rpc("topup_credit", {
      p_user_id: user.id,
      p_amount_micro_cents: microCents,
      p_kind: "topup",
      p_description: "Admin topup",
      p_reference: `admin_${Date.now()}`,
      p_created_by: ctx.state.user.id,
    });

    if (error) return ctx.reply(`❌ ${error.message}`);

    const newBal = formatIDR(Math.round(data[0].new_balance * 0.018));
    ctx.reply(`✅ Topup ${tgId}: ${formatIDR(amount)} → Balance: ${newBal}`);
  };
}
