import { get, split, zip, zipObject, map, isNull } from "lodash";
import Redis from "ioredis";
import {
  USER_CONSTANT,
  USER_WISHLIST_CONSTANT,
} from "grandus-lib/constants/SessionConstants";

let client = null;
if (process.env.CACHE_ENABLED) {
  if (process.env.CACHE_USE_CLUSTER) {
    let clusterConfigExploded = zip(
      split(process.env.CACHE_PORT, ","),
      split(process.env.CACHE_HOST, ",")
    );
    let clusterConfig = map(clusterConfigExploded, (clusterConfigEntry) => {
      return zipObject(["port", "host"], clusterConfigEntry);
    });
    client = new Redis.Cluster(clusterConfig);
  } else {
    client = new Redis(
      process.env.CACHE_PORT ? process.env.CACHE_PORT : undefined,
      process.env.CACHE_HOST ? process.env.CACHE_HOST : undefined,
      { lazyConnect: true }
    );
  }
}

/**
 * Internal function for getting user AccessToken from session. If user is not logged in, result is unified 0
 *
 * @param {Object} req  - url request object
 */
const extractUserAccessToken = (req) => {
  let user = {};
  if (req && req?.session) {
    user = req.session.get(USER_CONSTANT);
  }
  return get(user, "accessToken", 0);
};

/**
 * Initialized Redis client
 */
export default client;

/**
 * Generate unified cache KEY from provided array enriched with env prefix and suffix
 *
 * @param {Array} keyParts - parts which will be concated
 */
export const getCacheKey = (keyParts = []) => {
  return [
    process.env.CACHE_KEY_PREFIX ? process.env.CACHE_KEY_PREFIX : "prefix",
    process.env.HOST ? process.env.HOST : "undefined-host",
    ...keyParts,
    process.env.CACHE_KEY_SUFFIX ? process.env.CACHE_KEY_SUFFIX : "suffix",
  ]
    .join("-")
    .replace(/ /gi, "--"); //regex to replace all occurances of ' '
};

/**
 * Generate unified cache KEY from request
 *
 * @param {object} req
 *
 * @returns {string} User AccessToken or 0
 */
export const getCacheKeyByRequest = (req) => {
  return getCacheKey([get(req, "url", "/"), extractUserAccessToken(req)]);
};

/**
 * Generate unified cache KEY by type
 *
 * @param {options} type enumerated set of predefined options
 * @param {object} options specified options which variate specific options
 */
export const getCacheKeyByType = (type = "request", options = {}) => {
  switch (type) {
    case "webinstance":
      return getCacheKey(["system-webinstance"]);
    case "header":
      return getCacheKey(["system-layout-header"]);
    case "footer":
      return getCacheKey(["system-layout-footer"]);
    case "custom":
      const cacheParts = ["custom-key", ...get(options, "cacheKeyParts", [])];
      if (get(options, "cacheKeyUseUser", true)) {
        cacheParts.push(extractUserAccessToken(get(options, "req", null)));
      }
      return getCacheKey(cacheParts);
    case "request":
      return getCacheKeyByRequest(get(options, "req", null));
    case "wishlist":
      return getCacheKey([
        USER_WISHLIST_CONSTANT,
        extractUserAccessToken(get(options, "req", null)),
      ]);
    default:
      return getCacheKey([`default-${type}`]);
  }
};

/**
 * Get data from Redis cache
 *
 * @param {object} req nextjs request object
 * @param {instance} cache sinstance of previosly initiated redis client
 * @param {object} options specified options which variate specific options
 */
export const getCachedData = async (req, cache, options = {}) => {
  if (!cache) return false;
  const data = await cache.get(
    getCacheKeyByType(get(options, "cacheKeyType"), { req: req, ...options })
    // (err) => console.error(err)
  );

  if (!data) {
    return false;
  }

  return JSON.parse(data);
};

/**
 * Get data from Redis cache and output it to response.
 * used mainly by API
 *
 * @param {object} req nextjs request object
 * @param {object} res nextjs response object
 * @param {instance} cache sinstance of previosly initiated redis client
 * @param {object} options specified options which variate specific options
 */
export const outputCachedData = async (req, res, cache, options = {}) => {
  if (!cache) return false;

  const cachedData = await getCachedData(req, cache, options);
  if (isNull(cachedData) || cachedData == false) return false;

  res.setHeader("Grandus-Cached-Data", true);
  res.status(200).json(cachedData);
  return true;
};

/**
 * Save data to Redis cache
 *
 * @param {object} req nextjs request object
 * @param {instance} cache sinstance of previosly initiated redis client
 * @param {object} data data to be saved in cache
 * @param {object} options specified options which variate specific options
 */
export const saveDataToCache = async (req, cache, data, options = {}) => {
  if (!cache) return false;

  let cacheTime = get(options, 'time');
  if (!cacheTime) {
    cacheTime = process.env.CACHE_TIME ? process.env.CACHE_TIME : 60;
  }

  const locale = get(req, 'cookies.NEXT_LOCALE');
  const cacheKey = getCacheKeyByType(get(options, "cacheKeyType"), { req: req, ...options })
    + (locale ? `.${locale}`: "");

  try {
    cache.set(
      cacheKey,
      JSON.stringify(data),
      "EX",
      cacheTime
    );
  } catch (error) {
    console.error(error);
  }
};
