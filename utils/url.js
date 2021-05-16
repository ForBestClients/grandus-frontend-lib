import { without, isEmpty, isObject, isArray, union, sortedUniq } from "lodash";

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
