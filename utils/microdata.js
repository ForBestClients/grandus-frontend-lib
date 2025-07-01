import sum from 'lodash/sum';
import get from 'lodash/get';
import { getImageUrl } from './index';
import isEmpty from 'lodash/isEmpty';
import mean from 'lodash/mean';
import map from 'lodash/map';
import isArray from 'lodash/isArray';
import upperFirst from 'lodash/upperFirst';

export const generateProductScheme = (product, webInstance) => {
  const {
    id,
    name,
    shortProductDescription,
    brand,
    finalPrice,
    finalPriceData,
    urlTitle,
    photo,
    sku = '',
    ean = '',
    availability,
    reviews
  } = product;
  const { domain = null, currency } = webInstance;

  const schemaAvailability = {
    availability: availability
      ? 'https://schema.org/InStock'
      : 'https://schema.org/OutOfStock',
  };

  if (
    product?.isOrderable &&
    process?.env?.NEXT_PUBLIC_BACKORDER_AVAILABILITY_DURATION &&
    sum(get(product, 'store', []).map(store => store.count)) === 0
  ) {
    schemaAvailability.availability = 'https://schema.org/BackOrder';
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 14);

    schemaAvailability.availabilityStarts = get(
      currentDate.toISOString().split('T'),
      '0',
    );
  }

  const schema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    productID: `${id}`,
    name,
    image:
      photo && photo?.path ? getImageUrl(photo, '400x250', 'jpg') : '',
    description: get(shortProductDescription, 'description', ''),
    url: `${domain}/produkt/${urlTitle}`,
    sku: `${sku}` || `${id}`,
    mpn: `${ean}` || `${id}`,
    brand: {
      '@type': 'Brand',
      name: get(brand, 'name', ''),
    },
    offers: {
      '@type': 'Offer',
      url: `${domain}/produkt/${urlTitle}`,
      priceCurrency: currency,
      price: get(finalPriceData, 'price', finalPrice),
      seller: {
        '@type': 'Organization',
        name: domain,
      },
      ...schemaAvailability,
    }
  }

  if (!isEmpty(reviews)) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      "ratingValue": mean(map(reviews, review => +review.data.rating)).toFixed(1),
      "ratingCount": reviews.length,
    };
    schema.review = reviews.map(review => ({
      '@type': 'Review',
      "reviewBody": review?.data?.summary ? review?.data?.summary : review?.data?.pros,
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review?.data?.rating ?? 5,
      },
      "author": {
        "@type": "Person",
        "name": 'customer',
      },
      "datePublished": review?.data?.unix_timestamp,
    }))
  }

  return schema;
}

export const convertDomainToName = domainString => {
  if (!domainString) {
    return '';
  }

  const hostname = new URL(domainString)?.hostname;
  return hostname.replace(/^www\./, '');
};

export const getLogoUrl = (domain, logoObj) => {
  if (!domain) return '';

  if (logoObj && logoObj?.path) {
    return `${domain}${logoObj.path}`;
  }
  return '';
};

export const convertDateStringToDateObject = (dateString = '') => {
  const regex =
    /^(?<date>\d{1,2}).(?<month>\d{1,2}).(?<fullYear>\d{4})\s(?<uTCHours>\d{1,2}):(?<minutes>\d{2}):(?<seconds>\d{2})$/gm;
  const date = new Date();

  const matches = regex.exec(dateString)?.groups;
  matches.month -= 1; // numbered from 0 to 11

  if (!isEmpty(matches)) {
    Object.keys(matches).forEach(groupName => {
      date[`set${upperFirst(groupName)}`](matches[groupName]);
    });
  }

  return date;
};

export const generateArticleScheme = (article, webInstance) => {
  const { domain, logo } = webInstance;

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article?.title,
    image: article?.photo?.path ? [getImageUrl(article.photo, '400x250', 'jpg')] : [],
    author: {
      '@type': 'Organization',
      name: convertDomainToName(domain),
      logo: getLogoUrl(domain, logo),
    },
    publisher: {
      '@type': 'Organization',
      name: convertDomainToName(domain),
      logo: getLogoUrl(domain, logo),
    },
    datePublished: article?.createTime
      ? convertDateStringToDateObject(article?.createTime)
      : article?.publishTime,
  };
}
