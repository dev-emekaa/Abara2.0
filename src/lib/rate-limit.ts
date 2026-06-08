/**
 * Minimal fixed-window rate limiter.
 *
 * In-memory on purpose: it's per-server-instance, which is enough to blunt
 * abuse of the paid AI endpoint in this prototype. For strict, global limits
 * across serverless instances, swap the store for Upstash Redis (same API).
 *
 * Pure-ish and clock-injectable so it's easy to unit-test.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const store = new Map<string, Bucket>();

export interface RateLimitOptions {
  limit: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets (for the Retry-After header). */
  retryAfterSec: number;
  limit: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
  now: number = Date.now(),
): RateLimitResult {
  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    // Opportunistically drop one expired neighbour to bound memory growth.
    if (store.size > 5000) {
      for (const [k, b] of store) {
        if (now >= b.resetAt) store.delete(k);
      }
    }
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0, limit };
  }

  if (bucket.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      limit,
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    remaining: limit - bucket.count,
    retryAfterSec: 0,
    limit,
  };
}

/** Test helper — clears all buckets. */
export function _resetRateLimit(): void {
  store.clear();
}
