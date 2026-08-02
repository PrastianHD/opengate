// /key — View active keys with pagination.

import getSupabase from "../lib/supabase.js";
import { maskKey } from "../lib/format.js";

const PAGE_SIZE = 5;

async function getKeysPage(userId, page) {
  const sb = getSupabase();
  const start = page * PAGE_SIZE;

  const { data: keys, count } = await sb
    .from("gateway_keys")
    .select("id, label, key_prefix, key_last4, created_at", { count: "exact" })
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("created_at", { ascending: false })
    .range(start, start + PAGE_SIZE - 1);

  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);
  return { keys: keys || [], totalPages, page };
}

function renderKeysPage(keys, page, totalPages) {
  let text = `🔑 *Key (${page + 1}/${totalPages})*\n\n`;
  for (const k of keys) {
    const date = new Date(k.created_at).toLocaleDateString("id-ID");
    text += `• *${k.label}*\n  \`${maskKey(k.key_prefix, k.key_last4)}\` · ${date}\n\n`;
  }

  const buttons = [];
  if (page > 0) buttons.push({ text: "◀ Prev", callback_data: `keys:${page - 1}` });
  if (page + 1 < totalPages) buttons.push({ text: "Next ▶", callback_data: `keys:${page + 1}` });

  return { text, buttons };
}

export function keyHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.reply("❌ Ketik /start untuk mulai.");

    const { keys, totalPages, page } = await getKeysPage(user.id, 0);
    if (keys.length === 0) {
      return ctx.reply("📭 Tidak ada key.\n\n/buat-key — Buat baru");
    }

    const { text, buttons } = renderKeysPage(keys, page, totalPages);
    ctx.reply(text, {
      parse_mode: "Markdown",
      reply_markup: buttons.length ? { inline_keyboard: [buttons] } : undefined,
    });
  };
}

export function keysCallbackHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.answerCallbackQuery("❌ User tidak ditemukan.");

    const page = parseInt(ctx.callbackQuery.data.split(":")[1]) || 0;
    const { keys, totalPages } = await getKeysPage(user.id, page);
    const { text, buttons } = renderKeysPage(keys, page, totalPages);

    ctx.editMessageText(text, {
      parse_mode: "Markdown",
      reply_markup: buttons.length ? { inline_keyboard: [buttons] } : undefined,
    });
    ctx.answerCallbackQuery();
  };
}
