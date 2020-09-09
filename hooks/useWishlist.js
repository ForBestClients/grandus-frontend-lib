import { useState } from "react";
import useSWR from "swr";
import { isFunction, find, get, parseInt } from "lodash";
import { transformWishlist } from "grandus-lib/utils/transformers";

const useWishlist = () => {
  const [isLoading, setIsLoading] = useState(false);

  const { data, mutate, isValidating } = useSWR(
    `/api/lib/v1/wishlist`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  let wishlist = transformWishlist(data);

  const getItem = (productId) => {
    return find(
      wishlist?.items,
      (item) => get(item, "product.id") == productId
    );
  };

  const itemExists = (productId) => {
    return getItem(productId) ? true : false;
  };

  const itemRemove = async (productId, callback) => {
    mutate(
      {
        ...wishlist,
        count:
          parseInt(get(wishlist, "count", 0)) > 0
            ? parseInt(get(wishlist, "count")) - 1
            : 0,
      },
      false
    );

    const wishlistItem = getItem(productId);

    if (!wishlistItem) {
      await mutate();
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    await mutate(
      await fetch(`/api/lib/v1/wishlist/items/${wishlistItem?.id}`, {
        method: "DELETE",
      }).then((result) => {
        if (isFunction(callback)) {
          callback(result);
        }
        setIsLoading(false);
        return result.json();
      }),
      false
    );

    setIsLoading(false);
  };

  const itemAdd = async (productId, callback) => {
    setIsLoading(true);
    mutate(
      {
        ...wishlist,
        count: parseInt(get(wishlist, "count", 0)) + 1,
      },
      false
    );
    try {
      await mutate(
        await fetch(`/api/lib/v1/wishlist/items/${productId}`, {
          method: "POST",
        }).then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          setIsLoading(false);
          return result.json();
        }),
        false
      );
    } catch (error) {
      setIsLoading(false);
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
  };
};

export default useWishlist;
