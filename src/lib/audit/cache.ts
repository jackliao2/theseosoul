/**
 * In-memory TTL cache for serverless (Vercel).
 * Survives on warm instances only — enough to cut repeat RDAP/DoH/audit load.
 * Swap for Redis/KV later if you scale across many regions.
 */

type Entry<T> = { value: T; expiresAt: number };

const store = new Map<string, Entry<unknown>>();
const MAX_KEYS = 500;

function sweep(): void {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
  if (store.size <= MAX_KEYS) return;
  const overflow = store.size - MAX_KEYS;
  const keys = store.keys();
  for (let i = 0; i < overflow; i += 1) {
    const next = keys.next();
    if (next.done) break;
    store.delete(next.value);
  }
}

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function cacheSet<T>(key: string, value: T, ttlMs: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
  if (store.size > MAX_KEYS || store.size % 40 === 0) sweep();
}

/** Full audit snapshot — short TTL so reports stay reasonably fresh. */
export const AUDIT_CACHE_TTL_MS = 15 * 60 * 1000;

/** WHOIS / DNS / SSL — change slowly; cache longer to protect free upstreams. */
export const PROBE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
