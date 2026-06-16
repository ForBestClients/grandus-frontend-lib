import { foxentryRequest } from '../server';
import {
  SUPPORTED_COUNTRIES,
  MIN_QUERY_LENGTH,
  MAX_QUERY_LENGTH,
} from '../constants';

/**
 * Address autocomplete via Foxentry `location/search`.
 * Returns a simplified suggestion list, or [] when disabled/unavailable.
 * Expected query params: `query`, `country` (ISO-2).
 */
export const handleAddressAutocomplete = async request => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim();
  const country = (searchParams.get('country') || '').toUpperCase();

  // Defensive bounds: too short → nothing useful; too long → reject rather
  // than forward an abusive payload to Foxentry.
  if (!query || query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return Response.json([]);
  }

  const response = await foxentryRequest(
    'location/search',
    {
      type: 'full',
      value: query,
      ...(SUPPORTED_COUNTRIES.includes(country) ? { filter: { country } } : {}),
    },
    {
      options: {
        dataScope: 'basic',
        resultsLimit: 6,
        filterMode: 'limit',
        // false => every suggestion carries a concrete house number
        // (popisné/súpisné + orientačné), no street-only results.
        allowPartialResults: false,
      },
    },
  );

  const results = response?.results;
  if (!Array.isArray(results)) {
    return Response.json([]);
  }

  const suggestions = results.map(({ data }, index) => ({
    id: data?.ids?.internal ?? `${index}`,
    street: data?.streetWithNumber ?? data?.street ?? null,
    city: data?.city ?? null,
    zip: data?.zip ?? null,
    full: data?.full ?? null,
  }));

  return Response.json(suggestions);
};
