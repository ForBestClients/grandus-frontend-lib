"use client"
import get from 'lodash/get';
import fromPairs from 'lodash/fromPairs';
import split from 'lodash/split';
import flatMap from 'lodash/flatMap';
import isEmpty from 'lodash/isEmpty';
import chunk from 'lodash/chunk';
import map from 'lodash/map';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import flatten from 'lodash/flatten';
import indexOf from 'lodash/indexOf';
import isObject from 'lodash/isObject';

import useSWR from 'swr';
import { RESERVED_URI_PARTS } from 'grandus-lib/constants/UrlConstants';
import { CATEGORY_PARAMETERS_SHOW_LIMIT } from 'grandus-lib/constants/AppConstants';
import { useRouter } from 'next/router';

import {
  getSeoTitleData as getSeoTitleDataMoved,
  hasActiveFilters as hasActiveFiltersMoved,
  getApiBodyFromParams as getApiBodyFromParamsMoved,
} from 'grandus-lib/utils/filter';
import trim from 'lodash/trim';

const sortChunks = chunks => chunks; // temporary disabled sortingsortBy(chunks, (pair) => pair[0]);

// Moved
export const getSeoTitleData = (filter = {}) => {
  return getSeoTitleDataMoved(filter);
};

// Moved
export const hasActiveFilters = (filter = {}) => {
  return hasActiveFiltersMoved(filter);
};

// Moved
export const getApiBodyFromParams = (params = []) => {
  return getApiBodyFromParamsMoved(params);
};

export const getApiBodyFromPath = path => {
  return getApiBodyFromParams(pathToParams(path));
};

export const queryToQuery = (
  query,
  dataToChange = {},
  toDelete = ['parameters', 'category'],
) => {
  let newQuery = {
    ...query,
    ...dataToChange,
  };

  if (!isEmpty(toDelete)) {
    toDelete.map(key => delete newQuery[key]);
  }

  return newQuery;
};

/*
  options = {
    encode: bool,
    replace: [{key: newKey}, {key2: newKey2}]
  }
*/
export const queryToQueryString = (
  query,
  dataToChange = {},
  toDelete = ['parameters', 'category'],
  options = {},
) => {
  const queryAdjusted = queryToQuery(
    query,
    isObject(dataToChange) ? dataToChange : {},
    isArray(toDelete) ? toDelete : [],
  );

  let queryParts = [];

  map(queryAdjusted, (value, key) => {
    queryParts.push(
      `${get(options, ['replace', key], key)}=${
        get(options, 'encode') ? encodeURIComponent(value) : value
      }`,
    );
  });

  return queryParts.join('&');
};

export const getCategoryLinkAttributesFromRouter = (router, options = {}) => {
  return getCategoryLinkAttributes(
    get(router, 'query.category'),
    arrayToPath(get(router, 'query.parameters', [])),
    router.query,
    options,
  );
};

//tested
export const getCategoryLinkAttributes = (
  category,
  parameters = '',
  query = {},
  options = {},
) => {
  if (get(options, 'absoluteHref')) {
    return { href: options.absoluteHref };
  }

  const emptyResult = {
    href: {
      pathname: `/`,
      query: {},
    },
    as: {
      pathname: `/`,
      query: {},
    },
  };

  if (!category || !isString(category)) {
    return emptyResult;
  }

  const categoryUrl = process.env.NEXT_PUBLIC_CATEGORY_URL
    ? process.env.NEXT_PUBLIC_CATEGORY_URL
    : 'kategoria';

  const newQuery = get(options, 'toDelete')
    ? queryToQuery(
        query,
        get(options, 'dataToChange', {}),
        get(options, 'toDelete'),
      )
    : queryToQuery(query, get(options, 'dataToChange', {}));
  return {
    href: {
      pathname: `/${categoryUrl}/[category]/[[...parameters]]`,
      query: newQuery,
    },
    as: {
      pathname: `/${categoryUrl}/${category}/${parameters}`,
      query: newQuery,
    },
  };
};

export const getCampaignLinkAttributesFromRouter = (router, options = {}) => {
  return getCampaignLinkAttributes(
    get(router, 'query.campaign'),
    arrayToPath(get(router, 'query.parameters', [])),
    router.query,
    options,
  );
};

export const getSearchLinkAttributesFromRouter = (router, options = {}) => {
  return getSearchLinkAttributes(
    encodeURIComponent(decodeURIComponent(trim(get(router, 'query.term')))),
    arrayToPath(get(router, 'query.parameters', [])),
    router.query,
    options,
  );
};

export const getCampaignLinkAttributes = (
  campaign,
  parameters = '',
  query = {},
  options = {},
) => {
  const newQuery = get(options, 'toDelete')
    ? queryToQuery(
        query,
        get(options, 'dataToChange', {}),
        get(options, 'toDelete'),
      )
    : queryToQuery(query, get(options, 'dataToChange', {}));
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

export const getSystemFilterAttributes = (data, key, options = {}) => {
  return {
    parameter: {
      id: key,
      name: get(options, 'name')
        ? get(options, 'name')
        : get(find(RESERVED_URI_PARTS, ['key', key]), 'title', key),
      urlTitle: get(find(RESERVED_URI_PARTS, ['key', key]), 'urlTitle', key),
      values: data,
    },
    handleChange: get(options, 'handleChange'),
    selected: get(options, 'selected'),
    options: {
      styles: get(options, 'styles', {}),
      ...getShowMoreAttributes(
        {
          id: key,
          values: data,
        },
        get(options, 'openedParameter'),
        get(options, 'onClickToggleOpen'),
      ),
      ...options,
    },
  };
};

export const getShowMoreAttributes = (
  parameter,
  opened,
  onClickToggleOpen,
  options = {},
) => {
  return {
    showMoreEnabled:
      get(parameter, 'values', []).length >
      get(options, 'parametersShowLimit', CATEGORY_PARAMETERS_SHOW_LIMIT),
    showMoreActive: !(indexOf(opened, get(parameter, 'id')) >= 0),
    showMoreLimit: get(
      options,
      'parametersShowLimit',
      CATEGORY_PARAMETERS_SHOW_LIMIT,
    ),
    showMoreToggle: onClickToggleOpen,
  };
};

export const getSearchLinkAttributes = (
  searchTerm,
  parameters = '',
  query = {},
  options = {},
) => {
  const newQuery = get(options, 'toDelete')
    ? queryToQuery(
        query,
        get(options, 'dataToChange', {}),
        get(options, 'toDelete'),
      )
    : queryToQuery(query, get(options, 'dataToChange', {}));
  return {
    href: {
      pathname: `/vyhladavanie/[term]/[[...parameters]]`,
      query: newQuery,
    },
    as: {
      pathname: `/vyhladavanie/${searchTerm}/${parameters}`,
      query: newQuery,
    },
  };
};

export const arrayToParams = array => {
  if (isEmpty(array)) {
    return {};
  }
  return fromPairs(
    sortChunks(
      chunk(
        map(array, value =>
          map(split(value, ','), val => encodeURIComponent(val)),
        ),
        2,
      ),
    ),
  );
};

export const pathToParams = path => {
  if (!path) {
    return {};
  }
  return arrayToParams(split(path, '/'));
};

export const arrayToPath = array => {
  if (isEmpty(array)) {
    return '';
  }
  return flatten(sortChunks(chunk(array, 2))).join('/');
};

export const paramsToPath = params => {
  return arrayToPath(flatMap(params, (value, key) => [key, value]));
};

const useFilter = ({
  category = null,
  search = null,
  parameters = [],
  options = {},
  useDataFromRouter = false,
} = {}) => {
  const router = useRouter();
  let uri = [];

  if (useDataFromRouter) {
    map(get(router, 'query'), (uriPart, index) => {
      switch (index) {
        case 'category':
          uri.push(`id=${uriPart}`);
          break;
        case 'term':
          uri.push(`search=${uriPart}`);
          break;
        case 'campaign':
          uri.push(`marketingCampaign=${uriPart}`);
          break;
        case 'parameters':
          uri.push(`param=${arrayToPath(uriPart)}`);
          break;

        default:
          uri.push(`${index}=${uriPart}`);
          break;
      }

      return;
    });
  } else {
    if (!isEmpty(parameters)) {
      uri.push(`param=${arrayToPath(parameters)}`);
    }

    if (category) {
      uri.push(`id=${category}`);
    }

    if (search) {
      uri.push(`search=${search}`);
    }
  }

  const url = `/api/lib/v1/filters?${uri.join('&')}`;

  const {
    data: filter,
    mutate,
    isValidating,
  } = useSWR(url, url => fetch(url).then(r => r.json()), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: true,
    ...options,
  });

  return {
    filter,
    hasActiveFilters: hasActiveFilters(filter),
    mutateFilter: mutate,
    isLoading: isValidating,
  };
};

export default useFilter;
