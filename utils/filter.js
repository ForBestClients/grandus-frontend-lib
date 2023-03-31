import get from 'lodash/get';
import fromPairs from 'lodash/fromPairs';
import split from 'lodash/split';
import flatMap from 'lodash/flatMap';
import isEmpty from 'lodash/isEmpty';
import chunk from 'lodash/chunk';
import map from 'lodash/map';
import find from 'lodash/find';
import isArray from 'lodash/isArray';
import omit from 'lodash/omit';
import sortBy from 'lodash/sortBy';
import isString from 'lodash/isString';
import flatten from 'lodash/flatten';
import indexOf from 'lodash/indexOf';
import isObject from 'lodash/isObject';

import { removeParameter, addParameter } from 'grandus-lib/utils/url';

import { RESERVED_URI_PARTS } from 'grandus-lib/constants/UrlConstants';
import { CATEGORY_PARAMETERS_SHOW_LIMIT } from 'grandus-lib/constants/AppConstants';

const replaceKeyForUrlTitle = key =>
  get(find(RESERVED_URI_PARTS, ['key', key]), 'urlTitle', key);

const replaceUrlTitleForKey = urlTitle =>
  get(find(RESERVED_URI_PARTS, ['urlTitle', urlTitle]), 'key', urlTitle);

const sortChunks = chunks => sortBy(chunks, pair => pair[0]);

export const getSeoTitleData = (filter = {}) => {
  const titleData = [];

  map(get(filter, 'selected.stores.data', []), store => {
    if (get(store, 'name')) {
      titleData.push(get(store, 'name'));
    }
  });

  map(get(filter, 'selected.brands.data', []), brand => {
    if (get(brand, 'name')) {
      titleData.push(get(brand, 'name'));
    }
  });

  map(get(filter, 'selected.storeLocations.data', []), store => {
    if (get(store, 'name')) {
      titleData.push(get(store, 'name'));
    }
  });

  map(get(filter, 'selected.statuses.data', []), status => {
    if (get(status, 'name')) {
      titleData.push(get(status, 'name'));
    }
  });

  map(get(filter, 'selected.parameters.data', []), parameter => {
    map(get(parameter, 'values', []), value => {
      if (get(value, 'value')) {
        titleData.push(get(value, 'value'));
      }
    });
  });

  return titleData;
};

export const hasActiveFilters = (filter = {}) => {
  return !isEmpty(omit(get(filter, 'selected', []), 'category'));
};

export const getApiBodyFromParams = (params = []) => {
  if (!params) {
    return {};
  }

  const newParams = { ...params };
  const apiBody = {};

  map(RESERVED_URI_PARTS, reserved => {
    const identifiedReserved = get(
      newParams,
      [reserved.urlTitle],
      get(newParams, [reserved.key]),
    );
    if (identifiedReserved) {
      if (isArray(reserved.key)) {
        map(reserved.key, (key, index) => {
          apiBody[key] = get(identifiedReserved, `[${index}]`);
        });

        delete newParams[reserved.urlTitle];
      } else {
        apiBody[reserved.key] = isArray(identifiedReserved)
          ? map(identifiedReserved, ir => decodeURIComponent(ir))
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
        ? map(item, i => decodeURIComponent(i))
        : [decodeURIComponent(item)];
    }
  });

  return apiBody;
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

  const newQuery = get(options, 'toDelete')
    ? queryToQuery(
        query,
        get(options, 'dataToChange', {}),
        get(options, 'toDelete'),
      )
    : queryToQuery(query, get(options, 'dataToChange', {}));
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
    get(router, 'query.campaign'),
    arrayToPath(get(router, 'query.parameters', [])),
    router.query,
    options,
  );
};

export const getSearchLinkAttributesFromRouter = (router, options = {}) => {
  return getSearchLinkAttributes(
    encodeURIComponent(get(router, 'query.term')),
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
        map(array, value => {
          if (indexOf(value, ',') > 0) {
            return map(split(value, ','), val => encodeURIComponent(val));
          } else {
            return map(split(value, '%2C'), val => encodeURIComponent(val));
          }
        }),
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

export const isActive = (parameterTitle, parameterValueTitle, selected) => {
  const parameterSelected = get(selected, [parameterTitle], []);
  return indexOf(parameterSelected, parameterValueTitle) >= 0;
};

export const getFilterUrl = (
  category,
  parameters,
  selected,
  parameterKey,
  parameterValue,
  isRemove = false,
  isReplace = false,
  sortValues = true,
) => {
  const urlSegments = getCategoryLinkAttributes(
    category,
    paramsToPath(
      isRemove
        ? removeParameter(selected, parameterKey, parameterValue)
        : addParameter(
            selected,
            parameterKey,
            parameterValue,
            isReplace,
            sortValues,
          ),
    ),
    parameters, //query
    { toDelete: ['category', 'parameters', 'page'] },
  );

  return get(urlSegments, 'as', '');
};
