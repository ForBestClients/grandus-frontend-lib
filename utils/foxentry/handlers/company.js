import { foxentryRequest } from '../server';
import {
  SUPPORTED_COUNTRIES,
  MIN_QUERY_LENGTH,
  MAX_QUERY_LENGTH,
} from '../constants';

/**
 * Company autocomplete (by registration number / IČO).
 *
 * Preferred path is Foxentry `company/get`. When Foxentry is disabled or
 * unavailable, control is handed to the project-provided `backendFallback`
 * so the original backend lookup keeps working. The fallback is injected
 * (not imported) to keep this package free of project-specific session/auth
 * code.
 *
 * Expected query params: `ico`, `country` (ISO-2 for Foxentry). Any params
 * needed by the fallback (e.g. `countryId`) are read by the fallback itself.
 *
 * @param {Request} request
 * @param {object} deps
 * @param {(request: Request) => Promise<any>} deps.backendFallback
 */
export const handleCompanyAutocomplete = async (request, { backendFallback }) => {
  const searchParams = request.nextUrl.searchParams;
  const ico = searchParams.get('ico');
  const country = searchParams.get('country');

  if (ico && country) {
    const response = await foxentryRequest(
      'company/get',
      { country, registrationNumber: ico },
      { options: { dataScope: 'basic' } },
    );

    const data = response?.results?.[0]?.data;
    if (data) {
      return Response.json({
        name: data.name ?? null,
        dic: data.taxNumber ?? data.vatNumber ?? null,
        icDph: data.vatNumber ?? null,
      });
    }
    // Foxentry off/unavailable → fall through to the legacy backend lookup.
  }

  try {
    return Response.json(await backendFallback(request));
  } catch (err) {
    console.error('Company autocomplete backend error:', err);
    return Response.json({});
  }
};

/**
 * Company search/autocomplete by name via Foxentry `company/search`.
 *
 * Mirrors the address autosuggest: returns a simplified suggestion list while
 * the user types, or [] when Foxentry is disabled/unavailable. There is no
 * legacy backend fallback here — searching companies by name is a Foxentry-only
 * enhancement, so the field simply behaves as a plain input when it is off.
 *
 * Each suggestion carries the identifiers needed to fill the rest of the form
 * (IČO/DIČ/IČ DPH); the caller may also re-run the IČO lookup for canonical
 * data. Expected query params: `query` (the typed name), `country` (ISO-2).
 *
 * @param {Request} request
 */
export const handleCompanySearch = async request => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim();
  const country = (searchParams.get('country') || '').toUpperCase();

  // Defensive bounds: too short → nothing useful; too long → reject rather
  // than forward an abusive payload to Foxentry.
  if (!query || query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return Response.json([]);
  }

  const response = await foxentryRequest(
    'company/search',
    {
      type: 'name',
      value: query,
      ...(SUPPORTED_COUNTRIES.includes(country)
        ? { filter: { country } }
        : {}),
    },
    { options: { dataScope: 'basic', resultsLimit: 7 } },
  );

  const results = response?.results;
  if (!Array.isArray(results)) {
    return Response.json([]);
  }

  const suggestions = results
    .map(({ data }, index) => ({
      id: data?.uuid ?? data?.registrationNumber ?? `${index}`,
      name: data?.name ?? null,
      ico: data?.registrationNumber ?? null,
      dic: data?.taxNumber ?? data?.vatNumber ?? null,
      icDph: data?.vatNumber ?? null,
      country: data?.country ?? null,
    }))
    .filter(item => item.name);

  return Response.json(suggestions);
};
