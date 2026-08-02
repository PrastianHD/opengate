// /buat-key — Create API key.

import { generateGatewayKey } from "../lib/key.js";
import getSupabase from "../lib/supabase.js";

export function buatKeyHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.reply("❌ Ketik /start untuk mulai.");

    const sb = getSupabase();
    const { count } = await sb
      .from("gateway_keys")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("revoked_at", null);

    if (count >= 5) {
      return ctx.reply("⚠️ Maksimal 5 key. Hapus dulu dengan /hapus.");
    }

    const { plain, hash, prefix, last4 } = generateGatewayKey();

    const { error } = await sb.from("gateway_keys").insert({
      user_id: user.id,
      label: `TG ${new Date().toLocaleDateString("id-ID")}`,
      key_hash: hash,
      key_prefix: prefix,
      key_last4: last4,
      enabled: true,
    });

    if (error) return ctx.reply(`❌ Error: ${error.message}`);

    ctx.reply(
      `🔑 *API Key dibuat!*\n\n\`${plain}\`\n\n` +
        `⚠️ *Simpan sekarang! Tidak ditampilkan lagi.*\n\n` +
        `Base URL: \`https://api.opengate.host/v1\``,
      { parse_mode: "Markdown" }
    );
  };
}
