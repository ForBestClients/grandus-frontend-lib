import { useState } from "react";
import useSWR from "swr";
import { get, isFunction } from "lodash";

const useWishlist = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: wishlist, mutate, isValidating } = useSWR(
    `/api/lib/v2/wishlist`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const itemExists = (productId) => {
    return (
      get(wishlist, "productIds", []).findIndex(
        (element) => element == productId
      ) >= 0
    );
  };

  const itemRemove = async (productId, callback) => {
    setIsLoading(true);
    await mutate(
      await fetch(`/api/lib/v2/wishlist/items/${productId}`, {
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
        await fetch(`/api/lib/v2/wishlist/items/${productId}`, {
          method: "POST",
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

  const cookieItemsAssign = async (callback) => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v2/wishlist/items/bulk`, {
          method: "POST",
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
    wishlist,
    mutateWishlist: mutate,
    isLoading: isValidating || isLoading,
    itemAdd,
    itemRemove,
    itemExists,
    cookieItemsAssign
  };
};

export default useWishlist;