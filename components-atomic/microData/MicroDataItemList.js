"use client"
import { generateProductScheme } from 'grandus-lib/utils/microdata';
import map from 'lodash/map';
import MicroDataList from './MicroDataList';

const MicroDataItemList = ({ data = null, webInstance = null }) => {
  const { products, totalNumberOfItems } = data;
  const productsScheme = map(products, product => generateProductScheme(product, webInstance));

  return <MicroDataList
    listElements={productsScheme}
    totalNumberOfItems={totalNumberOfItems}
    webInstance={webInstance} />
};

export default MicroDataItemList;
