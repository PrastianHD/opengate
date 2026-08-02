// /help — Help text.

export function helpHandler() {
  return async (ctx) => {
    const text =
      "📖 *OpenGate Bot — Commands*\n\n" +
      "*User Commands:*\n" +
      "/start — Daftar & welcome\n" +
      "/beli — Beli paket token\n" +
      "/topup — Topup balance\n" +
      "/cek — Cek balance & usage\n" +
      "/buat-key — Buat API key\n" +
      "/hapus — Hapus/revoke key\n" +
      "/key — Lihat key aktif\n" +
      "/model — Daftar model & harga\n" +
      "/help — Bantuan ini\n\n" +
      "*Base URL:* `https://api.opengate.host/v1`\n\n" +
      "💡 Setelah /buat-key, langsung pakai di OpenAI client dengan base URL di atas.";

    ctx.reply(text, { parse_mode: "Markdown" });
  };
}
