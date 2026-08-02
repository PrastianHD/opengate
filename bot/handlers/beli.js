// /beli — Buy token package with QRIS payment via Paywuz.

import { PACKAGES } from "../../lib/catalog.js";
import { formatIDR } from "../lib/format.js";
import { balanceToIDR } from "../lib/user.js";
import getSupabase from "../lib/supabase.js";
import { createTransaction } from "../lib/paywuz.js";
import { generateQR } from "../lib/qrcode.js";

export function beliHandler() {
  return async (ctx) => {
    const user = ctx.state.user;
    if (!user) {
      return ctx.reply("❌ Ketik /start untuk mulai.");
    }

    const bal = formatIDR(balanceToIDR(user.balance_micro_cents));
    const buttons = PACKAGES.map((p) => [
      {
        text: `${p.label} — ${p.priceLabel}${p.bonus > 0 ? ` (+${p.bonus}%)` : ""}`,
        callback_data: `buy:${p.id}`,
      },
    ]);

    ctx.reply(`📦 *Paket Token*\n\n💰 Balance: *${bal}*\n\nPilih paket:`, {
      parse_mode: "Markdown",
      reply_markup: { inline_keyboard: buttons },
    });
  };
}

export function buyCallbackHandler() {
  return async (ctx) => {
    const pkgId = ctx.callbackQuery.data.split(":")[1];
    const pkg = PACKAGES.find((p) => p.id === pkgId);
    if (!pkg) return ctx.answerCallbackQuery("❌ Paket tidak ditemukan.");

    const user = ctx.state.user;
    if (!user) return ctx.answerCallbackQuery("❌ User tidak ditemukan.");

    await ctx.answerCallbackQuery();

    // Generate unique order ID
    const orderId = `OG-${pkg.id.toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    try {
      // Create Paywuz transaction
      const tx = await createTransaction({
        orderId,
        amount: pkg.price,
        description: `OpenGate ${pkg.label} Package`,
      });

      // Save to payment_transactions
      const sb = getSupabase();
      await sb.from("payment_transactions").insert({
        user_id: user.id,
        order_id: orderId,
        package_id: pkg.id,
        amount_idr: pkg.price,
        paywuz_id: tx.id,
        payment_number: tx.paymentNumber,
        payment_url: tx.paymentUrl,
        expires_at: tx.expiresAt,
      });

      const caption =
        `💳 *Pembayaran QRIS*\n\n` +
        `📦 Paket: *${pkg.label}*\n` +
        `💰 Nominal: *${formatIDR(pkg.price)}*\n` +
        `⏰ Expired: ${new Date(tx.expiresAt).toLocaleString("id-ID")}\n\n` +
        `_Scan QR di bawah ini untuk bayar._\n` +
        `_Saldo otomatis terisi setelah pembayaran berhasil._`;

      // Send QR image with details
      if (tx.paymentNumber) {
        try {
          console.log("[beli] Generating QR for:", tx.paymentNumber?.substring(0, 30) + "...");
          const qrBuffer = await generateQR(tx.paymentNumber);
          console.log("[beli] QR buffer size:", qrBuffer?.length);

          await ctx.replyWithPhoto(
            { source: qrBuffer },
            {
              caption,
              parse_mode: "Markdown",
              reply_markup: {
                inline_keyboard: [
                  [{ text: "🔄 Cek Status", callback_data: `checkpay:${orderId}` }],
                ],
              },
            }
          );
          return;
        } catch (qrErr) {
          console.error("[beli] QR sendPhoto failed:", qrErr.message);
        }
      }

      // Fallback: text only
      ctx.reply(caption + `\n\n⚠️ QR tidak tersedia. Bayar di: ${tx.paymentUrl}`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "💳 Bayar Sekarang", url: tx.paymentUrl }],
            [{ text: "🔄 Cek Status", callback_data: `checkpay:${orderId}` }],
          ],
        },
      });
    } catch (err) {
      console.error("[beli] Paywuz error:", err);
      ctx.reply(`❌ Gagal membuat transaksi: ${err.message}`);
    }
  };
}

/**
 * Handle checkpay callback — check payment status.
 */
export function checkPayCallbackHandler() {
  return async (ctx) => {
    const orderId = ctx.callbackQuery.data.split(":")[1];
    const sb = getSupabase();

    const { data: payment } = await sb
      .from("payment_transactions")
      .select("status, package_id")
      .eq("order_id", orderId)
      .maybeSingle();

    if (!payment) return ctx.answerCallbackQuery("❌ Transaksi tidak ditemukan.");

    if (payment.status === "success") {
      await ctx.answerCallbackQuery("✅ Pembayaran berhasil!");
      ctx.editMessageText("✅ Pembayaran berhasil! Saldo sudah terisi.");
    } else if (payment.status === "pending") {
      await ctx.answerCallbackQuery("⏳ Masih menunggu pembayaran...");
    } else {
      await ctx.answerCallbackQuery("❌ Pembayaran gagal/dibatalkan.");
    }
  };
}
