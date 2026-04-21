const attempts = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter.  For multi-instance production deployments,
 * replace with Redis-backed rate limiting (e.g. Upstash Ratelimit).
 */
export function rateLimit(key: string, max = 5, windowMs = 60_000) {
  const now = Date.now();
  const record = attempts.get(key);
  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  if (record.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((record.resetAt - now) / 1000) };
  }
  record.count++;
  return { allowed: true };
}
