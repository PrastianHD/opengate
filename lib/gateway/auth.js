// Gateway authentication.
// Token format issued in Stage 6: ogt-{32 chars}
// Stored as: sha256(plain + GATEWAY_KEY_HASH_SALT) — NOT plain.
//
// On each request:
//   1. Parse `Authorization: Bearer ogt-…`
//   2. Hash + lookup gateway_keys row
//   3. Validate enabled, not revoked, not expired, spending cap not exceeded
//   4. Load user (balance, role, banned_at, rpm_cap)
//
// All reads use the service-role client because the gateway runs without
// a Supabase auth session.

import crypto from "node:crypto";
import { createServiceClient } from "@/lib/supabase/server";

export const TOKEN_PREFIX = "ogt-";

export function hashGatewayKey(plain) {
  const salt = process.env.GATEWAY_KEY_HASH_SALT;
  if (!salt) throw new Error("GATEWAY_KEY_HASH_SALT not configured");
  return crypto.createHash("sha256").update(plain + salt).digest("hex");
}

function bearerToken(req) {
  const h = req.headers.get("authorization") || req.headers.get("Authorization");
  if (!h) return null;
  const m = h.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}

// Returns { ok: true, user, key } or { ok: false, status, error }.
// Uses a single joined query instead of 2 separate queries.
export async function authenticate(request) {
  const token = bearerToken(request);
  if (!token) {
    return errResp(401, "missing_authorization", "Missing Authorization header");
  }
  if (!token.startsWith(TOKEN_PREFIX)) {
    return errResp(401, "invalid_token_prefix", "Token must start with 'ogt-'");
  }

  const sb = createServiceClient();
  const keyHash = hashGatewayKey(token);

  // Single query: join gateway_keys → users
  const { data: key, error } = await sb
    .from("gateway_keys")
    .select(
      "id, user_id, label, enabled, model_whitelist, rpm_cap, " +
        "spending_cap_micro_cents, spending_used_micro_cents, expires_at, revoked_at, " +
        "users(id, email, role, balance_micro_cents, rpm_cap, banned_at)"
    )
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) {
    return errResp(500, "auth_lookup_failed", error.message);
  }
  if (!key) {
    return errResp(401, "invalid_api_key", "API key not recognized");
  }
  if (key.revoked_at) {
    return errResp(401, "key_revoked", "API key has been revoked");
  }
  if (!key.enabled) {
    return errResp(401, "key_disabled", "API key is disabled");
  }
  if (key.expires_at && new Date(key.expires_at) <= new Date()) {
    return errResp(401, "key_expired", "API key has expired");
  }
  if (
    key.spending_cap_micro_cents != null &&
    key.spending_used_micro_cents >= key.spending_cap_micro_cents
  ) {
    return errResp(402, "key_spending_cap_exceeded", "Key spending cap reached");
  }

  const user = key.users;
  if (!user) {
    return errResp(500, "user_lookup_failed", "User record missing");
  }
  if (user.banned_at) {
    return errResp(403, "account_banned", "Account is suspended");
  }

  // Effective RPM cap: key override > user override > env default
  const effectiveRpm =
    key.rpm_cap || user.rpm_cap || Number(process.env.GATEWAY_DEFAULT_RPM) || 200;

  return {
    ok: true,
    user,
    key,
    effectiveRpm,
  };
}

function errResp(status, code, message) {
  return { ok: false, status, error: { code, message } };
}

// Update last_used_at on the key (fire-and-forget — no await needed).
export function touchGatewayKey(keyId) {
  const sb = createServiceClient();
  return sb
    .from("gateway_keys")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", keyId);
}
