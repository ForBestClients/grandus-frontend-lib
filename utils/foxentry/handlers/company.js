import { foxentryRequest } from '../server';
import { MIN_QUERY_LENGTH, MAX_QUERY_LENGTH } from '../constants';

// Company name autosuggest is restricted to these countries — PL and any others
// are dropped even if Foxentry returns them. (Foxentry's filter.country accepts a
// single ISO-2 only, not a list, so the search is cross-country and we filter
// server-side afterwards.)
const COMPANY_SEARCH_COUNTRIES = ['SK', 'CZ'];
const COMPANY_SEARCH_LIMIT = 7;

// `company/search` discriminates which field is searched via query.type. We
// expose a small project-facing vocabulary ('name' | 'ico') and translate it to
// Foxentry's field names here, so callers never need to know Foxentry internals.
// Unknown/missing values fall back to a name search (the original behaviour).
const COMPANY_SEARCH_TYPES = {
  name: 'name',
  ico: 'registrationNumber',
};

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
 * data. The same endpoint backs both the company-name and the IČO field —
 * `type` selects which one is searched (defaults to name).
 *
 * Expected query params: `query` (the typed value), `type` ('name' | 'ico',
 * optional), `country` (ISO-2, optional).
 *
 * @param {Request} request
 */
export const handleCompanySearch = async request => {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('query')?.trim();
  // `type` is attacker-controlled on this unauthenticated route. A plain
  // `MAP[type] || 'name'` lookup is unsafe: inherited keys ("__proto__",
  // "toString", …) resolve to truthy prototype members, bypassing the default
  // and forwarding a malformed `type` to the paid Foxentry call. hasOwnProperty
  // restricts it to the two real keys.
  const requestedType = searchParams.get('type');
  const searchType = Object.prototype.hasOwnProperty.call(
    COMPANY_SEARCH_TYPES,
    requestedType,
  )
    ? COMPANY_SEARCH_TYPES[requestedType]
    : 'name';

  // Defensive bounds: too short → nothing useful; too long → reject rather
  // than forward an abusive payload to Foxentry.
  if (!query || query.length < MIN_QUERY_LENGTH || query.length > MAX_QUERY_LENGTH) {
    return Response.json([]);
  }

  // Cross-country search (no country filter), then keep only SK/CZ below. A
  // larger resultsLimit leaves enough rows to survive the country filter.
  const response = await foxentryRequest(
    'company/search',
    { type: searchType, value: query },
    { options: { dataScope: 'basic', resultsLimit: 15 } },
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
    .filter(
      item => item.name && COMPANY_SEARCH_COUNTRIES.includes(item.country),
    )
    .slice(0, COMPANY_SEARCH_LIMIT);

  return Response.json(suggestions);
};
