import { foxentryRequest } from '../server';

const NOT_CHECKED = { checked: false };

/**
 * Phone validation via Foxentry `phone/validate`.
 * Returns a normalized result, or { checked: false } when disabled/unavailable.
 * Expected query params: `phone` (E.164 preferred), optional `country` (ISO-2).
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
    { numberWithPrefix: phone },
    {
      options: { validationType: 'basic' },
      ...(country.length === 2 ? { client: { country } } : {}),
    },
  );

  const result = response?.result;
  if (!result) {
    return Response.json(NOT_CHECKED);
  }

  const corrected = response?.resultCorrected;

  return Response.json({
    checked: true,
    isValid: result.isValid === true,
    proposal: result.proposal ?? null,
    carrierType: result.data?.carrier?.type ?? null,
    corrected: corrected?.data?.numberWithPrefix ?? null,
    correctedFormatted: corrected?.data?.format?.internationalFormatted ?? null,
  });
};
