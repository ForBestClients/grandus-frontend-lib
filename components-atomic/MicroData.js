import useWebInstance from "grandus-lib/hooks/useWebInstance";
import MicroDataProduct from "grandus-lib/components-atomic/microData/MicroDataProduct";
import MicroDataBreadcrumbs from "grandus-lib/components-atomic/microData/MicroDataBreadcrumbs";
import MicroDataArticle from "grandus-lib/components-atomic/microData/MicroDataArticle";
import isEmpty from "lodash/isEmpty";

export const MICRODATA_PRODUCT = "product";
export const MICRODATA_BREADCRUMBS = "breadcrumbs";
export const MICRODATA_ARTICLE = "article";

const MicroData = ({ type = "default", data = null }) => {
  if (isEmpty(data)) {
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
    default:
      return null; // TODO: return default snippet
  }
};

export default MicroData;
