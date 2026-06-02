import { foxentryRequest } from '../server';

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
