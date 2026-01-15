import isEmpty from 'lodash/isEmpty';
import get from 'lodash/get';

const MicroDataCollectionPage = ({ category = null, webInstance = null, totalItems = 0 }) => {
  if (isEmpty(category) || isEmpty(webInstance)) {
    return null;
  }

  const { domain = '' } = webInstance;
  const categoryUrl = `${domain}/kategoria/${category?.urlName}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": category?.name || category?.title,
    "description": category?.perex || category?.shortDescription || '',
    "url": categoryUrl,
    "numberOfItems": totalItems,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": totalItems,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
};

export default MicroDataCollectionPage;
