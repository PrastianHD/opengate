// OpenGate Telegram Bot
// Run via: node bot/start.js

import { Bot, session } from "grammy";
import { authMiddleware, adminGuard } from "./middleware/auth.js";

// ── Handlers ──
import { startHandler } from "./handlers/start.js";
import { modelHandler, modelCallbackHandler } from "./handlers/model.js";
import { helpHandler } from "./handlers/help.js";
import { cekHandler } from "./handlers/cek.js";
import { buatKeyHandler } from "./handlers/buat-key.js";
import { hapusHandler, revokeCallbackHandler } from "./handlers/hapus.js";
import { keyHandler, keysCallbackHandler } from "./handlers/key.js";
import { beliHandler, buyCallbackHandler, checkPayCallbackHandler } from "./handlers/beli.js";
import { topupHandler, topupCallbackHandler } from "./handlers/topup.js";
import {
  adminRekapHandler,
  adminUsersHandler,
  adminUsersCallbackHandler,
  adminRevokeHandler,
  adminTopupHandler,
} from "./handlers/admin.js";

// ── Validate env ──
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
if (!TOKEN) {
  console.error("❌ TELEGRAM_BOT_TOKEN not set.");
  process.exit(1);
}

// ── Create bot ──
const bot = new Bot(TOKEN);

// ── Session ──
bot.use(session({ initial: () => ({ step: null, data: {} }) }));

// ── Auth middleware ──
bot.use(authMiddleware);

// ── User commands ──
bot.command("start", startHandler());
bot.command("help", helpHandler());
bot.command("model", modelHandler());
bot.command("cek", cekHandler());
bot.command("buat-key", buatKeyHandler());
bot.command("hapus", hapusHandler());
bot.command("key", keyHandler());
bot.command("beli", beliHandler());
bot.command("topup", topupHandler());

// ── Reply keyboard shortcuts ──
bot.hears("📦 Beli Paket", (ctx) => beliHandler()(ctx));
bot.hears("💳 Topup", (ctx) => topupHandler()(ctx));
bot.hears("🔑 Buat Key", (ctx) => buatKeyHandler()(ctx));
bot.hears("📋 Lihat Key", (ctx) => keyHandler()(ctx));
bot.hears("📊 Cek Status", (ctx) => cekHandler()(ctx));
bot.hears("🤖 Model", (ctx) => modelHandler()(ctx));

// ── Admin commands ──
bot.command("admin-rekap", adminGuard, adminRekapHandler());
bot.command("admin-users", adminGuard, adminUsersHandler());
bot.command("admin-revoke", adminGuard, adminRevokeHandler());
bot.command("admin-topup", adminGuard, adminTopupHandler());

// ── Callback queries ──
bot.callbackQuery(/^revoke:/, revokeCallbackHandler());
bot.callbackQuery(/^buy:/, buyCallbackHandler());
bot.callbackQuery(/^checkpay:/, checkPayCallbackHandler());
bot.callbackQuery(/^topup:/, topupCallbackHandler());
bot.callbackQuery(/^model:/, modelCallbackHandler());
bot.callbackQuery(/^keys:/, keysCallbackHandler());
bot.callbackQuery(/^ausers:/, adminUsersCallbackHandler());

// ── Error handler ──
bot.catch((err) => console.error("[Bot error]", err));

// ── Start ──
console.log("🤖 Starting OpenGate bot...");
bot.start({
  onStart: (info) => console.log(`✅ @${info.username} started (ID: ${info.id})`),
});
