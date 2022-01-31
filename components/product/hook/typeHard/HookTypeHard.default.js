import Link from "next/link";

import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";

import Image from "grandus-lib/components-atomic/image/Image";
import Price from "grandus-lib/components-atomic/price/Price";
import { GiftOutlined } from "@ant-design/icons";

import styles from "./HookTypeHard.default.module.scss";

const HookTypeHard = ({ data = [], options = {} }) => {
  if (isEmpty(data)) {
    return "";
  }

  return (
    <div className={get(options, "renderWrapper") ? styles?.wrapper : ""}>
      <div className={styles.badge}>
        <GiftOutlined /> {get(options, "title", data?.name)}
      </div>
      {map(data?.hookedProducts, (product) => {
        const { name, urlTitle, photo = null, finalPriceData } = product;

        const priceOtions = {
          hideVatPrice: finalPriceData?.price <= 0 ? true : false,
          ...get(options, "price"),
        };

        return (
          <Link
            key={`product-hard-hook-${urlTitle}`}
            href={`/produkt/${urlTitle}`}
            scroll={true}
          >
            <a className={styles.product}>
              {photo ? <Image photo={photo} size={"45x45"} type={"jpg"} /> : ""}
              <div className={styles.content}>
                <strong>{name}</strong>
                <Price priceData={finalPriceData} options={priceOtions} />
              </div>
            </a>
          </Link>
        );
      })}
    </div>
  );
};

export default HookTypeHard;
