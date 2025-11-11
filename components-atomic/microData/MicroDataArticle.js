import isEmpty from 'lodash/isEmpty';
import { generateArticleScheme } from 'grandus-lib/utils/microdata';


const MicroDataArticle = ({ data = null, webInstance = null }) => {
  if (isEmpty(data) || isEmpty(webInstance)) {
    return null;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(generateArticleScheme(data, webInstance)),
      }}
    />
  );
};

export default MicroDataArticle;
