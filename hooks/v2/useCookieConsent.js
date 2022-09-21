import { useState } from "react";
import useSWR from "swr";

import {
  ANALYTICS_COOKIES,
  MARKETING_COOKIES,
  PROFILING_COOKIES,
  RETARGETING_COOKIES,
  COOKIES_ACCEPTED,
  COOKIES_REJECTED,
} from "grandus-lib/constants/CookieConstants";

const useCookieConsent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: cookieConsent,
    mutate,
    isValidating,
  } = useSWR(
    `/api/lib/v1/gdpr/cookie-consent`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const getConsentValue = (cookieConsentData, name) => {
    return cookieConsentData[name] ? COOKIES_ACCEPTED : COOKIES_REJECTED;
  };

  const acceptSelected = async (cookieConsentData = {}) => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/gdpr/cookie-consent`, {
          method: "PUT",
          body: JSON.stringify({
            [ANALYTICS_COOKIES]: getConsentValue(
              cookieConsentData,
              ANALYTICS_COOKIES
            ),
            [MARKETING_COOKIES]: getConsentValue(
              cookieConsentData,
              MARKETING_COOKIES
            ),
            [PROFILING_COOKIES]: getConsentValue(
              cookieConsentData,
              PROFILING_COOKIES
            ),
            [RETARGETING_COOKIES]: getConsentValue(
              cookieConsentData,
              RETARGETING_COOKIES
            ),
          }),
        }).then((result) => result.json()),
        false
      );
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const acceptAll = async () => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/gdpr/cookie-consent`, {
          method: "PUT",
          body: JSON.stringify({
            [ANALYTICS_COOKIES]: COOKIES_ACCEPTED,
            [MARKETING_COOKIES]: COOKIES_ACCEPTED,
            [PROFILING_COOKIES]: COOKIES_ACCEPTED,
            [RETARGETING_COOKIES]: COOKIES_ACCEPTED,
          }),
        }).then((result) => result.json()),
        false
      );
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const rejectAll = async () => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/gdpr/cookie-consent`, {
          method: "PUT",
          body: JSON.stringify({
            [ANALYTICS_COOKIES]: COOKIES_REJECTED,
            [MARKETING_COOKIES]: COOKIES_REJECTED,
            [PROFILING_COOKIES]: COOKIES_REJECTED,
            [RETARGETING_COOKIES]: COOKIES_REJECTED,
          }),
        }).then((result) => result.json()),
        false
      );
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  return {
    cookieConsent,
    mutateCookieConsent: mutate,
    isLoading: isValidating || isLoading,
    acceptAll,
    acceptSelected,
    rejectAll,
  };
};

export default useCookieConsent;
