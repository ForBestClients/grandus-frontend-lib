"use client"
import isEmpty from 'lodash/isEmpty';
import { usePathname } from 'next/navigation';

const MicroDataList = ({ webInstance = null, listElements = [], totalNumberOfItems = null }) => {
  const pathname = usePathname();
  if (isEmpty(listElements) || isEmpty(webInstance)) {
    return null;
  }

  const { domain = null } = webInstance;
  const scheme = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "url": `${domain}${pathname}`,
    "numberOfItems": totalNumberOfItems || listElements?.length || 0,
    "itemListElement": listElements
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(scheme),
      }}
    />
  );

};

export default MicroDataList;
