import { useState } from "react";
import useSWR from "swr";

const useCookieConsent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: cookieConsent, mutate, isValidating } = useSWR(
    `/api/lib/v1/gdpr/cookie-consent`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const accept = async () => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/gdpr/cookie-consent`, {
          method: "PUT",
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
    accept,
  };
};

export default useCookieConsent;
