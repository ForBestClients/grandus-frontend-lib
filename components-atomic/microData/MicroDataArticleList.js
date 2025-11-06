'use client';
import { generateArticleScheme } from 'grandus-lib/utils/microdata';
import MicroDataList from './MicroDataList';
import map from 'lodash/map';

const MicroDataArticleList = ({ data = null, webInstance = null }) => {
  const listElements = map(data, article => generateArticleScheme(article, webInstance));
  return <MicroDataList
    webInstance={webInstance}
    totalNumberOfElements={listElements.length}
    listElements={[listElements]}
  />;
};

export default MicroDataArticleList;
