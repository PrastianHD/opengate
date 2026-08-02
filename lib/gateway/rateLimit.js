// RPM rate limiting via Upstash Ratelimit (sliding window, 1 minute).
// Falls back to no-op if Upstash isn't configured (local dev).
//
// Per-user cap: users.rpm_cap (overrides default), or GATEWAY_DEFAULT_RPM.
// We cache Ratelimit instances by cap value so we don't recreate them.

import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "@/lib/upstash";

const limiterCache = new Map();

function getLimiter(rpm) {
  if (limiterCache.has(rpm)) return limiterCache.get(rpm);
  const redis = getRedis();
  if (!redis) return null;
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(rpm, "60 s"),
    prefix: "ogt:rl",
    analytics: false,
  });
  limiterCache.set(rpm, limiter);
  return limiter;
}

// Returns { ok, limit, remaining, reset } where reset is ms-since-epoch.
// If Upstash isn't configured or unreachable, returns { ok: true } — fail open.
export async function checkRpm({ userId, rpm }) {
  const limiter = getLimiter(rpm);
  if (!limiter) {
    return { ok: true, limit: rpm, remaining: rpm, reset: 0, skipped: true };
  }
  try {
    const result = await limiter.limit(`user:${userId}`);
    return {
      ok: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
      skipped: false,
    };
  } catch (err) {
    console.warn("[rateLimit] Upstash unreachable, skipping:", err?.message);
    return { ok: true, limit: rpm, remaining: rpm, reset: 0, skipped: true };
  }
}
