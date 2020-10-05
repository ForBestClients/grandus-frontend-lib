import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import {
  ESHOP_TYPE_B2B,
  ESHOP_TYPE_B2C,
  ESHOP_TYPE_B2B_LOCKED,
  ESHOP_TYPE_MIXED,
} from "grandus-lib/constants/AppConstants";
import { get, parseInt, toNumber, deburr, toLower, replace } from "lodash";

export const getDevMeta = () => {
  if (process.env.NODE_ENV !== "development") {
    return "";
  }

  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta name="googlebot" content="noindex" />
    </>
  );
};

export const reqExtractUri = (url) => {
  const uriPosition = url.indexOf("?");
  return uriPosition > 0 ? url.slice(uriPosition) : "";
};

export const reqGetHost = (req) => {
  if (process.env.HOST) {
    return process.env.HOST;
  }

  let protocol = "https://";
  const host = get(req, "headers.host", "");
  if (host.indexOf("localhost") > -1) {
    protocol = "http://";
  }

  return protocol + host;
};

export const reqApiHost = (req) => {
  return process.env.HOST_API;
};

export const getProductDetailExpand = (asUriPart = false) => {
  return process.env.NEXT_PUBLIC_PRODUCT_DETAIL_EXPAND
    ? `${asUriPart ? `expand=` : ""}${
        process.env.NEXT_PUBLIC_PRODUCT_DETAIL_EXPAND
      }`
    : "";
};

export const getProductDetailFields = (asUriPart = false) => {
  return process.env.NEXT_PUBLIC_PRODUCT_DETAIL_FIELDS
    ? `${asUriPart ? `fields=` : ""}${
        process.env.NEXT_PUBLIC_PRODUCT_DETAIL_FIELDS
      }`
    : "";
};

export const getProductCardFields = (asUriPart = false) => {
  return process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS
    ? `${asUriPart ? `fields=` : ""}${
        process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS
      }`
    : `${
        asUriPart ? `fields=` : ""
      }id,name,urlTitle,storeStatus,finalPriceData,photo`;
};

export const reqGetHeadersFront = (req, options = {}) => {
  return {
    ...get(req, "headers"),
    host: get(req, "headers.host"),
    "grandus-frontend-url": get(options, "forwardUrl", get(req, "url")),
  };
};

export const getFrontendUrlFromHeaders = (headers) => {
  return get(
    headers,
    "Grandus-Frontend-Url",
    get(headers, "grandus-frontend-url")
  );
};

export const reqGetHeaders = (req) => {
  const result = {
    "Content-Type": "application/json",
    "Owner-Token": process.env.GRANDUS_TOKEN_OWNER,
    "Webinstance-Token": process.env.GRANDUS_TOKEN_WEBINSTANCE,
  };

  const uriToForward = getFrontendUrlFromHeaders(req?.headers);
  if (uriToForward) {
    const removedProtocol = replace(
      replace(uriToForward, "http://", ""),
      "https://",
      ""
    );

    Object.assign(result, {
      URI: replace(removedProtocol, get(req, "headers.host"), ""),
    });
  }

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
 * Generates image path for certain image.
 * Automaticaly add host and construct path by provided attributes.
 * Url is constructed as :
 * - host from environment (.env.*)
 * - path from image object (image.path)
 * - size provided size of image (resolutionXxResolutionY)
 * - tyoe format of image to be generated (.jpg, .png, .webp)
 *
 * @param {object} image
 * @param {string} size
 * @param {string} type
 */
export const getImageUrl = (image, size, type) => {
  const host = process.env.NEXT_PUBLIC_IMAGE_HOST
    ? process.env.NEXT_PUBLIC_IMAGE_HOST
    : "";

  if (!image) {
    return false;
  }

  return host + image.path + "/" + size + "." + type;
};

/**
 * Generates url to attachment.
 * Automaticaly add host and construct path
 *
 * @param {object} attachment
 */
export const getAttachmentUrl = (attachment) => {
  const host = process.env.NEXT_PUBLIC_IMAGE_HOST
    ? process.env.NEXT_PUBLIC_IMAGE_HOST
    : "";

  if (!attachment) {
    return false;
  }

  return host + attachment.fileUrl;
};

export const convertToNumber = (numberCandidate) => {
  return parseFloat(numberCandidate.replace(",", "."));
};

export const isB2B = (eshopType = ESHOP_TYPE_B2C, user) => {
  return (
    toNumber(eshopType) === ESHOP_TYPE_B2B ||
    toNumber(eshopType) === ESHOP_TYPE_B2B_LOCKED ||
    (toNumber(eshopType) === ESHOP_TYPE_MIXED &&
      get(user, "company.vatNumber", false))
  );
};

export const deburredSearch = (string, value) => {
  return deburr(toLower(string)).indexOf(deburr(toLower(value))) >= 0;
};

export const rotateArray = (arrayToRotate, timesToRotate) => {
  var arr = [];
  for (var i = 0; i < arrayToRotate.length; i++) {
    arr.push(arrayToRotate[i]);
  }
  for (var j = 1; j <= timesToRotate; j++) {
    arr.shift(arr.push(arr[0]));
  }
  return arr;
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
