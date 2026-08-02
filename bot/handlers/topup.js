// /topup — Quick topup with inline keyboard.

import { formatIDR } from "../lib/format.js";
import { balanceToIDR } from "../lib/user.js";
import getSupabase from "../lib/supabase.js";

const AMOUNTS = [
  { id: "t5", amount: 5_000, label: "Rp 5.000" },
  { id: "t10", amount: 10_000, label: "Rp 10.000" },
  { id: "t25", amount: 25_000, label: "Rp 25.000" },
  { id: "t50", amount: 50_000, label: "Rp 50.000" },
];

export function topupHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.reply("❌ Ketik /start untuk mulai.");

    const bal = formatIDR(balanceToIDR(user.balance_micro_cents));
    const buttons = AMOUNTS.map((t) => [{ text: t.label, callback_data: `topup:${t.id}` }]);

    ctx.reply(`💳 *Quick Topup*\n\n💰 Balance: *${bal}*\n\nPilih nominal:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    });
  };
}

export function topupCallbackHandler() {
  return async (ctx) => {
    const topupId = ctx.callbackQuery.data.split(":")[1];
    const topup = AMOUNTS.find((t) => t.id === topupId);
    if (!topup) return ctx.answerCallbackQuery("❌ Nominal tidak ditemukan.");

    const user = ctx.state.user;
    if (!user) return ctx.answerCallbackQuery("❌ User tidak ditemukan.");

    const microCents = Math.round((topup.amount / 18_000) * 1_000_000);
    const sb = getSupabase();

    const { data, error } = await sb.rpc("topup_credit", {
      p_user_id: user.id,
      p_amount_micro_cents: microCents,
      p_kind: "topup",
      p_description: `Topup ${topup.label} via Telegram`,
      p_reference: `bot_topup_${topup.id}_${Date.now()}`,
    });

    if (error) return ctx.answerCallbackQuery(`❌ Error: ${error.message}`);

    const newBal = formatIDR(Math.round(data[0].new_balance * 0.018));
    await ctx.answerCallbackQuery("✅ Berhasil!");
    ctx.editMessageText(
      `✅ *Topup berhasil!*\n\n💳 ${topup.label}\n💰 Balance: *${newBal}*`,
      { parse_mode: "Markdown" }
    );
  };
}
