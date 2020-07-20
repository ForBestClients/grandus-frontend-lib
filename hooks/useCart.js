// import { useEffect } from "react";
import useSWR from "swr";
import { get, isFunction, filter } from "lodash";

export default function useCart(initialCart) {
  const { data: cart, mutate, isValidating } = useSWR(
    `/api/v1/cart`,
    (url) => fetch(url).then((r) => r.json()),
    {
      initialData: initialCart,
      revalidateOnMount: true,
    }
  );

  const itemRemove = async (itemId, callback) => {
    mutate(
      { ...cart, items: filter(cart?.items, (item) => item?.id !== itemId) },
      false
    );
    await mutate(
      await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "DELETE",
      }).then((result) => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      }),
      false
    );
  };

  const cartUpdate = async (data, callback) => {
    try {
      await mutate(
        await fetch(`/api/v1/cart`, {
          method: "POST",
          body: JSON.stringify({
            cart: {
              ...data
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
  };

  const itemAdd = async (count, store, productId, callback) => {
    try {
      await mutate(
        await fetch(`/api/v1/cart`, {
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
      await fetch(`/api/v1/cart/items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify({
          item: body,
        }),
      }).then((result) => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      }),
      false
    );
  };

  const saveContact = async (values, callback) => {
    try {
        await fetch(`/api/v1/cart/contact`, {
          method: "POST",
          body: JSON.stringify(values),
        }).then((result) => {
          result.json().then(data => {
            if (isFunction(callback)) {
              callback(data);
            }

            return data;
          })
        })
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
  }

  const createOrder = async (values, callback) => {
    try {
      await mutate(
        await fetch(`/api/v1/order/create`, {
          method: "POST",
          body: JSON.stringify(values),
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
  }

  return {
    cart: get(cart, "accessToken") ? cart : null,
    mutateCart: mutate,
    isLoading: isValidating,
    itemAdd,
    itemRemove,
    itemUpdate,
    cartUpdate,
    saveContact,
    createOrder
  };
}
