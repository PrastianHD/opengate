// /hapus — Revoke key with inline keyboard.

import getSupabase from "../lib/supabase.js";
import { maskKey } from "../lib/format.js";

export function hapusHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) return ctx.reply("❌ Ketik /start untuk mulai.");

    const sb = getSupabase();
    const { data: keys } = await sb
      .from("gateway_keys")
      .select("id, label, key_prefix, key_last4")
      .eq("user_id", user.id)
      .is("revoked_at", null)
      .order("created_at", { ascending: false });

    if (!keys || keys.length === 0) {
      return ctx.reply("📭 Tidak ada key aktif.\n\n/buat-key — Buat baru");
    }

    const buttons = keys.map((k) => [
      { text: `${k.label} (${maskKey(k.key_prefix, k.key_last4)})`, callback_data: `revoke:${k.id}` },
    ]);

    ctx.reply("🗑️ Pilih key:", {
      reply_markup: { inline_keyboard: buttons },
    });
  };
}

export function revokeCallbackHandler() {
  return async (ctx) => {
    const keyId = ctx.callbackQuery.data.split(":")[1];
    const sb = getSupabase();

    const { error } = await sb
      .from("gateway_keys")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", keyId);

    if (error) return ctx.answerCallbackQuery(`❌ ${error.message}`);

    await ctx.answerCallbackQuery("✅ Key di-revoke!");
    ctx.editMessageText("✅ Key berhasil di-revoke.");
  };
}
