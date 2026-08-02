// /cek — Check balance + usage.

import { balanceToIDR, getRecentUsage } from "../lib/user.js";
import { formatIDR, formatTokens } from "../lib/format.js";
import getSupabase from "../lib/supabase.js";

export function cekHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.reply("❌ Ketik /start untuk mulai.");

    const sb = getSupabase();
    const bal = formatIDR(balanceToIDR(user.balance_micro_cents));

    const { count } = await sb
      .from("usage_log")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    const usage = await getRecentUsage(user.id, 5);

    let text = `📊 *Status Akun*\n\n`;
    text += `💰 Balance: *${bal}*\n`;
    text += `📝 Total requests: ${count || 0}\n`;

    if (usage.length > 0) {
      text += `\n*Recent:*\n`;
      for (const u of usage) {
        const tokens = (u.input_tokens || 0) + (u.output_tokens || 0);
        const cost = formatIDR(Math.round(u.cost_micro_cents * 0.018));
        const date = new Date(u.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        text += `${date} · ${formatTokens(tokens)} tok · ${cost}\n`;
      }
    }

    ctx.reply(text, { parse_mode: "Markdown" });
  };
}
