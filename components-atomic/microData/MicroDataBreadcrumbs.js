import get from "lodash/get";
import map from "lodash/map";
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

  // map(get(data, "childrens", []), (entry) => {
  //   positionIndex = positionIndex + 1;
  //   items.push({
  //     "@type": "ListItem",
  //     position: positionIndex,
  //     name: entry,
  //   });
  // });

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
