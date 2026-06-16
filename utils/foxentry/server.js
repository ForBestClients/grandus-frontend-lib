import { isFoxentryEnabled } from './client';
import cache, { getCacheKey } from '../cache';

/**
 * Server-only Foxentry client. Keeps the API key on the server and guarantees
 * a single, resilient call path: every request is time-boxed and any failure
 * (disabled, network error, timeout, non-2xx, malformed body) resolves to
 * null so the calling route can fall back to legacy behaviour.
 */

const BASE_URL = 'https://api.foxentry.com';
const API_VERSION = '2.0';
const DEFAULT_TIMEOUT_MS = 3000;

// Per-endpoint response cache TTL (seconds). Foxentry calls are paid and these
// lookups are highly repetitive (same IČO / company / email across users), so a
// short shared cache cuts cost and latency. A caller may override per request
// via `extra.cacheTtl` (0 disables). No-op when Redis (CACHE_ENABLED) is off.
const DEFAULT_CACHE_TTL = {
  'company/get': 86400, // registry data by IČO — stable
  'company/search': 300, // name autosuggest — keep fresh-ish
  'location/search': 3600, // address autosuggest
  'email/validate': 86400, // email validity — stable
  'phone/validate': 86400, // phone validity — stable
};

/** Foxentry is usable server-side only when the flag is on AND a key exists. */
export const isFoxentryServerEnabled = () =>
  isFoxentryEnabled() && Boolean(process.env.FOXENTRY_API_KEY);

/**
 * Calls a Foxentry endpoint (e.g. "company/get", "email/validate").
 *
 * @param {string} endpoint  Foxentry endpoint path.
 * @param {object} query     The `request.query` payload.
 * @param {object} [extra]   Extra request members (`options`, `client`) plus an
 *                           optional `timeoutMs`.
 * @returns {Promise<object|null>} The `response` object, or null on any failure.
 *                                 Never throws.
 */
export const foxentryRequest = async (endpoint, query, extra = {}) => {
  if (!isFoxentryServerEnabled()) {
    return null;
  }

  const {
    timeoutMs = DEFAULT_TIMEOUT_MS,
    cacheTtl: explicitCacheTtl,
    ...requestMembers
  } = extra;
  const cacheTtl = explicitCacheTtl ?? DEFAULT_CACHE_TTL[endpoint] ?? 0;

  // Short-lived response cache (shared Redis) to collapse repeated identical
  // lookups and cut paid Foxentry calls. Off when cacheTtl is 0 or Redis is
  // disabled; read/write errors are swallowed so we always degrade to a live
  // call rather than failing.
  const cacheKey =
    cacheTtl > 0 && cache
      ? getCacheKey([
          'foxentry',
          endpoint,
          JSON.stringify(query),
          JSON.stringify(requestMembers),
        ])
      : null;

  if (cacheKey) {
    try {
      const cached = await cache.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      // ignore – fall through to a live request
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${process.env.FOXENTRY_API_KEY}`,
        'Api-Version': API_VERSION,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ request: { query, ...requestMembers } }),
    });

    if (!response.ok) {
      return null;
    }

    const payload = await response.json();
    const result = payload?.response ?? null;

    if (cacheKey && result) {
      try {
        await cache.set(cacheKey, JSON.stringify(result), 'EX', cacheTtl);
      } catch (err) {
        // ignore cache write failures
      }
    }

    return result;
  } catch (err) {
    // Swallow on purpose: a Foxentry outage must never break the route.
    console.error(`Foxentry ${endpoint} unavailable:`, err?.name || 'error');
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
