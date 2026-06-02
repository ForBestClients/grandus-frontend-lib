import { useState, useCallback } from 'react';

import { isFoxentryEnabled, fetchFoxentryJson } from './client';

/**
 * Client-side helper for Foxentry email & phone validation.
 * Soft validation: results power a hint/suggestion under the field, they do
 * NOT block form submit (yup remains the hard gate).
 */
const useFoxentryContactValidation = () => {
  const [emailResult, setEmailResult] = useState(null);
  const [phoneResult, setPhoneResult] = useState(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);

  const checkEmail = useCallback(async email => {
    if (!isFoxentryEnabled() || !email || !email.includes('@')) {
      setEmailResult(null);
      return;
    }
    setEmailChecking(true);
    const data = await fetchFoxentryJson(
      `/api/pages/email/validate?email=${encodeURIComponent(email)}`,
    );
    setEmailResult(data?.checked ? data : null);
    setEmailChecking(false);
  }, []);

  const checkPhone = useCallback(async (phone, country) => {
    if (!isFoxentryEnabled() || !phone) {
      setPhoneResult(null);
      return;
    }
    setPhoneChecking(true);
    const url = `/api/pages/phone/validate?phone=${encodeURIComponent(phone)}${
      country ? `&country=${country}` : ''
    }`;
    const data = await fetchFoxentryJson(url);
    setPhoneResult(data?.checked ? data : null);
    setPhoneChecking(false);
  }, []);

  const clearEmail = useCallback(() => setEmailResult(null), []);
  const clearPhone = useCallback(() => setPhoneResult(null), []);

  return {
    emailResult,
    phoneResult,
    emailChecking,
    phoneChecking,
    checkEmail,
    checkPhone,
    clearEmail,
    clearPhone,
  };
};

/**
 * Identity translator: returns the source string unchanged. Lets the hint
 * builders work standalone while letting a project inject its own `t`.
 */
const identity = value => value;

/**
 * Derives a displayable hint from an email validation result.
 * Returns null when there is nothing to show (valid / not checked).
 *
 * @param result  Email validation result from the API.
 * @param {(s: string) => string} [t]  Translator (source SK string as key).
 */
export const getEmailHint = (result, t = identity) => {
  if (!result || !result.checked) {
    return null;
  }
  if (result.suggestion) {
    return {
      tone: 'warning',
      message: t('Mysleli ste'),
      highlight: result.suggestion,
      question: true,
      actionLabel: t('Použiť'),
      actionValue: result.suggestion,
    };
  }
  if (result.flags?.isDisposable) {
    return {
      tone: 'warning',
      message: t('Zadajte prosím trvalú (nie dočasnú) e-mailovú adresu.'),
    };
  }
  if (!result.isValid) {
    return {
      tone: 'warning',
      message: t('Tento e-mail sa nepodarilo overiť, skontrolujte ho prosím.'),
    };
  }
  return null;
};

/**
 * Derives a displayable hint from a phone validation result.
 *
 * @param result  Phone validation result from the API.
 * @param {(s: string) => string} [t]  Translator (source SK string as key).
 */
export const getPhoneHint = (result, t = identity) => {
  if (!result || !result.checked) {
    return null;
  }
  if (result.corrected) {
    return {
      tone: 'warning',
      message: t('Telefónne číslo uložíme ako'),
      highlight: result.correctedFormatted || result.corrected,
      actionLabel: t('Opraviť'),
      actionValue: result.corrected,
    };
  }
  if (!result.isValid) {
    return {
      tone: 'warning',
      message: t('Skontrolujte prosím telefónne číslo.'),
    };
  }
  return null;
};

export default useFoxentryContactValidation;
