import { get, split, zip, zipObject, map, isNull } from "lodash";
import Redis from "ioredis";
import { USER_CONSTANT } from "grandus-lib/constants/SessionConstants";

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

export default client;

/**
 * Generate unified cache KEY
 *
 * @param {object} req
 */
export const cacheKeyByRequest = (req) => {
  let user = {};
  if (req.session) {
    user = req.session.get(USER_CONSTANT);
  }
  return [
    process.env.CACHE_KEY_PREFIX ? process.env.CACHE_KEY_PREFIX : "prefix",
    get(req, "url", "/"),
    get(user, "accessToken", 0),
    process.env.CACHE_KEY_SUFFIX ? process.env.CACHE_KEY_SUFFIX : "suffix",
  ].join("-");
};

export const outputCachedData = async (req, res, cache) => {
  if (!cache) return false;
  const cachedData = await cache.get(
    cacheKeyByRequest(req, (err) => console.error(err))
  );
  if (isNull(cachedData)) return false;

  res.status(200).json(cachedData);
  return true;
};

export const saveDataToCache = async (req, cache, data) => {
  if (!cache) return false;
  try {
    cache.set(
      cacheKeyByRequest(req),
      JSON.stringify(data),
      "EX",
      process.env.CACHE_TIME ? process.env.CACHE_TIME : 60
    );
  } catch (error) {
    console.error(error);
  }
};
