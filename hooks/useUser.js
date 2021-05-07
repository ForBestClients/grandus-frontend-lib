import { useEffect } from "react";
import Router from "next/router";
import useSWR from "swr";
import { get, isFunction } from "lodash";

export default function useUser({
  redirectTo = false,
  redirectIfFound = false,
  initialUser = null
} = {}) {
  const { data: user, mutate, isValidating } = useSWR(
    `/api/lib/v1/auth/profile`,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnReconnect: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      initialData: initialUser
    }
  );

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
      Router.push(redirectTo);
    }
  }, [user, redirectIfFound, redirectTo]);

  const logoutUser = async () => {
    await mutate(
      await fetch(`/api/lib/v1/auth/signout`).then((result) => result.json())
    );
  };

  const createUser = async (values, callback) => {
    try {
      const reqBody = {
        user: {
          name: get(values, "user.firstname"),
          surname: get(values, "user.surname"),
          email: get(values, "user.email"),
          password: get(values, "user.password"),
          passwordRepeat: get(values, "user.passwordRepeat"),
        },
      };
      if (get(values, "cart.accessToken")) {
        reqBody.cart = { accessToken: get(values, "cart.accessToken") };
      }
      if (get(values, "company")) {
        reqBody.company = {
          name: get(values, "company.name"),
          businessId: get(values, "company.ico"),
          taxId: get(values, "company.dic"),
          vatNumber: get(values, "company.icDPH"),
        };
      }
      const user = await fetch(`/api/lib/v1/auth/signup`, {
        method: "POST",
        body: JSON.stringify(reqBody),
      }).then((response) => response.json());
      if (get(user, "success", false)) {
        await mutate(get(user, "data"), false);
      }
      if (isFunction(callback)) {
        callback(user);
      }
    } catch (error) {
      console.error("An unexpected error happened:", error);
    }
  };

  return {
    user: get(user, "accessToken") ? user : null,
    mutateUser: mutate,
    createUser,
    logoutUser,
    isLoading: isValidating,
  };
}
