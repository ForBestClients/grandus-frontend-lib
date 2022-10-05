import { useState } from "react";
import useSWR from "swr";

import get from "lodash/get";
import isFunction from "lodash/isFunction";

const useSessionStorage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: session,
    mutate,
    isValidating,
  } = useSWR(`/api/lib/v1/session`, (url) => fetch(url).then((r) => r.json()), {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const itemExists = (name) => {
    return get(session, name, null);
  };

  const itemRemove = async (name, callback) => {
    setIsLoading(true);
    await mutate(
      await fetch(`/api/lib/v1/session/${name}`, {
        method: "DELETE",
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        }),
      false
    );
    setIsLoading(false);
  };

  const itemAdd = async (name, value, callback) => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/session/${name}`, {
          method: "PUT",
          body: JSON.stringify(value),
        })
          .then((result) => result.json())
          .then((result) => {
            if (isFunction(callback)) {
              callback(result);
            }
            return result;
          }),
        false
      );
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  return {
    session,
    mutateSessionStorage: mutate,
    isLoading: isValidating || isLoading,
    itemAdd,
    itemRemove,
    itemExists,
  };
};

export default useSessionStorage;
