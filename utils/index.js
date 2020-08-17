import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import { get, parseInt } from "lodash";

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

export const getProductCardFields = () => {
  return process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS
    ? `${process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS}`
    : "id,name,urlTitle,storeStatus,finalPriceData,photo";
};

export const reqGetHeaders = (req) => {
  const result = {
    "Content-Type": "application/json",
    "Owner-Token": process.env.GRANDUS_TOKEN_OWNER,
    "Webinstance-Token": process.env.GRANDUS_TOKEN_WEBINSTANCE,
  };

  if (!get(req, "session")) return result;

  const user = req.session.get(USER_CONSTANT);

  if (!get(user, "accessToken")) return result;

  Object.assign(result, {
    Authorization: `Bearer ${get(user, "accessToken")}`,
  });
  return result;
};

export const scrollToTop = () => {
  if (typeof window !== "undefined") window.scrollTo(0, 0);
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
