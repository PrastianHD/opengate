import { requireAdminApi } from "@/lib/admin/guard";

export const runtime = "nodejs";

const MICRO_PER_USD = 1_000_000;

export async function POST(request, { params }) {
  const { id } = await params;
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  const usd = Number(body?.amount_usd);
  const description = String(body?.description || "Admin top-up").slice(0, 200);
  const reference = body?.reference ? String(body.reference).slice(0, 100) : null;

  if (!Number.isFinite(usd) || usd === 0) {
    return jsonError(400, "invalid_amount", "amount_usd must be non-zero");
  }
  if (Math.abs(usd) > 100000) {
    return jsonError(400, "amount_too_large", "Single top-up capped at $100,000");
  }

  const microCents = Math.round(usd * MICRO_PER_USD);
  const kind = microCents >= 0 ? "topup" : "adjust";

  const { data, error } = await guard.sbService.rpc("topup_credit", {
    p_user_id: id,
    p_amount_micro_cents: microCents,
    p_kind: kind,
    p_description: description,
    p_reference: reference,
    p_created_by: guard.user.id,
  });

  if (error) return jsonError(500, "topup_failed", error.message);
  return Response.json({ ok: true, result: data });
}

function jsonError(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}
