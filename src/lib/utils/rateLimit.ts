/**
 * Simple in-memory rate limiter.
 * Stores hit counts per key with a sliding window.
 */
const store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  /** Max requests allowed per window */
  limit: number;
  /** Window size in seconds */
  windowSec: number;
}

export function rateLimit(key: string, opts: RateLimitOptions): { ok: boolean; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowSec * 1000 });
    return { ok: true, remaining: opts.limit - 1 };
  }

  if (entry.count >= opts.limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count += 1;
  return { ok: true, remaining: opts.limit - entry.count };
}

/** Derive a key from a request (IP + optional suffix) */
export function rateLimitKey(req: Request, suffix = ""): string {
  const ip =
    (req.headers as Headers).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    (req.headers as Headers).get("x-real-ip") ??
    "unknown";
  return suffix ? `${ip}:${suffix}` : ip;
}
