import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import {
  fromPairs,
  mapKeys,
  toNumber,
  mapValues,
  chunk,
  split,
  head,
  slice,
  get,
  parseInt,
} from "lodash";

export const explodeCategoryPath = (queryParams = []) => {
  return {
    category: head(queryParams),
    filter: slice(queryParams, 1),
  };
};

export const reqPrepareQuery = (pathParts = [], query = {}, assign = {}) => {
  const innerQuery = { ...query };
  if (pathParts.length) {
    pathParts.map((part) => delete innerQuery[part]);
  }
  return Object.assign(innerQuery, assign);
};

export const reqExtractUri = (url) => {
  const uriPosition = url.indexOf("?");
  return uriPosition > 0 ? url.slice(uriPosition) : "";
};

export const reqGetHost = (req) => {
  return process.env.HOST;
};

export const reqApiHost = (req) => {
  return process.env.HOST_API;
};

export const reqGetHeaders = (req) => {
  const result = {
    "Content-Type": "application/json",
    "Owner-Token": process.env.GRANDUS_TOKEN_OWNER,
    "Webinstance-Token": process.env.GRANDUS_TOKEN_WEBINSTANCE,
  };

  if (!req.session) return result;

  const user = req.session.get(USER_CONSTANT);

  if (!get(user, "accessToken")) return result;

  Object.assign(result, {
    Authorization: `Bearer ${get(user, "accessToken")}`,
  });
  return result;
};

export const processQueryFilter = (query) => {
  const filter = get(query, "filter", false);

  if (!filter) {
    return null;
  }

  let result = fromPairs(chunk(split(filter, "/"), 2));

  result = mapKeys(result, (value, key) =>
    toNumber(get(split(key, "-"), "[1]"))
  );
  result = mapValues(result, (value) => split(value, ","));

  return result;
};

/**
 *
 * Headers pagination
 *
 * @param {object} headers
 */
export const getPaginationFromHeaders = (headers) => {
  return {
    totalCount: parseInt(headers.get("x-pagination-total-count")),
    pageCount: parseInt(headers.get("x-pagination-page-count")),
    currentPage: parseInt(headers.get("x-pagination-current-page")),
    perPage: parseInt(headers.get("x-pagination-per-page")),
  };
};

export const forwardPaginationHeaders = (fwdToHeaders, fwdFromHeaders) => {
  fwdToHeaders.setHeader(
    "x-pagination-total-count",
    fwdFromHeaders.get("x-pagination-total-count")
  );
  fwdToHeaders.setHeader(
    "x-pagination-page-count",
    fwdFromHeaders.get("x-pagination-page-count")
  );
  fwdToHeaders.setHeader(
    "x-pagination-current-page",
    fwdFromHeaders.get("x-pagination-current-page")
  );
  fwdToHeaders.setHeader(
    "x-pagination-per-page",
    fwdFromHeaders.get("x-pagination-total-count")
  );

  return fwdToHeaders;
};
