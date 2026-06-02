/**
 * Client-safe Foxentry helpers (no API key, importable from client components).
 *
 * Foxentry is an optional enhancement. When the feature flag is off — or any
 * request is slow/unavailable — the UI must keep working exactly as before.
 */

/** Whether the Foxentry integration is turned on (client + server readable). */
export const isFoxentryEnabled = () =>
  process.env.NEXT_PUBLIC_FOXENTRY_ENABLED === 'true';

/** Default timeout for client → our-proxy requests. */
const DEFAULT_CLIENT_TIMEOUT_MS = 4000;

/**
 * Fetches JSON from one of the Foxentry proxy routes with a hard timeout.
 * Never throws and never hangs: returns the parsed body, or null on any
 * error / timeout / non-2xx response, so callers degrade gracefully.
 */
export const fetchFoxentryJson = async (
  url,
  timeoutMs = DEFAULT_CLIENT_TIMEOUT_MS,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (err) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};
