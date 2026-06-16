import { foxentryRequest } from '../server';

const NOT_CHECKED = { checked: false };

/**
 * Phone validation via Foxentry `phone/validate`.
 * Returns a normalized result, or { checked: false } when disabled/unavailable.
 * Expected query params: `phone` (E.164 preferred), optional `country` (ISO-2).
 *
 * API 2.1: the query parameter is `number` (the older `numberWithPrefix` is
 * rejected). A correction comes back as `resultCorrected` — the full number in
 * `data.numberFull`, formatted variants in `data.format` (e123/e164/national).
 * For an ambiguous national number (no prefix) 2.1 returns a list of per-country
 * `suggestions` instead, so we pick the one matching the client `country`.
 */
export const handlePhoneValidate = async request => {
  const searchParams = request.nextUrl.searchParams;
  const phone = searchParams.get('phone');
  const country = (searchParams.get('country') || '').toUpperCase();

  if (!phone) {
    return Response.json(NOT_CHECKED);
  }

  const response = await foxentryRequest(
    'phone/validate',
    { number: phone },
    {
      options: { validationType: 'basic' },
      ...(country.length === 2 ? { client: { country } } : {}),
    },
  );

  const result = response?.result;
  if (!result) {
    return Response.json(NOT_CHECKED);
  }

  let corrected = response?.resultCorrected?.data ?? null;
  if (!corrected && country.length === 2 && Array.isArray(response?.suggestions)) {
    corrected =
      response.suggestions.find(s => s?.data?.country?.code === country)?.data ??
      null;
  }

  return Response.json({
    checked: true,
    isValid: result.isValid === true,
    proposal: result.proposal ?? null,
    carrierType: result.data?.carrier?.type ?? null,
    corrected: corrected?.numberFull ?? null,
    correctedFormatted: corrected?.format?.e123 ?? corrected?.format?.e164 ?? null,
  });
};
