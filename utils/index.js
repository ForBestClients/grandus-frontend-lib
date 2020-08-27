import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";
import {
  ESHOP_TYPE_B2B,
  ESHOP_TYPE_B2C,
  ESHOP_TYPE_B2B_LOCKED,
  ESHOP_TYPE_MIXED,
} from "grandus-lib/constants/AppConstants";
import { get, parseInt, toNumber } from "lodash";

export const reqExtractUri = (url) => {
  const uriPosition = url.indexOf("?");
  return uriPosition > 0 ? url.slice(uriPosition) : "";
};

export const reqGetHost = (req) => {

  if (process.env.HOST) {
    return process.env.HOST;
  }

  let protocol = 'https://'
  const host = get(req, 'headers.host', '');
  if (host.indexOf('localhost') > -1) {
    protocol = 'http://'
  }

  return protocol + host;
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

  return host + image.path + '/' + size + '.' + type;
}

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
}

export const isB2B = (eshopType = ESHOP_TYPE_B2C, user) => {
  return (
    toNumber(eshopType) === ESHOP_TYPE_B2B ||
    toNumber(eshopType) === ESHOP_TYPE_B2B_LOCKED ||
    (toNumber(eshopType) === ESHOP_TYPE_MIXED && get(user, "company.vatNumber", false))
  );
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
