/**
 * Client-safe Foxentry helpers (no API key, importable from client components).
 *
 * Foxentry is an optional enhancement. When the feature flag is off — or any
 * request is slow/unavailable — the UI must keep working exactly as before.
 */

/** Whether the Foxentry integration is turned on (client + server readable). */
export const isFoxentryEnabled = () =>
  process.env.NEXT_PUBLIC_FOXENTRY_ENABLED === 'true';

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
