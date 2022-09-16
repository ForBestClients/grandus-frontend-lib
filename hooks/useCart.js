import { useState } from "react";
import useSWR from "swr";
import { get, isFunction, filter, isArray, map } from "lodash";

export default function useCart(initialCart = false, options = {}) {
  const swrOptions = {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };
  if (initialCart) {
    swrOptions.initialData = initialCart;
    swrOptions.revalidateOnMount = true;
  }

  const [isLoading, setIsLoading] = useState(false);
  const {
    data: cart,
    mutate,
    isValidating,
  } = useSWR(`/api/lib/v1/cart`, (url) => fetch(url).then((r) => r.json()), {
    ...swrOptions,
    ...options,
  });

  const itemRemove = async (itemId, callback) => {
    setIsLoading(true);
    mutate(
      { ...cart, items: filter(cart?.items, (item) => item?.id !== itemId) },
      false
    );
    await mutate(
      await fetch(`/api/lib/v1/cart/items/${itemId}`, {
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

  const itemsRemove = async (itemsIds, callback) => {
    setIsLoading(true);
    let success = true;
    const cart = await fetch(`/api/lib/v1/cart/items/bulk`, {
      method: "DELETE",
      body: JSON.stringify({ items: itemsIds }),
    }).then(async (result) => {
      success = result?.ok;
      const data = await result.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    if (success) {
      await mutate(cart, false);
    }
    setIsLoading(false);
  };

  const cartUpdate = async (data, callback) => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/cart`, {
          method: "POST",
          body: JSON.stringify({
            cart: {
              ...data,
            },
          }),
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

  const cartDestroy = async (callback) => {
    setIsLoading(true);
    try {
      await mutate(
        await fetch(`/api/lib/v1/cart`, {
          method: "DELETE",
        }).then((result) => {
          result.json().then((data) => {
            if (isFunction(callback)) {
              callback(data);
            }

            return data;
          });
        }),
        false
      );
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const itemAdd = async (count, store, productId, callback, options = {}) => {
    setIsLoading(true);
    const items = { count: count, sizeId: store, productId: productId };
    if (options?.hash) {
      items.hash = get(options, "hash", "");
    }
    try {
      await itemsAdd(items, callback);
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const itemsAdd = async (items, callback) => {
    setIsLoading(true);
    let success = true;
    const cart = await fetch(`/api/lib/v1/cart`, {
      method: "POST",
      body: JSON.stringify({ items }),
    }).then(async (result) => {
      success = result?.ok;
      const data = await result.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    if (success) {
      await mutate(cart, false);
    }
    setIsLoading(false);
  };

  const itemUpdate = async (itemId, body, callback) => {
    setIsLoading(true);
    let success = true;
    const cart = await fetch(`/api/lib/v1/cart/items/${itemId}`, {
      method: "PUT",
      body: JSON.stringify({
        item: body,
      }),
    }).then(async (result) => {
      success = result?.ok;
      const data = await result.json();
      data.success = success;
      if (isFunction(callback)) {
        callback(data);
      }
      return data;
    });

    if (success) {
      await mutate(cart, false);
    }
    setIsLoading(false);
  };

  const saveContact = async (values, callback) => {
    setIsLoading(true);
    try {
      await fetch(`/api/lib/v1/cart/contact`, {
        method: "POST",
        body: JSON.stringify(values),
      }).then((result) => {
        result.json().then((data) => {
          if (isFunction(callback)) {
            callback(data);
          }

          return data;
        });
      });
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const removeContact = async (callback) => {
    setIsLoading(true);
    try {
      await fetch(`/api/lib/v1/cart/contact`, {
        method: "DELETE",
      }).then((result) => {
        result.json().then((data) => {
          if (isFunction(callback)) {
            callback(data);
          }

          return data;
        });
      });
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const createOrder = async (values, callback) => {
    setIsLoading(true);
    try {
      await fetch(`/api/lib/v1/order/create`, {
        method: "POST",
        body: JSON.stringify(values),
      }).then((result) => {
        const data = result.json();
        if (isFunction(callback)) {
          callback(data);
        }
        return data;
      });
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
    setIsLoading(false);
  };

  const applyCoupon = async (couponHash, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/coupon`, {
        method: "POST",
        body: JSON.stringify({ couponHash }),
      }).then((result) => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      });
      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async (callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/coupon`, {
        method: "DELETE",
      }).then((result) => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      });

      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCredits = async (value, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/credits`, {
        method: "POST",
        body: JSON.stringify({ credit: value }),
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
      setIsLoading(false);
    }
  };

  const applyIsic = async (surname, code, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/isic`, {
        method: "POST",
        body: JSON.stringify({
          isic: {
            surname,
            code,
          },
        }),
      })
        .then((result) => result.json())
        .then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });

      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isProductAdded = (productId) => {
    const cartItem = cart?.items?.find(
      (item) => item?.product?.id === productId
    );

    const amount = cartItem ? cartItem?.count || 1 : 0;

    return amount;
  };

  return {
    cart: get(cart, "accessToken") ? cart : null,
    mutateCart: mutate,
    isLoading: isValidating || isLoading,
    itemsAdd,
    itemAdd,
    itemRemove,
    itemsRemove,
    itemUpdate,
    cartUpdate,
    cartDestroy,
    saveContact,
    removeContact,
    createOrder,
    applyCoupon,
    removeCoupon,
    applyCredits,
    applyIsic,
    isProductAdded,
  };
}
