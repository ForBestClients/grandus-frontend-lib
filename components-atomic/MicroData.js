import useWebInstance from "grandus-lib/hooks/useWebInstance";
import MicroDataProduct from "grandus-lib/components-atomic/microData/MicroDataProduct";
import MicroDataBreadcrumbs from "grandus-lib/components-atomic/microData/MicroDataBreadcrumbs";
import MicroDataArticle from "grandus-lib/components-atomic/microData/MicroDataArticle";
import MicroDataSearch from "grandus-lib/components-atomic/microData/MicroDataSearch";
import MicroDataOrganization from "grandus-lib/components-atomic/microData/MicroDataOrganization";
import isEmpty from "lodash/isEmpty";
import includes from "lodash/includes";

export const MICRODATA_PRODUCT = "product";
export const MICRODATA_BREADCRUMBS = "breadcrumbs";
export const MICRODATA_ARTICLE = "article";
export const MICRODATA_SEARCH = "search";
export const MICRODATA_ORGANIZATION = "organization";

const MicroData = ({ type = "default", data = null }) => {
  if (isEmpty(data) && !includes(type, [MICRODATA_SEARCH])) {
    return null;
  }

  const { webInstance } = useWebInstance();
  switch (type) {
    case MICRODATA_PRODUCT:
      return <MicroDataProduct data={data} webInstance={webInstance} />;
    case MICRODATA_BREADCRUMBS:
      return <MicroDataBreadcrumbs data={data} webInstance={webInstance} />;
    case MICRODATA_ARTICLE:
      return <MicroDataArticle data={data} webInstance={webInstance} />;
    case MICRODATA_SEARCH:
      return <MicroDataSearch webInstance={webInstance} />;
    case MICRODATA_ORGANIZATION:
      return <MicroDataOrganization webInstance={webInstance} />;
    default:
      return null; // TODO: return default snippet
  }
};

export default MicroData;
