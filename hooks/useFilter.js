import useSWR from "swr";
import {
  get,
  fromPairs,
  split,
  flatMap,
  isEmpty,
  chunk,
  map,
  find,
  isArray,
  omit,
  sortBy,
  flatten
} from "lodash";
import { RESERVED_URI_PARTS } from "grandus-lib/constants/UrlConstants";

const replaceKeyForUrlTitle = (key) =>
  get(find(RESERVED_URI_PARTS, ["key", key]), "urlTitle", key);

const replaceUrlTitleForKey = (urlTitle) =>
  get(find(RESERVED_URI_PARTS, ["urlTitle", urlTitle]), "key", urlTitle);

const sortChunks = (chunks) => chunks; // temporary disabled sortingsortBy(chunks, (pair) => pair[0]);

export const getApiBodyFromParams = (params = []) => {
  if (!params) {
    return {};
  }

  const newParams = { ...params };
  const apiBody = {};

  map(RESERVED_URI_PARTS, (reserved) => {
    const identifiedReserved = get(
      newParams,
      [reserved.urlTitle],
      get(newParams, [reserved.key])
    );
    if (identifiedReserved) {
      if (isArray(reserved.key)) {
        map(reserved.key, (key, index) => {
          apiBody[key] = get(identifiedReserved, `[${index}]`);
        });

        delete newParams[reserved.urlTitle];
      } else {
        apiBody[reserved.key] = isArray(identifiedReserved)
          ? map(identifiedReserved, (ir) => decodeURIComponent(ir))
          : [decodeURIComponent(identifiedReserved)];
        delete newParams[reserved.urlTitle];
        delete newParams[reserved.key];
      }
    }
  });

  apiBody.param = {};

  map(newParams, (item, key) => {
    if (item) {
      apiBody.param[key] = isArray(item)
        ? map(item, (i) => decodeURIComponent(i))
        : [decodeURIComponent(item)];
    }
  });

  return apiBody;
};

export const getApiBodyFromPath = (path) => {
  return getApiBodyFromParams(pathToParams(path));
};

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
  toDelete = ["parameters", "category"],
  options = {}
) => {
  const queryAdjusted = queryToQuery(query, dataToChange, toDelete);
  let queryParts = [];

  map(queryAdjusted, (value, key) => {
    queryParts.push(
      `${key}=${get(options, "encode") ? encodeURIComponent(value) : value}`
    );
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
  parameters = "",
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

export const getCampaignLinkAttributesFromRouter = (router, options = {}) => {
  return getCampaignLinkAttributes(
    get(router, "query.campaign"),
    arrayToPath(get(router, "query.parameters", [])),
    router.query,
    options
  );
};

export const getCampaignLinkAttributes = (
  campaign,
  parameters = "",
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
      pathname: `/akcie/[campaign]/[[...parameters]]`,
      query: newQuery,
    },
    as: {
      pathname: `/akcie/${campaign}/${parameters}`,
      query: newQuery,
    },
  };
};

export const arrayToParams = (array) => {
  if (isEmpty(array)) {
    return {};
  }
  return fromPairs(
    sortChunks(
      chunk(
        map(array, (value) =>
          map(split(value, ","), (val) => encodeURIComponent(val))
        ),
        2
      )
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
  return flatten(sortChunks(chunk(array, 2))).join("/");
};

export const paramsToPath = (params) => {
  return arrayToPath(flatMap(params, (value, key) => [key, value]));
};

const useFilter = ({ category = null, parameters = [], options = {} } = {}) => {
  let uri = [];

  if (!isEmpty(parameters)) {
    uri.push(`param=${arrayToPath(parameters)}`);
  }

  if (category) {
    uri.push(`id=${category}`);
  }

  const url = `/api/lib/v1/filters?${uri.join("&")}`;

  const { data: filter, mutate, isValidating } = useSWR(
    url,
    (url) => fetch(url).then((r) => r.json()),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: true,
      ...options,
    }
  );

  return {
    filter,
    hasActiveFilters: !isEmpty(omit(get(filter, 'selected', []), 'category')),
    mutateFilter: mutate,
    isLoading: isValidating,
  };
};

export default useFilter;
