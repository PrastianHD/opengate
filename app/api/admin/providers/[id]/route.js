import { requireAdminApi } from "@/lib/admin/guard";

export const runtime = "nodejs";

const ALLOWED_PATCH = new Set(["enabled", "priority", "notes"]);

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
    if (k === "priority") {
      const n = Number.parseInt(body[k], 10);
      if (Number.isFinite(n)) update.priority = Math.max(0, Math.min(1000, n));
    }
    if (k === "notes") update.notes = String(body[k]).slice(0, 1000);
  }
  if (Object.keys(update).length === 0)
    return jsonError(400, "nothing_to_update", "No editable fields");

  const { error } = await guard.sbService
    .from("providers")
    .update(update)
    .eq("id", id);
  if (error) return jsonError(500, "update_failed", error.message);
  return Response.json({ ok: true });
}

function jsonError(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}
