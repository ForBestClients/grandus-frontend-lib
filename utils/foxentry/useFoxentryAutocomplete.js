import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

import { isFoxentryEnabled, fetchFoxentryJson } from './client';
import { MIN_QUERY_LENGTH } from './constants';

// Foxentry's search latency is ~2–3s, so a too-eager debounce just fires
// overlapping (paid) requests while the user is still typing. 450ms keeps typing
// responsive while collapsing a burst of keystrokes into a single request.
const DEBOUNCE_MS = 450;

/**
 * Shared state machine for a Foxentry "type → suggestions → pick" input.
 * Powers AddressAutocompleteInput and CompanyNameAutocompleteInput so the
 * fetch/debounce/keyboard/click-outside logic lives in exactly one place.
 *
 * Resilience & correctness:
 *  - Suggestions are requested only when Foxentry is on AND a country is known;
 *    otherwise the field behaves as a plain input (graceful degradation).
 *  - A monotonic request sequence guards against the stale-response race: a
 *    slow earlier request can never overwrite the result of a newer keystroke.
 *  - Every request is time-boxed inside fetchFoxentryJson; failures resolve to
 *    an empty list, never an exception.
 *
 * @param {object}   opts
 * @param {string}   opts.country   ISO-2 country code (falsy → disabled).
 * @param {string}   opts.endpoint  Proxy route, e.g. "/api/pages/address/autocomplete".
 * @param {object}   [opts.params]  Extra query params appended to every request
 *                                  (e.g. { type: 'ico' } to search by IČO).
 * @param {number}   [opts.minChars]
 */
const useFoxentryAutocomplete = ({
  country,
  endpoint,
  params,
  minChars = MIN_QUERY_LENGTH,
  requireCountry = true,
}) => {
  // Address search needs a country; company search can run cross-country
  // (requireCountry: false) and resolve the country from the picked result.
  const active = isFoxentryEnabled() && (!requireCountry || Boolean(country));

  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const wrapperRef = useRef(null);
  // Bumped on every new/cancelled request; a resolved fetch whose id no longer
  // matches is discarded (latest-wins).
  const requestSeq = useRef(0);
  // Controller for the in-flight request. A newer keystroke (or a close) aborts
  // it so slow superseded requests are dropped instead of piling up — important
  // when each request can stay open for 2–3s.
  const abortRef = useRef(null);

  // Pre-serialise the extra params into a stable "&k=v" suffix. Keyed by the
  // params' content (not identity) so a fresh literal each render doesn't
  // needlessly rebuild the debounced fetch and reset the debounce timer.
  const paramsKey = JSON.stringify(params || {});
  const extraQuery = useMemo(() => {
    const search = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value != null && value !== '') {
        search.set(key, value);
      }
    });
    const serialised = search.toString();
    return serialised ? `&${serialised}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const fetchSuggestions = useMemo(
    () =>
      debounce(async (searchValue, countryCode, seq) => {
        // Drop any still-open earlier request before starting a new one.
        if (abortRef.current) {
          abortRef.current.abort();
        }
        const controller = new AbortController();
        abortRef.current = controller;

        const url =
          `${endpoint}?query=${encodeURIComponent(searchValue)}` +
          (countryCode ? `&country=${encodeURIComponent(countryCode)}` : '') +
          extraQuery;
        const data = await fetchFoxentryJson(url, undefined, controller.signal);
        if (seq !== requestSeq.current) {
          return; // a newer request started while this one was in flight
        }
        const list = Array.isArray(data) ? data : [];
        setSuggestions(list);
        setActiveIndex(-1);
        setIsOpen(list.length > 0);
        setIsLoading(false);
      }, DEBOUNCE_MS),
    [endpoint, extraQuery],
  );

  useEffect(
    () => () => {
      fetchSuggestions.cancel();
      if (abortRef.current) {
        abortRef.current.abort();
      }
    },
    [fetchSuggestions],
  );

  /** Reset everything and invalidate any in-flight request. */
  const close = useCallback(() => {
    requestSeq.current += 1;
    fetchSuggestions.cancel();
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    setIsLoading(false);
  }, [fetchSuggestions]);

  /** Feed the current input value; debounced-fetches or clears accordingly. */
  const query = useCallback(
    value => {
      if (active && value && value.trim().length >= minChars) {
        setIsLoading(true);
        requestSeq.current += 1;
        fetchSuggestions(value, country, requestSeq.current);
      } else {
        close();
      }
    },
    [active, country, minChars, fetchSuggestions, close],
  );

  /** Keyboard navigation; calls onPick(suggestion) on Enter over a row. */
  const handleKeyDown = useCallback(
    (e, onPick) => {
      if (!isOpen || !suggestions.length) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        onPick(suggestions[activeIndex]);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    },
    [isOpen, suggestions, activeIndex],
  );

  const openIfHasSuggestions = useCallback(() => {
    if (suggestions.length) {
      setIsOpen(true);
    }
  }, [suggestions]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    active,
    suggestions,
    isOpen,
    activeIndex,
    isLoading,
    wrapperRef,
    setActiveIndex,
    query,
    close,
    handleKeyDown,
    openIfHasSuggestions,
  };
};

export default useFoxentryAutocomplete;
