"use client"
import { generateProductScheme } from 'grandus-lib/utils/microdata';
import map from 'lodash/map';
import MicroDataList from './MicroDataList';
import isEmpty from 'lodash/isEmpty';

const MicroDataItemList = ({ data = null, webInstance = null }) => {
  if (isEmpty(data) || isEmpty(webInstance)) {
    return null;
  }
  const { products, totalNumberOfItems } = data;
  const productsScheme = map(products, product => generateProductScheme(product, webInstance ?? {}));

  return <MicroDataList
    listElements={productsScheme}
    totalNumberOfItems={totalNumberOfItems}
    webInstance={webInstance} />
};

export default MicroDataItemList;
