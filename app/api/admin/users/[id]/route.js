import { requireAdminApi } from "@/lib/admin/guard";
import { jsonError } from "@/lib/api/helpers";

export const runtime = "nodejs";

const ALLOWED_ROLES = new Set(["user", "reseller", "admin"]);

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
  if ("role" in body) {
    if (!ALLOWED_ROLES.has(body.role)) {
      return jsonError(400, "invalid_role", "role must be user/reseller/admin");
    }
    update.role = body.role;
  }
  if ("rpm_cap" in body) {
    const n = Number.parseInt(body.rpm_cap, 10);
    update.rpm_cap = Number.isFinite(n) ? Math.max(0, Math.min(10000, n)) : 0;
  }
  if ("banned" in body) {
    if (body.banned) {
      update.banned_at = new Date().toISOString();
      update.ban_reason = String(body.ban_reason || "Admin action").slice(0, 500);
    } else {
      update.banned_at = null;
      update.ban_reason = null;
    }
  }

  if (Object.keys(update).length === 0) {
    return jsonError(400, "nothing_to_update", "No editable fields");
  }

  const { error } = await guard.sbService.from("users").update(update).eq("id", id);
  if (error) return jsonError(500, "update_failed", error.message);
  return Response.json({ ok: true });
}
