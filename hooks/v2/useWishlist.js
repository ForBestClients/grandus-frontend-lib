import { useState } from "react";
import useSWR from "swr";
import { get, isFunction } from "lodash";
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';

const useWishlist = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { data: wishlist, mutate, isValidating } = useSWR(
    `/cz/api/lib/v2/wishlist`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const productIds = filter(get(wishlist, 'productIds', []), (item) => item);

  const productsUrl = !isEmpty(productIds)
    ? `productIds=${productIds.join('&productIds=')}`
    : false;

  const {
    data: productsData,
    isLoading: isLoadingProducts,
  } = useSWR(
    productsUrl
      ? `/cz/api/lib/v1/products?${productsUrl}&fields=${
        process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS
      }&perPage=${get(wishlist, 'productIds', []).length}`
      : null,
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
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
      await fetch(`/cz/api/lib/v2/wishlist/items/${productId}`, {
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
        await fetch(`/cz/api/lib/v2/wishlist/items/${productId}`, {
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
        await fetch(`/cz/api/lib/v2/wishlist/items/bulk`, {
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
    products: productsData?.products ?? [],
    mutateWishlist: mutate,
    isLoading: isValidating || isLoading || isLoadingProducts,
    itemAdd,
    itemRemove,
    itemExists,
    cookieItemsAssign
  };
};

export default useWishlist;
