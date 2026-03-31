import { useState, useCallback } from "react";
import useSWR, { mutate as globalMutate } from "swr";

const broadcastMutate = () =>
  globalMutate((key) => typeof key === "string" && key.startsWith("/api/lib/v1/shopping-list"));
import isFunction from "lodash/isFunction";
import find from "lodash/find";
import filter from "lodash/filter";
import forEach from "lodash/forEach";
import map from "lodash/map";
import intersection from "lodash/intersection";
import useUser from "./useUser";

export default function useShoppingList(options = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const {
    data: shoppingLists,
    mutate,
    isValidating,
  } = useSWR(
    user ? `/api/lib/v1/shopping-list` : false,
    (url) => fetch(url).then((r) => r.json()),
    {
      ...{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
      },
      ...options,
    }
  );

  const create = async (data, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/shopping-list`, {
        method: "POST",
        body: JSON.stringify(data),
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });

      await broadcastMutate();
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const copy = async (accessToken, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/shopping-list/${accessToken}/copy`, {
        method: "POST",
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });

      await broadcastMutate();
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const update = async (accessToken, data, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/shopping-list/${accessToken}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });
      await broadcastMutate();
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const remove = async (accessToken, callback) => {
    setIsLoading(true);
    try {
      await fetch(`/api/lib/v1/shopping-list/${accessToken}`, {
        method: "DELETE",
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });

      await broadcastMutate();
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const itemAdd = async (
    accessToken,
    productId,
    count,
    store,
    callback,
    options = {}
  ) => {
    await itemAddCustom(
      accessToken,
      { productId, count, sizeId: store },
      callback,
      options
    );
  };

  const itemsBulkAdd = async (accessToken, items, callback) => {
    setIsLoading(true);
    let success = true;
    const result = await fetch(
      `/api/lib/v1/shopping-list/${accessToken}/items/bulk`,
      {
        method: "POST",
        body: JSON.stringify(items),
      }
    ).then(async (response) => {
      success = response?.ok;
      const data = await response.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    if (success) {
      await broadcastMutate();
    }
    setIsLoading(false);
    return result;
  };

  const itemsRemoveBulk = async (accessToken, ids, callback) => {
    setIsLoading(true);
    let success = true;
    const result = await fetch(
      `/api/lib/v1/shopping-list/${accessToken}/items/bulk`,
      {
        method: "DELETE",
        body: JSON.stringify({ ids }),
      }
    ).then(async (response) => {
      success = response?.ok;
      const data = await response.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    if (success) {
      await broadcastMutate();
    }
    setIsLoading(false);
    return result;
  };

  const itemAddCustom = async (accessToken, data, callback, options = {}) => {
    setIsLoading(true);
    let success = true;
    const shoppingLists = await fetch(
      `/api/lib/v1/shopping-list/${accessToken}/item`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ).then(async (result) => {
      success = result?.ok;
      const data = await result.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    if (success && !options?.skipMutate) {
      await broadcastMutate();
    }
    setIsLoading(false);
  };

  const itemUpdate = async (accessToken, itemId, data, callback) => {
    setIsLoading(true);
    let success = true;
    const shoppingLists = await fetch(
      `/api/lib/v1/shopping-list/${accessToken}/item/${itemId}`,
      {
        method: "PUT",
        body: JSON.stringify({
          ...data,
        }),
      }
    ).then(async (result) => {
      success = result?.ok;
      const data = await result.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    setIsLoading(false);
  };

  const itemRemove = async (accessToken, itemId, callback) => {
    setIsLoading(true);
    await fetch(`/api/lib/v1/shopping-list/${accessToken}/item/${itemId}`, {
      method: "DELETE",
    }).then((result) => {
      if (isFunction(callback)) {
        callback(result);
      }
      return result.json();
    });
    await broadcastMutate();
    setIsLoading(false);
  };

  const getProductLists = useCallback((productIds) => {
    if (Array.isArray(productIds)) {
      const activeShoppingLists = [];
      const productsToShoppingList = {};
      forEach(shoppingLists, (shoppingList) => {
        productsToShoppingList[shoppingList?.id] = {
          listObject: shoppingList,
          products: map(shoppingList?.items, (item) => item?.product?.id),
        };
      });
      forEach(productsToShoppingList, (shoppingList) => {
        if (shoppingList?.products.length < productIds.length) {
          return;
        }
        if (
          intersection(shoppingList?.products, productIds).length ===
            productIds.length
        ) {
          activeShoppingLists.push(shoppingList?.listObject);
        }
      });

      return activeShoppingLists;
    }
    return productIds
      ? filter(shoppingLists, (list) =>
          find(list?.items, (item) => item?.product?.id === productIds)
        )
      : false;
  }, [shoppingLists]);

  return {
    shoppingLists,
    mutateShoppingLists: mutate,
    isLoading: isValidating || isLoading,
    create,
    remove,
    update,
    copy,
    itemAdd,
    itemAddCustom,
    itemsBulkAdd,
    itemsRemoveBulk,
    itemRemove,
    itemUpdate,
    getProductLists,
  };
}
