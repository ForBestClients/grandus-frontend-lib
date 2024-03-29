import { useState } from "react";
import useSWR from "swr";
import get from "lodash/get";
import isFunction from "lodash/isFunction";

const useCompare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: compare,
    mutate,
    isValidating,
  } = useSWR(`/api/lib/v1/compare`, (url) => fetch(url).then((r) => r.json()), {
    revalidateOnReconnect: false,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const itemExists = (productId) => {
    return (
      get(compare, "productIds", []).findIndex(
        (element) => element == productId
      ) >= 0
    );
  };

  const itemRemove = async (productId, callback) => {
    setIsLoading(true);
    await mutate(
      await fetch(`/api/lib/v1/compare/items/${productId}`, {
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

  const itemAdd = async (productId, callback) => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/compare/items/${productId}`, {
          method: "PUT",
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
    compare,
    mutateCompare: mutate,
    isLoading: isValidating || isLoading,
    itemAdd,
    itemRemove,
    itemExists,
  };
};

export default useCompare;
