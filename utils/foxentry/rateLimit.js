import cache, { getCacheKey } from '../cache';

/**
 * Per-IP rate limiter for the public Foxentry proxy routes.
 *
 * These routes are unauthenticated and every allowed request can trigger a paid
 * external Foxentry call, so they must be protected against scraping / quota
 * exhaustion / cost blow-ups.
 *
 * Strategy:
 *  - Primary: shared Redis client (fixed window via INCR + EXPIRE) so the limit
 *    is enforced across all app instances.
 *  - Fallback: a bounded per-process in-memory window when Redis is unavailable,
 *    so a single instance is still protected.
 *  - Fail-open: any internal error allows the request — a limiter outage must
 *    never take the form down.
 */

const DEFAULT_WINDOW_SECONDS = 60;
const DEFAULT_MAX = 30;
const MEMORY_BUCKET_LIMIT = 5000;

const memoryBuckets = new Map();

const getClientIp = request => {
  const forwarded = request?.headers?.get?.('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request?.headers?.get?.('x-real-ip') || 'unknown';
};

const checkMemory = (bucket, windowSeconds, max) => {
  const now = Date.now();

  // Opportunistic prune so the map can't grow without bound under churn.
  if (memoryBuckets.size > MEMORY_BUCKET_LIMIT) {
    for (const [key, entry] of memoryBuckets) {
      if (now > entry.reset) {
        memoryBuckets.delete(key);
      }
    }
  }

  const entry = memoryBuckets.get(bucket);
  if (!entry || now > entry.reset) {
    memoryBuckets.set(bucket, { count: 1, reset: now + windowSeconds * 1000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
};

/**
 * @param {Request} request   Incoming request (used for the client IP).
 * @param {object}  [options]
 * @param {string}  [options.name]           Bucket namespace (per route).
 * @param {number}  [options.windowSeconds]  Window length.
 * @param {number}  [options.max]            Max requests per window per IP.
 * @returns {Promise<boolean>} true if allowed, false if the limit is exceeded.
 */
export const checkRateLimit = async (
  request,
  {
    name = 'default',
    windowSeconds = DEFAULT_WINDOW_SECONDS,
    max = DEFAULT_MAX,
  } = {},
) => {
  const bucket = `foxentry-rl-${name}-${getClientIp(request)}`;

  if (cache) {
    try {
      const key = getCacheKey([bucket]);
      const count = await cache.incr(key);
      if (count === 1) {
        await cache.expire(key, windowSeconds);
      }
      return count <= max;
    } catch (err) {
      // Redis hiccup → fall back to the in-memory window below.
    }
  }

  try {
    return checkMemory(bucket, windowSeconds, max);
  } catch (err) {
    return true; // fail open
  }
};
