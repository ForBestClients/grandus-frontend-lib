import { getImageUrl } from "grandus-lib/utils";
import isEmpty from "lodash/isEmpty";

const MicroDataProduct = ({ data = null, webInstance = null }) => {
  if (isEmpty(data) || isEmpty(webInstance)) {
    return null;
  }

  const { title, photo } = data;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "NewsArticle",
          headline: title,
          image:
            photo && photo?.path ? [getImageUrl(photo, "400x250", "jpg")] : [],
          // datePublished: createTime,
          // dateModified: updateTime,
        }),
      }}
    />
  );
};

export default MicroDataProduct;
