'use client';
import { useState } from 'react';
import useSWR from 'swr';

import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import isPlainObject from 'lodash/isPlainObject';
import filter from 'lodash/filter';

// invoke a consumer callback at most once and never let its exception
// bubble into the mutation flow (would falsely mark the operation failed)
const safeCallback = (callback, data) => {
  if (!isFunction(callback)) return;
  try {
    callback(data);
  } catch (error) {
    console.error('An unexpected error happened in cart callback:', error);
  }
};

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
  } = useSWR(
    `/api/lib/v1/cart`,
    async url => {
      const response = await fetch(url);

      // a failed load must not overwrite a working cart - throwing lets SWR
      // keep the previous data and retry instead of dropping the customer on
      // an "empty cart" screen in the middle of the checkout
      if (!response?.ok) {
        throw new Error(`Cart request failed with status ${response?.status}`);
      }

      return response.json();
    },
    {
      ...swrOptions,
      ...options,
    },
  );

  // true only during the very first fetch, before any data arrives;
  // background revalidations no longer flip isLoading (works on SWR 0.5/1/2 —
  // SWR2's own `isLoading` does not exist in older versions)
  const isInitialLoad = isValidating && cart == null;

  const itemRemove = async (itemId, callback) => {
    setIsLoading(true);
    // snapshot for rollback - a plain revalidation would fail under the same
    // network failure that made the DELETE fail
    const previousCart = cart;
    try {
      mutate(
        { ...cart, items: filter(cart?.items, item => item?.id !== itemId) },
        false,
      );

      let success = true;
      const data = await fetch(`/api/lib/v1/cart/items/${itemId}`, {
        method: 'DELETE',
      }).then(async result => {
        success = result?.ok;
        const data = await result.json();
        data.success = success;
        return data;
      });

      if (success) {
        await mutate(data, false);
      } else {
        // roll back the optimistic removal, never poison the cache with an
        // error response body
        await mutate(previousCart, false);
      }
      safeCallback(callback, data);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      mutate(previousCart, false);
      safeCallback(callback, { success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const itemsRemove = async (itemsIds, callback) => {
    setIsLoading(true);
    try {
      let success = true;
      const cart = await fetch(`/api/lib/v1/cart/items/bulk`, {
        method: 'DELETE',
        body: JSON.stringify({ items: itemsIds }),
      }).then(async result => {
        success = result?.ok;
        const data = await result.json();
        data.success = success;
        return data;
      });

      if (success) {
        await mutate(cart, false);
      }
      safeCallback(callback, cart);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      safeCallback(callback, { success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const cartUpdate = async (data, callback) => {
    setIsLoading(true);
    try {
      let success = true;
      const result = await fetch(`/api/lib/v1/cart`, {
        method: 'POST',
        body: JSON.stringify({
          cart: {
            ...data,
          },
        }),
      }).then(async response => {
        success = response?.ok;
        const body = await response.json().catch(() => null);
        const cart = isPlainObject(body) ? body : {};
        cart.success = success;
        return cart;
      });

      // a rejected update (e.g. 422 "payment not allowed for this delivery")
      // answers with an error body that carries no accessToken - writing it to
      // the cache would render the whole cart as empty. The backend keeps the
      // previous cart in that case, so simply leave the cache untouched.
      if (success) {
        await mutate(result, false);
      }

      safeCallback(callback, result);
      return result;
    } catch (error) {
      console.error('An unexpected error happened:', error);
      const failure = { success: false };
      safeCallback(callback, failure);
      return failure;
    } finally {
      setIsLoading(false);
    }
  };

  const cartDestroy = async callback => {
    setIsLoading(true);
    try {
      const data = await fetch(`/api/lib/v1/cart`, {
        method: 'DELETE',
      }).then(result => result.json());

      await mutate(data, false);
      safeCallback(callback, data);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      safeCallback(callback, { success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const itemAdd = async (count, store, productId, callback, options = {}) => {
    setIsLoading(true);
    const items = { count: count, sizeId: store, productId: productId };
    if (options?.hash) {
      items.hash = get(options, 'hash', '');
    }
    try {
      return await itemsAdd(items, callback);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const itemsAdd = async (items, callback) => {
    setIsLoading(true);
    let success = false;
    try {
      const cart = await fetch(`/api/lib/v1/cart`, {
        method: 'POST',
        body: JSON.stringify({ items }),
      }).then(async result => {
        success = result?.ok;
        const data = await result.json();
        data.success = success;
        return data;
      });

      if (success) {
        await mutate(cart, false);
      }
      safeCallback(callback, cart);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      success = false;
      safeCallback(callback, { success: false });
    } finally {
      setIsLoading(false);
    }
    // let callers react to the outcome (e.g. only open the minicart on success)
    return success;
  };

  const itemUpdate = async (itemId, body, callback) => {
    setIsLoading(true);
    try {
      let success = true;
      const cart = await fetch(`/api/lib/v1/cart/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({
          item: body,
        }),
      }).then(async result => {
        success = result?.ok;
        const data = await result.json();
        data.success = success;
        return data;
      });

      if (success) {
        await mutate(cart, false);
      }
      safeCallback(callback, cart);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      safeCallback(callback, { success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const saveContact = async (values, callback) => {
    setIsLoading(true);
    try {
      let success = true;
      const data = await fetch(`/api/lib/v1/cart/contact`, {
        method: 'POST',
        body: JSON.stringify(values),
      }).then(async response => {
        success = response?.ok;
        const body = await response.json().catch(() => null);
        const contact = isPlainObject(body) ? body : {};
        contact.success = success;
        return contact;
      });

      safeCallback(callback, data);
      // contact data drives order creation - callers must be able to stop the
      // checkout when the session write did not go through
      return data;
    } catch (error) {
      console.error('An unexpected error happened:', error);
      const failure = { success: false };
      safeCallback(callback, failure);
      return failure;
    } finally {
      setIsLoading(false);
    }
  };

  const removeContact = async callback => {
    setIsLoading(true);
    try {
      const data = await fetch(`/api/lib/v1/cart/contact`, {
        method: 'DELETE',
      }).then(result => result.json());

      safeCallback(callback, data);
    } catch (error) {
      console.error('An unexpected error happened:', error);
      safeCallback(callback, { success: false });
    } finally {
      setIsLoading(false);
    }
  };

  const createOrder = async (values, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/order/create`, {
        method: 'POST',
        body: JSON.stringify(values),
      });

      // consumers receive a promise of the parsed body (kept for backwards
      // compatibility); resolve it to null instead of rejecting so a non-JSON
      // answer still lets the caller leave its processing state
      const data = response.json().catch(() => null);

      safeCallback(callback, data);
      return await data;
    } catch (error) {
      console.error('An unexpected error happened:', error);
      // the callback has to fire even when the request never reached the
      // server - otherwise the checkout stays stuck on the processing screen
      safeCallback(callback, Promise.resolve(null));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const applyCoupon = async (couponHash, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/coupon`, {
        method: 'POST',
        body: JSON.stringify({ couponHash }),
      }).then(result => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      });
      return response;
    } catch (error) {
      console.error('An unexpected error happened:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeCoupon = async callback => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/coupon`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(result => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      });

      return response;
    } catch (error) {
      console.error('An unexpected error happened:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyCredits = async (value, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/credits`, {
        method: 'POST',
        body: JSON.stringify({ credit: value }),
      })
        .then(result => result.json())
        .then(result => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });
      setIsLoading(false);
      return response;
    } catch (error) {
      console.error('An unexpected error happened:', error);
      setIsLoading(false);
    }
  };

  const applyIsic = async (surname, code, callback) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/isic`, {
        method: 'POST',
        body: JSON.stringify({
          isic: {
            surname,
            code,
          },
        }),
      })
        .then(result => result.json())
        .then(result => {
          if (isFunction(callback)) {
            callback(result);
          }
          return result;
        });

      return response;
    } catch (error) {
      console.error('An unexpected error happened:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeIsic = async callback => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/lib/v1/cart/isic`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(result => {
        if (isFunction(callback)) {
          callback(result);
        }
        return result.json();
      });

      return response;
    } catch (error) {
      console.error('An unexpected error happened:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isProductAdded = productId => {
    const cartItem = cart?.items?.find(item => item?.product?.id === productId);

    const amount = cartItem ? cartItem?.count || 1 : 0;

    return amount;
  };

  return {
    cart: get(cart, 'accessToken') ? cart : null,
    mutateCart: mutate,
    isLoading: isInitialLoad || isLoading,
    isValidating,
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
    removeIsic,
    isProductAdded,
  };
}
