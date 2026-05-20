// Upstream key rotation.
// Selection algorithm:
//   1. Filter: enabled = true AND (cooldown_until IS NULL OR cooldown_until <= now)
//   2. Group by priority — pick the lowest priority bucket with any keys
//   3. Within that bucket, weighted random pick (weight col)
//
// Failure handling sets a cooldown so the next request skips this key:
//   - 429 (rate limited):     COOLDOWN_429_MS  (1 min)
//   - 5xx (upstream error):   COOLDOWN_5XX_MS  (15 sec)
//   - 401/403 (bad key):      COOLDOWN_BAD_MS  (1 hour) + last_error
//
// Service role required (writes to upstream_keys + reads encrypted blob).

import { decryptUpstreamKey } from "@/lib/crypto/upstreamKey";
import { createServiceClient } from "@/lib/supabase/server";

const COOLDOWN_429_MS = 60 * 1000;
const COOLDOWN_5XX_MS = 15 * 1000;
const COOLDOWN_BAD_MS = 60 * 60 * 1000;

// Pick a usable key for a provider. Returns { id, plaintext, last4 } or null.
export async function pickUpstreamKey(providerId) {
  const sb = createServiceClient();
  const nowIso = new Date().toISOString();

  const { data: keys, error } = await sb
    .from("upstream_keys")
    .select("id, label, api_key_encrypted, api_key_last4, priority, weight, cooldown_until")
    .eq("provider_id", providerId)
    .eq("enabled", true)
    .or(`cooldown_until.is.null,cooldown_until.lte.${nowIso}`);

  if (error) throw new Error(`upstream_keys query failed: ${error.message}`);
  if (!keys || keys.length === 0) return null;

  // Lowest priority value wins (lower = preferred)
  const minPriority = Math.min(...keys.map((k) => k.priority));
  const bucket = keys.filter((k) => k.priority === minPriority);

  // Weighted random within bucket
  const totalWeight = bucket.reduce((s, k) => s + (k.weight || 1), 0);
  let r = Math.random() * totalWeight;
  let chosen = bucket[0];
  for (const k of bucket) {
    r -= k.weight || 1;
    if (r <= 0) {
      chosen = k;
      break;
    }
  }

  return {
    id: chosen.id,
    label: chosen.label,
    plaintext: decryptUpstreamKey(chosen.api_key_encrypted),
    last4: chosen.api_key_last4,
  };
}

// Mark a key as failed. The gateway calls this after a non-OK upstream
// response so the next request skips it for the cooldown window.
export async function markUpstreamKeyFailure({ keyId, status, errorMessage }) {
  const sb = createServiceClient();

  let cooldownMs;
  let disable = false;
  if (status === 401 || status === 403) {
    cooldownMs = COOLDOWN_BAD_MS;
    disable = true;
  } else if (status === 429) {
    cooldownMs = COOLDOWN_429_MS;
  } else if (status >= 500 && status < 600) {
    cooldownMs = COOLDOWN_5XX_MS;
  } else {
    // Non-retriable client error — don't penalize the key.
    return;
  }

  const cooldownUntil = new Date(Date.now() + cooldownMs).toISOString();

  await sb
    .from("upstream_keys")
    .update({
      cooldown_until: cooldownUntil,
      last_error: errorMessage?.slice(0, 500) || `HTTP ${status}`,
      last_error_at: new Date().toISOString(),
      ...(disable ? { enabled: false } : {}),
    })
    .eq("id", keyId);
}
