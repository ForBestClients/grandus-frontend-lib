import Cookies from "./cookies";
/**
 * Get client referer URL from request.
 *
 * @param req
 */
const getClientRefererUrl = (req) => String(req.headers.referer ?? '');

/**
 * Get client IP address from request.
 *
 * @param req
 */
const getClientIpAddress = (req) => String(req.headers['x-real-ip'] || req.connection.remoteAddress);

/**
 * Get client user agent from request.
 *
 * @param req
 */
const getClientUserAgent = (req) => String(req.headers['user-agent'] ?? '');

/**
 * Get client fbp from request cookie.
 *
 * @param req
 */
const getClientFbp = (req) => {
  const cookies = Cookies.parse(req.headers.cookie);
  console.log(cookies);

  if (cookies?._fbp) {
    return cookies?._fbp;
  }

  return null;
};

/**
 * Get client fbc from request query params or cookie.
 *
 * @param req
 */
const getClientFbc = (req) => {
  if (req.headers.referer) {
    const url = new URL(req.headers.referer);

    if (url.searchParams.has('fbclid')) {
      return url.searchParams.get('fbclid');
    }
  }

  const cookies = Cookies.parse(req.headers.cookie);

  if (cookies?._fbc) {
    return cookies?._fbc;
  }

  return null;
};

export {
  getClientRefererUrl,
  getClientIpAddress,
  getClientUserAgent,
  getClientFbp,
  getClientFbc,
}
