/**
 * Client-safe Foxentry helpers (no API key, importable from client components).
 *
 * Foxentry is an optional enhancement. When the feature flag is off — or any
 * request is slow/unavailable — the UI must keep working exactly as before.
 */

/**
 * Whether the API integration is turned on (server proxy routes + the React
 * autosuggest/validation components). Client + server readable.
 */
export const isFoxentryEnabled = () =>
  process.env.NEXT_PUBLIC_FOXENTRY_ENABLED === 'true';

/**
 * Whether the JS "Implementation via script" integration is turned on. This is
 * the Foxentry JS API v2 (speaks API 2.1): a CDN loader binds directly to inputs
 * mapped in the app.foxentry.com dashboard. Fully independent from the API
 * integration above — either may run without the other.
 */
export const isFoxentryJsEnabled = () =>
  process.env.NEXT_PUBLIC_FOXENTRY_JS_ENABLED === 'true';

/**
 * Public Foxentry project ID for the JS integration. Safe to expose to the
 * client (it is not the secret API key). Empty string when unset — the loader
 * treats that as "disabled" and is never injected.
 */
export const getFoxentryJsProjectId = () =>
  process.env.NEXT_PUBLIC_FOXENTRY_JS_PROJECT_ID || '';

// The proxy adds the Foxentry round-trip (which alone is ~2–3s, up to ~4s for
// address search) on top of our own hop, so the client ceiling must sit above
// the server one (6s) — otherwise the client would abort a request the server
// is still legitimately waiting on. Still bails on a true hang.
const DEFAULT_CLIENT_TIMEOUT_MS = 8000;

/**
 * Fetches JSON from one of the Foxentry proxy routes with a hard timeout.
 * Never throws and never hangs: returns the parsed body, or null on any
 * error / timeout / non-2xx response, so callers degrade gracefully.
 *
 * An optional `externalSignal` lets the caller cancel an in-flight request
 * (e.g. an autosuggest superseded by a newer keystroke) so stale requests are
 * dropped instead of piling up.
 */
export const fetchFoxentryJson = async (
  url,
  timeoutMs = DEFAULT_CLIENT_TIMEOUT_MS,
  externalSignal = null,
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const onExternalAbort = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      externalSignal.addEventListener('abort', onExternalAbort, { once: true });
    }
  }

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
    if (externalSignal) {
      externalSignal.removeEventListener('abort', onExternalAbort);
    }
  }
};
