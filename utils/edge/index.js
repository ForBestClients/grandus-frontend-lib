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
    : '';

  if (!image) {
    return false;
  }

  const updateTimeTimestamp = image?.updateTime
    ? '?v=' + encodeURIComponent(image?.updateTime).replaceAll('%', '-')
    : '';

  const imagePath = image?.path?.endsWith('_')
    ? image?.path
    : image?.path + '/';

  return host + imagePath + size + '.' + type + updateTimeTimestamp;
};

export const reqApiHost = (req = {}) => {
  return process.env.HOST_API;
};

export const reqGetHeadersBasic = (req = {}) => {
  return {
    'Content-Type': 'application/json',
    'Owner-Token': process.env.GRANDUS_TOKEN_OWNER,
    'Webinstance-Token': process.env.GRANDUS_TOKEN_WEBINSTANCE,
  };
};
