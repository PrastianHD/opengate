// User API key management.
// Auth: Supabase session cookie (NOT gateway Bearer). RLS additionally guards
// the rows, but we filter by auth.uid() explicitly for clarity.

import { generateGatewayKey } from "@/lib/gateway/keyGen";
import { MICRO_PER_USD } from "@/lib/format";
import {
  clampInt,
  jsonError,
  requireUser,
  toFiniteNumber,
} from "@/lib/api/helpers";

export async function GET() {
  const { sb, user, response } = await requireUser();
  if (response) return response;

  const { data, error } = await sb
    .from("gateway_keys")
    .select(
      "id, label, key_prefix, key_last4, enabled, model_whitelist, rpm_cap, spending_cap_micro_cents, spending_used_micro_cents, expires_at, last_used_at, revoked_at, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return jsonError(500, "list_failed", error.message);
  return Response.json({ keys: data });
}

export async function POST(request) {
  const { sb, user, response } = await requireUser();
  if (response) return response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  const label = (payload?.label || "").trim();
  if (!label) return jsonError(400, "label_required", "Label is required");
  if (label.length > 60)
    return jsonError(400, "label_too_long", "Label must be ≤ 60 chars");

  const modelWhitelist = Array.isArray(payload?.model_whitelist)
    ? payload.model_whitelist.filter((s) => typeof s === "string" && s.trim())
    : null;

  const rpmCap = clampInt(payload?.rpm_cap, 1, 10000);
  const spendingCapUsd = toFiniteNumber(payload?.spending_cap_usd);
  const spendingCapMicroCents =
    spendingCapUsd != null ? Math.round(spendingCapUsd * MICRO_PER_USD) : null;

  const expiresAt = payload?.expires_at
    ? new Date(payload.expires_at).toISOString()
    : null;

  const { plain, hash, prefix, last4 } = generateGatewayKey();

  const { data, error } = await sb
    .from("gateway_keys")
    .insert({
      user_id: user.id,
      label,
      key_hash: hash,
      key_prefix: prefix,
      key_last4: last4,
      model_whitelist:
        modelWhitelist && modelWhitelist.length > 0 ? modelWhitelist : null,
      rpm_cap: rpmCap,
      spending_cap_micro_cents: spendingCapMicroCents,
      expires_at: expiresAt,
    })
    .select(
      "id, label, key_prefix, key_last4, enabled, model_whitelist, rpm_cap, spending_cap_micro_cents, expires_at, created_at"
    )
    .single();

  if (error) return jsonError(500, "create_failed", error.message);

  return Response.json({
    key: data,
    plaintext: plain,
    notice:
      "Store this token now — it will not be shown again. Treat it like a password.",
  });
}
