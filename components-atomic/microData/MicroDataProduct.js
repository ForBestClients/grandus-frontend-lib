import { getImageUrl } from 'grandus-lib/utils';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import sum from 'lodash/sum';

const MicroDataProduct = ({ data = null, webInstance = null }) => {
  if (!isEmpty(data) && !isEmpty(webInstance)) {
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
    } = data;
    const { domain = null, currency } = webInstance;

    const schemaAvailability = {
      availability: availability
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    };

    if (
      data?.isOrderable &&
      process?.env?.NEXT_PUBLIC_BACKORDER_AVAILABILITY_DURATION &&
      sum(get(data, 'store', []).map(store => store.count)) === 0
    ) {
      schemaAvailability.availability = 'https://schema.org/BackOrder';
      const currentDate = new Date();
      currentDate.setDate(currentDate.getDate() + 14);

      schemaAvailability.availabilityStarts = get(
        currentDate.toISOString().split('T'),
        '0',
      );
    }

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
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
              '@type': 'Thing',
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
            },
          }),
        }}
      />
    );
  }
  return null;
};

export default MicroDataProduct;
