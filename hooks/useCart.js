import { useState } from "react";
import useSWR from "swr";
import { get, isFunction, filter } from "lodash";

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
  const { data: cart, mutate, isValidating } = useSWR(
    `/api/lib/v1/cart`,
    (url) => fetch(url).then((r) => r.json()),
    {
      ...swrOptions,
      ...options,
    }
  );

  const itemRemove = async (itemId, callback) => {
    setIsLoading(true);
    mutate(
      { ...cart, items: filter(cart?.items, (item) => item?.id !== itemId) },
      false
    );
    await mutate(
      await fetch(`/api/lib/v1/cart/items/${itemId}`, {
        method: "DELETE",
      }).then((result) => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      }),
      false
    );
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
        }).then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result.json();
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

  const itemAdd = async (count, store, productId, callback) => {
    try {
      await mutate(
        await fetch(`/api/lib/v1/cart`, {
          method: "POST",
          body: JSON.stringify({
            items: { count: count, sizeId: store, productId: productId },
          }),
        }).then((result) => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result.json();
        }),
        false
      );
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
  };

  const itemUpdate = async (itemId, body, callback) => {
    await mutate(
      await fetch(`/api/lib/v1/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({
          item: body,
        }),
      }).then((result) => {
        const data = result.json();
        if (isFunction(callback)) {
          callback(data);
        }
        return data;
      }),
      false
    );
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
      const response = fetch(`/api/lib/v1/cart/credits`, {
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
      return response;
    } catch (error) {
      console.error("An unexpected error happened:", error);
    } finally {
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

  return {
    cart: get(cart, "accessToken") ? cart : null,
    mutateCart: mutate,
    isLoading: isValidating || isLoading,
    itemAdd,
    itemRemove,
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
  };
}
