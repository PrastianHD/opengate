import { requireAdminApi } from "@/lib/admin/guard";

export const runtime = "nodejs";

const ALLOWED_PATCH = new Set(["enabled", "priority", "weight", "label"]);

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
    if (k === "priority") update.priority = clampInt(body[k], 0, 1000);
    if (k === "weight") update.weight = clampInt(body[k], 1, 100);
    if (k === "label") update.label = String(body[k]).trim().slice(0, 60);
  }
  if (Object.keys(update).length === 0)
    return jsonError(400, "nothing_to_update", "No editable fields");

  // Re-enabling clears the cooldown so the key starts being picked again.
  if (update.enabled === true) {
    update.cooldown_until = null;
    update.last_error = null;
  }

  const { error } = await guard.sbService
    .from("upstream_keys")
    .update(update)
    .eq("id", id);
  if (error) return jsonError(500, "update_failed", error.message);
  return Response.json({ ok: true });
}

export async function DELETE(_request, { params }) {
  const { id } = await params;
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { error } = await guard.sbService
    .from("upstream_keys")
    .delete()
    .eq("id", id);
  if (error) return jsonError(500, "delete_failed", error.message);
  return Response.json({ ok: true });
}

function clampInt(v, min, max) {
  if (v == null || v === "") return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
}

function jsonError(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}
