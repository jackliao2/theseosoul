/**
 * Lightweight sliding-window rate limits (per warm instance).
 * Free / no Redis — good enough for Vercel hobby & early traffic.
 */

type Bucket = number[];

const ipMinute = new Map<string, Bucket>();
const ipHour = new Map<string, Bucket>();
const domainMinute = new Map<string, Bucket>();

const IP_PER_MINUTE = 8;
const IP_PER_HOUR = 40;
const DOMAIN_PER_MINUTE = 6;

function prune(bucket: Bucket, windowMs: number, now: number): Bucket {
  const cutoff = now - windowMs;
  let i = 0;
  while (i < bucket.length && bucket[i] <= cutoff) i += 1;
  return i === 0 ? bucket : bucket.slice(i);
}

function hit(
  map: Map<string, Bucket>,
  key: string,
  limit: number,
  windowMs: number,
  now: number
): { ok: true } | { ok: false; retryAfterSec: number } {
  const next = prune(map.get(key) ?? [], windowMs, now);
  if (next.length >= limit) {
    const oldest = next[0] ?? now;
    const retryAfterSec = Math.max(
      1,
      Math.ceil((oldest + windowMs - now) / 1000)
    );
    map.set(key, next);
    return { ok: false, retryAfterSec };
  }
  next.push(now);
  map.set(key, next);
  return { ok: true };
}

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; reason: "ip" | "domain" };

export function checkAuditRateLimit(
  ip: string,
  domain: string
): RateLimitResult {
  const now = Date.now();
  const ipKey = (ip || "unknown").slice(0, 64);
  const domainKey = domain.toLowerCase().replace(/^www\./, "").slice(0, 253);

  const minute = hit(ipMinute, ipKey, IP_PER_MINUTE, 60_000, now);
  if (!minute.ok) {
    return { ok: false, retryAfterSec: minute.retryAfterSec, reason: "ip" };
  }

  const hour = hit(ipHour, ipKey, IP_PER_HOUR, 60 * 60_000, now);
  if (!hour.ok) {
    return { ok: false, retryAfterSec: hour.retryAfterSec, reason: "ip" };
  }

  const dom = hit(domainMinute, domainKey, DOMAIN_PER_MINUTE, 60_000, now);
  if (!dom.ok) {
    return { ok: false, retryAfterSec: dom.retryAfterSec, reason: "domain" };
  }

  return { ok: true };
}

export function clientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip")?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}
