import { requireAdminApi } from "@/lib/admin/guard";
import { jsonError } from "@/lib/api/helpers";
import { MICRO_PER_USD } from "@/lib/format";

export const runtime = "nodejs";

const ALLOWED_PATCH = new Set([
  "enabled",
  "input_price_per_m_usd",
  "output_price_per_m_usd",
  "tier",
  "description",
  "upstream_model_id",
]);
const ALLOWED_TIERS = new Set(["flagship", "standard", "fast"]);

export async function PATCH(request, { params }) {
  const { id } = await params;
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  const update = {};
  for (const k of Object.keys(body || {})) {
    if (!ALLOWED_PATCH.has(k)) continue;
    if (k === "enabled") update.enabled = !!body[k];
    if (k === "tier") {
      if (!ALLOWED_TIERS.has(body[k]))
        return jsonError(400, "invalid_tier", "tier must be flagship/standard/fast");
      update.tier = body[k];
    }
    if (k === "input_price_per_m_usd") {
      const n = Number(body[k]);
      if (!Number.isFinite(n) || n < 0)
        return jsonError(400, "invalid_price", "input price must be >= 0");
      update.input_price_per_m_micro_cents = Math.round(n * MICRO_PER_USD);
    }
    if (k === "output_price_per_m_usd") {
      const n = Number(body[k]);
      if (!Number.isFinite(n) || n < 0)
        return jsonError(400, "invalid_price", "output price must be >= 0");
      update.output_price_per_m_micro_cents = Math.round(n * MICRO_PER_USD);
    }
    if (k === "description") update.description = String(body[k]).slice(0, 500);
    if (k === "upstream_model_id") {
      const v = body[k];
      if (v == null || v === "") {
        update.upstream_model_id = null;
      } else if (typeof v !== "string") {
        return jsonError(400, "invalid_upstream_model_id", "must be a string");
      } else {
        const trimmed = v.trim();
        if (trimmed.length === 0 || trimmed.length > 200)
          return jsonError(400, "invalid_upstream_model_id", "1-200 chars");
        if (/\s/.test(trimmed))
          return jsonError(400, "invalid_upstream_model_id", "no whitespace allowed");
        update.upstream_model_id = trimmed;
      }
    }
  }

  if (Object.keys(update).length === 0)
    return jsonError(400, "nothing_to_update", "No editable fields");

  const { error } = await guard.sbService
    .from("models")
    .update(update)
    .eq("id", id);
  if (error) return jsonError(500, "update_failed", error.message);
  return Response.json({ ok: true });
}
