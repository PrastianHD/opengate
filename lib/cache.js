// Simple in-memory TTL cache for hot-path data.
// Models and upstream keys change rarely — safe to cache 30-60s.

const store = new Map();

export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

export function cacheSet(key, value, ttlMs) {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export function cacheInvalidate(pattern) {
  if (pattern.endsWith("*")) {
    const prefix = pattern.slice(0, -1);
    for (const key of store.keys()) {
      if (key.startsWith(prefix)) store.delete(key);
    }
  } else {
    store.delete(pattern);
  }
}

// Pre-warm cache on startup
export function cacheStats() {
  return { entries: store.size };
}
