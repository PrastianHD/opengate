// Admin-only proxy: list models that 9Router exposes.
//
// Used by the admin Models page to populate the upstream_model_id datalist
// and power the "Sync from 9Router" auto-mapper.
//
// Flow:
//   1. require admin session
//   2. load providers row WHERE slug='9router' (base_url)
//   3. load enabled upstream_keys for that provider (decrypt master key)
//   4. fetch GET {base_url}/models   ← 9Router OpenAI-compatible endpoint
//   5. return normalized list back to the admin UI
//
// Errors are returned in OpenGate's standard JSON shape so the UI can show
// them without leaking 9Router internals.

import { requireAdminApi } from "@/lib/admin/guard";
import { jsonError } from "@/lib/api/helpers";
import { decryptUpstreamKey } from "@/lib/crypto/upstreamKey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 8000;

export async function GET() {
  const guard = await requireAdminApi();
  if (guard.error) return guard.error;
  const sb = guard.sbService;

  const { data: provider, error: pErr } = await sb
    .from("providers")
    .select("id, base_url, enabled")
    .eq("slug", "9router")
    .maybeSingle();

  if (pErr) return jsonError(500, "provider_lookup_failed", pErr.message);
  if (!provider)
    return jsonError(
      404,
      "provider_missing",
      "9Router provider row not found — run migration 004_9router.sql"
    );
  if (!provider.enabled)
    return jsonError(409, "provider_disabled", "9Router provider is disabled");

  const { data: keys, error: kErr } = await sb
    .from("upstream_keys")
    .select("id, api_key_encrypted, enabled, cooldown_until")
    .eq("provider_id", provider.id)
    .eq("enabled", true);

  if (kErr) return jsonError(500, "key_lookup_failed", kErr.message);
  if (!keys || keys.length === 0)
    return jsonError(
      404,
      "no_master_key",
      "No upstream key for 9Router. Add one in Admin → Providers → 9Router."
    );

  // Use the first usable key. Cooldown is informational at this layer —
  // the admin UI just needs to enumerate models.
  let plaintext;
  try {
    plaintext = decryptUpstreamKey(keys[0].api_key_encrypted);
  } catch (e) {
    return jsonError(500, "decrypt_failed", e.message || "Cannot decrypt key");
  }

  const url = `${provider.base_url.replace(/\/$/, "")}/models`;
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let resp;
  try {
    resp = await fetch(url, {
      headers: { Authorization: `Bearer ${plaintext}` },
      signal: controller.signal,
    });
  } catch (e) {
    clearTimeout(t);
    return jsonError(
      502,
      "fetch_failed",
      e?.name === "AbortError"
        ? `Timed out after ${FETCH_TIMEOUT_MS}ms`
        : e?.message || "Cannot reach 9Router"
    );
  }
  clearTimeout(t);

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    return jsonError(
      resp.status,
      "upstream_error",
      text.slice(0, 300) || `9Router returned ${resp.status}`
    );
  }

  let json;
  try {
    json = await resp.json();
  } catch {
    return jsonError(502, "invalid_json", "9Router response was not JSON");
  }

  const list = Array.isArray(json?.data) ? json.data : [];
  const models = list
    .map((m) => ({
      id: String(m.id || ""),
      owned_by: m.owned_by ? String(m.owned_by) : null,
    }))
    .filter((m) => m.id.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id));

  return Response.json({ models, count: models.length });
}
