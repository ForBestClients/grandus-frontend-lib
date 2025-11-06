"use client"
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import MicroDataProduct from "grandus-lib/components-atomic/microData/MicroDataProduct";
import MicroDataBreadcrumbs from "grandus-lib/components-atomic/microData/MicroDataBreadcrumbs";
import MicroDataArticle from "grandus-lib/components-atomic/microData/MicroDataArticle";
import MicroDataSearch from "grandus-lib/components-atomic/microData/MicroDataSearch";
import MicroDataOrganization from "grandus-lib/components-atomic/microData/MicroDataOrganization";
import MicroDataNavigation from "grandus-lib/components-atomic/microData/MicroDataNavigation";
import MicroDataItemList from 'grandus-lib/components-atomic/microData/MicroDataItemList';
import MicroDataArticleList from 'grandus-lib/components-atomic/microData/MicroDataArticleList';
import isEmpty from "lodash/isEmpty";
import includes from "lodash/includes";

export const MICRODATA_ITEM_LIST = "itemList";
export const MICRODATA_PRODUCT = "product";
export const MICRODATA_BREADCRUMBS = "breadcrumbs";
export const MICRODATA_ARTICLE = "article";
export const MICRODATA_ARTICLE_LIST = "articleList";
export const MICRODATA_SEARCH = "search";
export const MICRODATA_ORGANIZATION = "organization";
export const MICRODATA_NAVIGATION = "navigation"

const MicroData = ({ type = "default", data = null }) => {
  const { webInstance } = useWebInstance();

  if (isEmpty(webInstance) || isEmpty(data) && !includes(type, [MICRODATA_SEARCH]) && !includes(type, [MICRODATA_ORGANIZATION])) {
    return null;
  }

  switch (type) {
    case MICRODATA_ITEM_LIST:
      return <MicroDataItemList data={data} webInstance={webInstance} />;
    case MICRODATA_PRODUCT:
      return <MicroDataProduct data={data} webInstance={webInstance} />;
    case MICRODATA_BREADCRUMBS:
      return <MicroDataBreadcrumbs data={data} webInstance={webInstance} />;
    case MICRODATA_ARTICLE_LIST:
      return <MicroDataArticleList data={data} webInstance={webInstance} />;
    case MICRODATA_ARTICLE:
      return <MicroDataArticle data={data} webInstance={webInstance} />;
    case MICRODATA_NAVIGATION:
      return <MicroDataNavigation data={data} webInstance={webInstance} />;
    case MICRODATA_SEARCH:
      return <MicroDataSearch webInstance={webInstance} />;
    case MICRODATA_ORGANIZATION:
      return <MicroDataOrganization webInstance={webInstance} />;
    default:
      return null;
  }
};

export default MicroData;
