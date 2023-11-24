import { USER_CONSTANT } from 'grandus-lib/constants/SessionConstants';
import {
  ESHOP_TYPE_B2B,
  ESHOP_TYPE_B2C,
  ESHOP_TYPE_B2B_LOCKED,
  ESHOP_TYPE_MIXED,
  CATEGORY_PARAMETERS_BASIC,
  CATEGORY_PARAMETERS_ADVANCED,
  ATTACHMENT_TYPE_URL,
} from 'grandus-lib/constants/AppConstants';

import get from 'lodash/get';
import parseInt from 'lodash/parseInt';
import toNumber from 'lodash/toNumber';
import deburr from 'lodash/deburr';
import toLower from 'lodash/toLower';
import replace from 'lodash/replace';
import isEmpty from 'lodash/isEmpty';
import filter from 'lodash/filter';
import split from 'lodash/split';

// edge runtime compatibility
import {
  getImageUrl as getImageUrlEdge,
  reqApiHost as reqApiHostEdge,
  reqGetHeadersBasic as reqGetHeadersBasicEdge,
} from 'grandus-lib/utils/edge/index';

export const getDevMeta = () => {
  if (
    process.env.NODE_ENV !== 'production' ||
    process.env.APP_ENV !== 'production'
  ) {
    return (
      <>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex" />
      </>
    );
  }

  return '';
};

export const getDocumentInitialProps = (webInstance = null) => {
  if (isEmpty(webInstance)) {
    return {};
  }

  return {
    favicon: get(webInstance, 'favicon'),
    customScripts: get(webInstance, 'globalSettings.custom_javascript', ''),
    customStyles: get(webInstance, 'globalSettings.custom_css', ''),
    googleAnalyticsCode: get(
      webInstance,
      'globalSettings.google_analytics_code',
      '',
    ),
    googleTagManagerCode: get(
      webInstance,
      'globalSettings.google_tag_manager_code',
      '',
    ),
    fbPixelCode: get(webInstance, 'globalSettings.facebook_remarketing_id', ''),
  };
};

export const reqExtractUri = url => {
  const uriPosition = url?.indexOf('?');
  return uriPosition > 0 ? url.slice(uriPosition) : '';
};

export const reqGetHost = req => {
  if (process.env.HOST) {
    return process.env.HOST;
  }

  let protocol = 'https://';
  const host = get(req, 'headers.host', '');
  if (host.indexOf('localhost') > -1) {
    protocol = 'http://';
  }

  return protocol + host;
};

export const reqApiHost = req => {
  return reqApiHostEdge(req);
};

export const getApiExpand = (
  type = '',
  asUriPart = false,
  uriType = 'EXPAND',
) => {
  if (!type) {
    return '';
  }

  const expandPrepend = asUriPart
    ? `${toLower(uriType ? uriType : 'EXPAND')}=`
    : '';
  const expandData =
    process.env[`NEXT_PUBLIC_${type}_${uriType ? uriType : 'EXPAND'}`];

  return expandPrepend + expandData;
};

export const getApiFields = (type = '', asUriPart = false) => {
  return getApiExpand(type, asUriPart, 'FIELDS');
};

/* @TODO deprecated */
export const getProductDetailExpand = (asUriPart = false) => {
  return process.env.NEXT_PUBLIC_PRODUCT_DETAIL_EXPAND
    ? `${asUriPart ? `expand=` : ''}${
        process.env.NEXT_PUBLIC_PRODUCT_DETAIL_EXPAND
      }`
    : '';
};

/* @TODO deprecated */
export const getProductDetailFields = (asUriPart = false) => {
  return process.env.NEXT_PUBLIC_PRODUCT_DETAIL_FIELDS
    ? `${asUriPart ? `fields=` : ''}${
        process.env.NEXT_PUBLIC_PRODUCT_DETAIL_FIELDS
      }`
    : '';
};

/* @TODO deprecated */
export const getProductCardFields = (asUriPart = false) => {
  return process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS
    ? `${asUriPart ? `fields=` : ''}${
        process.env.NEXT_PUBLIC_PRODUCT_CARD_FIELDS
      }`
    : `${
        asUriPart ? `fields=` : ''
      }id,name,urlTitle,storeStatus,finalPriceData,photo`;
};

export const reqGetHeadersFront = (req, options = {}) => {
  return {
    ...get(req, 'headers'),
    host: get(req, 'headers.host'),
    'grandus-frontend-url': get(options, 'forwardUrl', get(req, 'url')),
  };
};

export const getFrontendUrlFromHeaders = headers => {
  return get(
    headers,
    'Grandus-Frontend-Url',
    get(headers, 'grandus-frontend-url'),
  );
};

export const reqGetHeaders = req => {
  const result = reqGetHeadersBasicEdge(req);

  const locale = get(req, 'cookies.NEXT_LOCALE');

  if (locale) {
    result['Accept-Language'] = locale;
  }

  const uriToForward = getFrontendUrlFromHeaders(req?.headers);
  if (uriToForward) {
    const removedProtocol = replace(
      replace(uriToForward, 'http://', ''),
      'https://',
      '',
    );

    Object.assign(result, {
      URI: replace(removedProtocol, get(req, 'headers.host'), ''),
    });
  }

  if (!get(req, 'session')) return result;

  const user = req.session.get(USER_CONSTANT);

  if (get(user, 'accessToken')) {
    Object.assign(result, {
      Authorization: `Bearer ${get(user, 'accessToken')}`,
    });
  }

  if (!process.env.NEXT_PUBLIC_REQUEST_ADDITIONAL_FIELDS) return result;

  const additionalFields = split(
    process.env.NEXT_PUBLIC_REQUEST_ADDITIONAL_FIELDS,
    ',',
  );

  if (!isEmpty(additionalFields)) {
    const session = req.session.get();

    additionalFields.map(field => {
      const fieldExpanded = split(field, '|', 2);

      const key = get(fieldExpanded, '[0]');
      const value = get(
        session,
        get(fieldExpanded, '[1]', get(fieldExpanded, '[0]')),
      );

      if (value) {
        const data = {};
        data[key] = value;

        Object.assign(result, data);
      }
    });
  }

  return result;
};

export const scrollToTop = () => {
  if (typeof window !== 'undefined') window.scrollTo(0, 0);
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
  return getImageUrlEdge(image, size, type);
};

/**
 * Generates url to attachment.
 * Automaticaly add host and construct path
 *
 * @param {object} attachment
 */
export const getAttachmentUrl = attachment => {
  const host = process.env.NEXT_PUBLIC_IMAGE_HOST
    ? process.env.NEXT_PUBLIC_IMAGE_HOST
    : '';

  if (!attachment) {
    return false;
  }

  return (
    (attachment?.type !== ATTACHMENT_TYPE_URL ? host : '') + attachment.fileUrl
  );
};

export const convertToNumber = numberCandidate => {
  return parseFloat(numberCandidate.replace(',', '.'));
};

export const isB2B = (eshopType = ESHOP_TYPE_B2C, user) => {
  return (
    toNumber(eshopType) === ESHOP_TYPE_B2B ||
    toNumber(eshopType) === ESHOP_TYPE_B2B_LOCKED ||
    (toNumber(eshopType) === ESHOP_TYPE_MIXED &&
      get(user, 'company.vatNumber', false))
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
export const getPaginationFromHeaders = headers => {
  return {
    totalCount: parseInt(headers.get('x-pagination-total-count')),
    pageCount: parseInt(headers.get('x-pagination-page-count')),
    currentPage: parseInt(headers.get('x-pagination-current-page')),
    perPage: parseInt(headers.get('x-pagination-per-page')),
  };
};

/**
 *
 * Get specific parameters from Category data
 *
 * @param {object} data
 * @param {int} type
 */
export const getCategoryParameters = (
  data,
  type = null,
  path = 'parameters',
) => {
  if (!data) {
    return [];
  }

  const extractType = (item, type) => {
    return parseInt(item.filter) == type;
  };

  let parameters = [];

  if (path && path !== '') {
    parameters = get(data, 'parameters', []);
  } else {
    parameters = data;
  }

  switch (type) {
    case CATEGORY_PARAMETERS_BASIC:
      return filter(parameters, parameter =>
        extractType(parameter, CATEGORY_PARAMETERS_BASIC),
      );
      break;

    case CATEGORY_PARAMETERS_ADVANCED:
      return filter(parameters, parameter =>
        extractType(parameter, CATEGORY_PARAMETERS_ADVANCED),
      );
      break;

    default:
      return parameters;
      break;
  }
};

export const getCategoryParametersBasic = (data, path = 'parameters') => {
  return getCategoryParameters(data, CATEGORY_PARAMETERS_BASIC, path);
};

export const getCategoryParametersAdvanced = (data, path = 'parameters') => {
  return getCategoryParameters(data, CATEGORY_PARAMETERS_ADVANCED, path);
};

export const generateRandomString = (length = 10) => {
  let stringLength = length;
  if (stringLength < 1) {
    stringLength = 10;
  }

  const chars = [
    ...'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  ];
  return [...Array(stringLength)].map(
    i => chars[(Math.random() * chars.length) | 0],
  ).join``;
};

export const remove4ByteChars = (str) => {
  return str?.replace(/[\u{010000}-\u{10FFFF}]/gu, '');
}