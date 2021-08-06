import get from "lodash/get";
import map from "lodash/map";
import trimStart from "lodash/trimStart";
import isEmpty from "lodash/isEmpty";

const MicroDataBreadcrumbs = ({ data = null, webInstance = {} }) => {
  if (isEmpty(data)) {
    return null;
  }

  const domain = webInstance?.domain ? webInstance?.domain : "";

  let positionIndex = 1;
  let items = [
    {
      "@type": "ListItem",
      position: positionIndex,
      name: domain,
      item: domain,
    },
  ];

  map(get(data, "categorical", []), (entry) => {
    positionIndex = positionIndex + 1;
    items.push({
      "@type": "ListItem",
      position: positionIndex,
      name: get(entry, "name"),
      item: `${domain}/kategoria/${get(entry, "urlName")}`,
    });
  });

  map(get(data, "childrens", []), (entry) => {
    positionIndex = positionIndex + 1;
    items.push({
      "@type": "ListItem",
      position: positionIndex,
      name: entry?.name,
      item: `${domain}/${trimStart(get(entry, "as") || get(entry, "href"), '/')}`,
    });
  });

  if (get(data, "current")) {
    items.push({
      "@type": "ListItem",
      position: positionIndex + 1,
      name: data?.current,
    });
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org/",
          "@type": "BreadcrumbList",
          itemListElement: items,
        }),
      }}
    />
  );
};

export default MicroDataBreadcrumbs;
