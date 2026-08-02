// Paywuz webhook handler — receives QRIS payment confirmation.
// POST /api/webhooks/paywuz

import { createServiceClient } from "@/lib/supabase/server";
import crypto from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function verifySignature(rawBody, signature) {
  const apiKey = process.env.PAYWUZ_API_KEY;
  if (!apiKey) return false;
  const expected =
    "sha256=" + crypto.createHmac("sha256", apiKey).update(rawBody).digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paywuz-signature") || "";

    if (!verifySignature(rawBody, signature)) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const { event, data } = payload;

    // Only process transaction.paid (dana sudah masuk ke merchant)
    if (event !== "transaction.paid") {
      return Response.json({ ok: true, skipped: event });
    }

    const sb = createServiceClient();

    // Find the payment transaction
    const { data: payment, error: findErr } = await sb
      .from("payment_transactions")
      .select("id, user_id, package_id, status")
      .eq("order_id", data.orderId)
      .maybeSingle();

    if (findErr || !payment) {
      console.error("[Paywuz webhook] Payment not found:", data.orderId);
      return Response.json({ error: "Payment not found" }, { status: 404 });
    }

    // Skip if already processed
    if (payment.status === "success") {
      return Response.json({ ok: true, alreadyProcessed: true });
    }

    // Mark payment as success
    await sb
      .from("payment_transactions")
      .update({
        status: "success",
        paid_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // Credit user balance via topup_credit RPC
    // We need to calculate the micro-cents from the amount
    // Import PACKAGES to get the token amount
    const { PACKAGES } = await import("@/lib/catalog.js");
    const pkg = PACKAGES.find((p) => p.id === payment.package_id);

    if (!pkg) {
      console.error("[Paywuz webhook] Package not found:", payment.package_id);
      return Response.json({ error: "Package not found" }, { status: 400 });
    }

    const microCents = Math.round((pkg.price / 18_000) * 1_000_000);
    const { error: creditErr } = await sb.rpc("topup_credit", {
      p_user_id: payment.user_id,
      p_amount_micro_cents: microCents,
      p_kind: "topup",
      p_description: `Paket ${pkg.label} via QRIS`,
      p_reference: `qris_${data.orderId}`,
    });

    if (creditErr) {
      console.error("[Paywuz webhook] Credit error:", creditErr);
      return Response.json({ error: "Credit failed" }, { status: 500 });
    }

    console.log(`[Paywuz webhook] Payment success: ${data.orderId} → user ${payment.user_id}`);
    return Response.json({ ok: true });
  } catch (err) {
    console.error("[Paywuz webhook] Error:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
