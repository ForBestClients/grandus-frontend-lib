import { foxentryRequest } from '../server';

const NOT_CHECKED = { checked: false };

/**
 * Email validation via Foxentry `email/validate` (extended).
 * Returns a normalized result, or { checked: false } when disabled/unavailable.
 * Expected query param: `email`.
 */
export const handleEmailValidate = async request => {
  const email = request.nextUrl.searchParams.get('email');

  if (!email || !email.includes('@')) {
    return Response.json(NOT_CHECKED);
  }

  const response = await foxentryRequest(
    'email/validate',
    { email },
    { options: { validationType: 'extended' } },
  );

  const result = response?.result;
  if (!result) {
    return Response.json(NOT_CHECKED);
  }

  // A typo correction lands in resultCorrected (extended) or suggestions (basic).
  const suggestion =
    response?.resultCorrected?.data?.email ??
    response?.suggestions?.[0]?.data?.email ??
    null;

  return Response.json({
    checked: true,
    isValid: result.isValid === true,
    proposal: result.proposal ?? null,
    suggestion,
    flags: {
      isDisposable: result.flags?.isDisposableEmailAddress === true,
      isFreemail: result.flags?.isFreemail === true,
      isPhishing: result.flags?.isPhishingDomain === true,
    },
  });
};
