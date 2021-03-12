import styles from "./ProductRow.module.scss";
import Link from "next/link";
import Image from "grandus-lib/components-atomic/image/Image";
import Price from "grandus-lib/components-atomic/price/Price";
import { truncate } from "lodash";

const RowProduct = ({
  name,
  brand,
  urlTitle,
  photo,
  finalPriceData,
  closeAction,
}) => (
  <Link href="/produkt/[id]" as={`/produkt/${urlTitle}`}>
    <a
      className={styles.product}
      onClick={() => {
        closeAction(false);
      }}
    >
      <Image photo={photo} size={"60x60"} type={"jpg"} />
      <div className={styles?.right}>
        <span className={styles.name}>
          {truncate(name, {
            length: 70,
            omission: " ...",
          })}
        </span>
        <Price priceData={finalPriceData} className={styles.price} />
      </div>
    </a>
  </Link>
);

export default RowProduct;
