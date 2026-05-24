import { MICRO_PER_USD } from "@/lib/format";
import { jsonError, requireUser } from "@/lib/api/helpers";

const ALLOWED_PATCH = new Set([
  "label",
  "enabled",
  "model_whitelist",
  "rpm_cap",
  "spending_cap_usd",
  "expires_at",
]);

export async function PATCH(request, { params }) {
  const { id } = await params;
  const { sb, user, response } = await requireUser();
  if (response) return response;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  const update = {};
  for (const k of Object.keys(payload || {})) {
    if (!ALLOWED_PATCH.has(k)) continue;
    if (k === "spending_cap_usd") {
      const n = Number(payload[k]);
      update.spending_cap_micro_cents =
        Number.isFinite(n) && n > 0 ? Math.round(n * MICRO_PER_USD) : null;
    } else if (k === "rpm_cap") {
      const n = Number.parseInt(payload[k], 10);
      update.rpm_cap = Number.isFinite(n) ? Math.max(1, Math.min(10000, n)) : null;
    } else if (k === "expires_at") {
      update.expires_at = payload[k] ? new Date(payload[k]).toISOString() : null;
    } else if (k === "model_whitelist") {
      const v = Array.isArray(payload[k])
        ? payload[k].filter((s) => typeof s === "string" && s.trim())
        : null;
      update.model_whitelist = v && v.length > 0 ? v : null;
    } else if (k === "label") {
      const v = String(payload[k]).trim().slice(0, 60);
      if (!v) return jsonError(400, "label_required", "Label is required");
      update.label = v;
    } else if (k === "enabled") {
      update.enabled = !!payload[k];
    }
  }

  if (Object.keys(update).length === 0) {
    return jsonError(400, "nothing_to_update", "No editable fields supplied");
  }

  const { data, error } = await sb
    .from("gateway_keys")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) return jsonError(500, "update_failed", error.message);
  if (!data) return jsonError(404, "not_found", "Key not found");
  return Response.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const { sb, user, response } = await requireUser();
  if (response) return response;

  // Soft revoke — keeps usage history.
  const { data, error } = await sb
    .from("gateway_keys")
    .update({ revoked_at: new Date().toISOString(), enabled: false })
    .eq("id", id)
    .eq("user_id", user.id)
    .select("id")
    .single();

  if (error) return jsonError(500, "revoke_failed", error.message);
  if (!data) return jsonError(404, "not_found", "Key not found");
  return Response.json({ ok: true });
}
