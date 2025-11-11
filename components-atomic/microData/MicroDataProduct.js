
import isEmpty from 'lodash/isEmpty';
import { generateProductScheme } from 'grandus-lib/utils/microdata';

const MicroDataProduct = ({ data = null, webInstance = null }) => {
  if (!isEmpty(data) && !isEmpty(webInstance)) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductScheme(data, webInstance)),
        }}
      />
    );
  }
  return null;
};

export default MicroDataProduct;
