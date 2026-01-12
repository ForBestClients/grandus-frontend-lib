'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';

import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import find from 'lodash/find';

export default function useUser({
  redirectTo = false,
  redirectIfFound = false,
  initialUser = null,
} = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const {
    data: user,
    mutate,
    isValidating,
  } = useSWR(
    `/api/lib/v1/auth/profile`,
    url => fetch(url).then(r => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      initialData: initialUser,
    },
  );
  const router = useRouter();

  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet

    if (!redirectTo || !user) return;

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);

  const logoutUser = async () => {
    setIsLoading(true);
    await mutate(
      await fetch(`/api/lib/v1/auth/signout`).then(result => result.json()),
    );
    setIsLoading(false);
  };

  const hasParameter = (parameterId, parameterValue = null) => {
    const parameters = user?.parameters;
    const searchObj = { parameterId: parameterId };
    if (parameterValue) {
      searchObj['value'] = parameterValue;
    }

    const found = find(parameters, searchObj);

    return found?.id ? true : false;
  };

  const addParameter = async (parameterId, parameterValue) => {
    setIsLoading(true);
    const data = {
      user: { params: { ...user?.parameters, [parameterId]: parameterValue } },
    };
    const response = await fetch(`/api/lib/v1/auth/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }).then(response => response.json());

    setIsLoading(false);
    mutate(response);
  };

  const createUser = async (values, callback) => {
    setIsLoading(true);
    try {
      const userData = {
        name: get(values, 'user.firstname'),
        surname: get(values, 'user.surname'),
        email: get(values, 'user.email'),
        phone: get(values, 'user.phone', ''),
        password: get(values, 'user.password'),
        passwordRepeat: get(values, 'user.passwordRepeat'),
      };

      if (get(values, 'user.countryId')) {
        userData.countryId = get(values, 'user.countryId');
      }

      if (get(values, 'user.params')) {
        userData.params = get(values, 'user.params');
      }

      const reqBody = {
        user: userData,
      };

      if (get(values, 'cart.accessToken')) {
        reqBody.cart = { accessToken: get(values, 'cart.accessToken') };
      }
      if (get(values, 'company')) {
        reqBody.company = {
          name: get(values, 'company.name'),
          businessId: get(values, 'company.ico'),
          taxId: get(values, 'company.dic'),
          vatNumber: get(values, 'company.icDPH'),
        };
      }
      const user = await fetch(`/api/lib/v1/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(reqBody),
      }).then(response => response.json());

      setIsLoading(false);
      if (get(user, 'success', false)) {
        await mutate(get(user, 'data'), false);
      }
      if (isFunction(callback)) {
        callback(user);
      }
    } catch (error) {
      setIsLoading(false);
      console.error('An unexpected error happened:', error);
    }
  };

  return {
    user: get(user, 'accessToken') ? user : null,
    mutateUser: mutate,
    createUser,
    logoutUser,
    addParameter,
    hasParameter,
    isLoading: isValidating || isLoading,
  };
}
