/*
 * Fixed-window rate limiter, in-process.
 *
 * Caveat worth knowing: serverless deployments run many isolated instances, so
 * counters are per-instance rather than global — this caps abuse, it does not
 * enforce an exact ceiling. It needs no infrastructure, which is the right
 * trade for now; swap the Map for Redis/Upstash if a hard global limit is
 * ever required. The Anthropic account's own spend limit remains the real
 * backstop.
 */

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

// Drop expired windows occasionally so the Map cannot grow without bound.
function sweep(now: number): void {
  if (buckets.size < 1000) return;
  for (const [key, w] of buckets) {
    if (w.resetAt <= now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  /** Seconds until the window resets — used for the Retry-After header. */
  retryAfter: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  existing.count += 1;
  const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
  if (existing.count > limit) {
    return { allowed: false, remaining: 0, retryAfter };
  }
  return { allowed: true, remaining: limit - existing.count, retryAfter };
}

/**
 * Best-effort client identity. Behind a proxy the leftmost x-forwarded-for
 * entry is the client; it is spoofable in principle, so this is a cost guard
 * rather than a security boundary (authentication is the boundary).
 */
export function clientKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

/** 429 response with the standard Retry-After header. */
export function tooManyRequests(retryAfter: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfter),
    },
  });
}
