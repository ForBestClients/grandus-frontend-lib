import { getImageUrl } from "grandus-lib/utils";
import { get, isEmpty } from "lodash";

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
      sku = "",
      ean = "",
      availability,
    } = data;
    const { domain = null, currencySymbol } = webInstance;
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            productID: id,
            name,
            image:
              photo && photo?.path ? getImageUrl(photo, "400x250", "jpg") : "",
            description: get(shortProductDescription, "description", ""),
            url: `${domain}/produkt/${urlTitle}`,
            sku: sku,
            mpn: ean,
            brand: {
              "@type": "Thing",
              name: get(brand, "name", ""),
            },
            offers: {
              "@type": "Offer",
              url: `${domain}/produkt/${urlTitle}`,
              priceCurrency: currencySymbol,
              price: get(finalPriceData, "price", finalPrice),
              availability: availability
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: domain,
              },
            },
          }),
        }}
      />
    );
  }
  return null;
};

export default MicroDataProduct;
