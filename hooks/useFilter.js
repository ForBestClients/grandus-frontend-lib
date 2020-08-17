import { useState } from "react";

import useSWR from "swr";
import { get, fromPairs, split, flatMap, isEmpty, chunk, map } from "lodash";

export const queryToQuery = (
  query,
  dataToChange = {},
  toDelete = ["parameters", "category"]
) => {
  let newQuery = {
    ...query,
    ...dataToChange,
  };

  if (!isEmpty(toDelete)) {
    toDelete.map((key) => delete newQuery[key]);
  }

  return newQuery;
};

export const queryToQueryString = (
  query,
  dataToChange = {},
  toDelete = ["parameters", "category"]
) => {
  const queryAdjusted = queryToQuery(query, dataToChange, toDelete);
  let queryParts = [];

  map(queryAdjusted, (value, key) => {
    queryParts.push(`${key}=${value}`);
  });

  return queryParts.join("&");
};

export const getCategoryLinkAttributesFromRouter = (router, options = {}) => {
  return getCategoryLinkAttributes(
    get(router, "query.category"),
    arrayToPath(get(router, "query.parameters", [])),
    router.query,
    options
  );
};

export const getCategoryLinkAttributes = (
  category,
  parameters = '',
  query = {},
  options = {}
) => {
  const newQuery = get(options, "toDelete")
    ? queryToQuery(
        query,
        get(options, "dataToChange", {}),
        get(options, "toDelete")
      )
    : queryToQuery(query, get(options, "dataToChange", {}));
  return {
    href: {
      pathname: `/kategoria/[category]/[[...parameters]]`,
      query: newQuery,
    },
    as: {
      pathname: `/kategoria/${category}/${parameters}`,
      query: newQuery,
    },
  };
};

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
