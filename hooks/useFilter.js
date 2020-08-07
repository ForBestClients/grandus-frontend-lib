import { useState } from "react";

import useSWR from "swr";
import { fromPairs, split, flatMap, isEmpty, chunk, map } from "lodash";

export const arrayToParams = (array) => {
  if (isEmpty(array)) {
    return {};
  }
  return fromPairs(
    chunk(
      map(array, (value) => split(value, ",")),
      2
    )
  );
};

export const pathToParams = (path) => {
  if (!path) {
    return {};
  }
  return arrayToParams(split(path, "/"));
};

export const arrayToPath = (array) => {
  if (isEmpty(array)) {
    return "";
  }
  return array.join("/");
};

export const paramsToPath = (params) => {
  return flatMap(params, (value, key) => [key, value]).join("/");
};

const useFilter = ({ category = null, parameters = [], options = {} } = {}) => {
  const [isLoading, setIsLoading] = useState(false);

  let uri = [];

  if (!isEmpty(parameters)) {
    uri.push(`param=${arrayToPath(parameters)}`);
  }

  if (category) {
    uri.push(`id=${category}`);
  }

  const url = `/api/v1/filters?${uri.join("&")}`;

  const { data: filter, mutate, isValidating } = useSWR(
    url,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      ...options,
    }
  );

  return {
    filter,
    mutateFilter: mutate,
    isLoading: isValidating || isLoading,
  };
};

export default useFilter;
