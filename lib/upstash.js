// Lazy Upstash Redis client.
// Returns null if not configured — gateway falls back to "no rate limit"
// (logs a warning) so local dev without Upstash still works.

import { Redis } from "@upstash/redis";

let _client = null;

export function getRedis() {
  if (_client) return _client;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  _client = new Redis({ url, token });
  return _client;
}

export function hasRedis() {
  return !!(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
}
