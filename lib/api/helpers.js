// Shared helpers for app/api route handlers.

import { createClient } from "@/lib/supabase/server";

export function jsonError(status, code, message) {
  return Response.json({ error: { code, message } }, { status });
}

export function clampInt(v, min, max) {
  if (v == null || v === "") return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return null;
  return Math.max(min, Math.min(max, n));
}

export function toFiniteNumber(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

// Authenticate the caller via Supabase auth cookie. Returns the supabase
// client and user, or `{ response }` populated with a 401 JSON error.
export async function requireUser() {
  const sb = await createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return {
      sb: null,
      user: null,
      response: jsonError(401, "unauthenticated", "Sign in required"),
    };
  }
  return { sb, user, response: null };
}

// Restrict a redirect target to same-origin paths so `?next=...` cannot be
// turned into an open-redirect gadget. Anything that doesn't start with a
// single `/` (and isn't `//foo` style protocol-relative) falls back.
export function safeNextPath(next, fallback = "/dashboard") {
  if (typeof next !== "string" || next.length === 0) return fallback;
  if (!next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}

// Escape user input so it can be passed safely to PostgREST `.ilike()`.
// `%` and `_` are wildcards; backslash escapes the wildcards themselves.
export function escapeLikePattern(s) {
  return String(s).replace(/[\\%_]/g, "\\$&");
}
