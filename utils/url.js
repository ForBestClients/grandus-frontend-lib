import without from "lodash/without";
import isEmpty from "lodash/isEmpty";
import isObject from "lodash/isObject";
import isArray from "lodash/isArray";
import union from "lodash/union";
import sortedUniq from "lodash/sortedUniq";
import isString from "lodash/isString";
import keys from "lodash/keys";
import split from "lodash/split";

import { queryToQueryString } from "grandus-lib/hooks/useFilter";

//tested
export const removeParameter = (
  parameters,
  parameterKey,
  parameterValue = false
) => {
  if (isEmpty(parameters)) {
    return {};
  }

  if (!parameterKey) {
    return {};
  }

  const parametersActual = { ...parameters };

  if (parameterValue) {
    const removed = without(
      parametersActual[parameterKey],
      encodeURIComponent(parameterValue)
    );

    if (isEmpty(removed)) {
      delete parametersActual[parameterKey];
    } else {
      parametersActual[parameterKey] = sortedUniq(removed);
    }
  } else {
    delete parametersActual[parameterKey];
  }

  return { ...parametersActual };
};

//tested
export const addParameter = (
  parameters,
  parameterKey,
  parameterValues,
  replace = true
) => {
  if (!isObject(parameters)) {
    return {};
  }

  const parametersActual = { ...parameters };

  if (!parameterKey || isEmpty(parameterValues) || !parameterValues) {
    return parametersActual;
  }

  const parameterValuesActual = isArray(parameterValues)
    ? parameterValues
    : [parameterValues];

  if (replace) {
    parametersActual[parameterKey] = parameterValuesActual.sort();
  } else {
    parametersActual[parameterKey] = union(
      parametersActual[parameterKey],
      parameterValuesActual
    ).sort();
  }

  parametersActual[parameterKey] = sortedUniq(parametersActual[parameterKey]);

  return { ...parametersActual };
};

//tested
export const getCleanedUrl = (path, parameters = {}, query = {}) => {
  if (!isString(path)) {
    return false;
  }

  const pathParts = split(path, "?", 1)[0];

  const queryString = queryToQueryString(query, {}, keys(parameters));

  return pathParts + (queryString ? `?${queryString}` : "");
};
