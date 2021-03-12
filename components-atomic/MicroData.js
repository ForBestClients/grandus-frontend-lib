import Head from "next/head";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import MicroDataProduct from "grandus-lib/components-atomic/microData/MicroDataProduct";
import { isEmpty } from "lodash";

export const MICRODATA_PRODUCT = "product";

const MicroData = ({ type = "default", data = null }) => {
  if (isEmpty(data)) {
    return null;
  }

  const { webInstance } = useWebInstance();
  switch (type) {
    case MICRODATA_PRODUCT:
      return <MicroDataProduct data={data} webInstance={webInstance} />;
    default:
      return null; // TODO: return default snippet
  }
};

export default MicroData;
