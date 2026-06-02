import { isFoxentryEnabled } from './client';

/**
 * Server-only Foxentry client. Keeps the API key on the server and guarantees
 * a single, resilient call path: every request is time-boxed and any failure
 * (disabled, network error, timeout, non-2xx, malformed body) resolves to
 * null so the calling route can fall back to legacy behaviour.
 */

const BASE_URL = 'https://api.foxentry.com';
const API_VERSION = '2.0';
const DEFAULT_TIMEOUT_MS = 3000;

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

  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...requestMembers } = extra;
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
    return payload?.response ?? null;
  } catch (err) {
    // Swallow on purpose: a Foxentry outage must never break the route.
    console.error(`Foxentry ${endpoint} unavailable:`, err?.name || 'error');
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
