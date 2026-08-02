// /start — Register user + welcome with reply keyboard.

import { findOrCreateUser, balanceToIDR } from "../lib/user.js";
import { formatIDR } from "../lib/format.js";

const MAIN_KEYBOARD = {
  reply_markup: {
    keyboard: [
      [{ text: "📦 Beli Paket" }, { text: "💳 Topup" }],
      [{ text: "🔑 Buat Key" }, { text: "📋 Lihat Key" }],
      [{ text: "📊 Cek Status" }, { text: "🤖 Model" }],
    ],
    resize_keyboard: true,
    one_time_keyboard: false,
  },
};

export function startHandler() {
  return async (ctx) => {
    const user = ctx.state.user;

    if (user) {
      const bal = formatIDR(balanceToIDR(user.balance_micro_cents));
      return ctx.reply(
        `👋 Welcome back, ${ctx.from.first_name}!\n\n💰 Balance: ${bal}`,
        MAIN_KEYBOARD
      );
    }

    const newUser = await findOrCreateUser(
      ctx.from.id,
      ctx.from.first_name,
      ctx.from.username
    );

    ctx.reply(
      `🎉 Welcome to OpenGate, ${ctx.from.first_name}!\n\n` +
        `AI API Gateway — akses model AI terbaik.\n\n` +
        `Gunakan menu di bawah untuk mulai:`,
      MAIN_KEYBOARD
    );
  };
}
