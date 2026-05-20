import { requireAdminApi } from "@/lib/admin/guard";
import { encryptUpstreamKey, lastFour } from "@/lib/crypto/upstreamKey";

export const runtime = "nodejs";

export async function POST(request) {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const { sbService } = guard;

  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, "invalid_json", "Body is not JSON");
  }

  const providerId = String(body?.provider_id || "");
  const label = String(body?.label || "").trim();
  const apiKey = String(body?.api_key || "");
  const priority = clampInt(body?.priority, 0, 1000) ?? 100;
  const weight = clampInt(body?.weight, 1, 100) ?? 1;

  if (!providerId)
    return jsonError(400, "provider_required", "provider_id is required");
  if (!label) return jsonError(400, "label_required", "Label is required");
  if (!apiKey || apiKey.length < 10)
    return jsonError(400, "api_key_required", "Plaintext API key is required");

  let encrypted;
  try {
    encrypted = encryptUpstreamKey(apiKey);
  } catch (e) {
    return jsonError(500, "encryption_failed", e.message);
  }

  const { data, error } = await sbService
    .from("upstream_keys")
    .insert({
      provider_id: providerId,
      label: label.slice(0, 60),
      api_key_encrypted: encrypted,
      api_key_last4: lastFour(apiKey),
      priority,
      weight,
    })
    .select("id")
    .single();

  if (error) return jsonError(500, "insert_failed", error.message);
  return Response.json({ id: data.id, ok: true });
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
