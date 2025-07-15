import styles from "./TopProduct.module.scss";
import Link from "next/link";
import Image from "grandus-lib/components-atomic/image/Image";
import Price from "grandus-lib/components-atomic/price/Price";

const TopProduct = ({
  name,
  brand,
  urlTitle,
  photo,
  finalPriceData,
  closeAction,
}) => (
  <Link href={`/produkt/${urlTitle}`}
        legacyBehavior
>
        <a       
        onClick={() => {
        closeAction(false);
      }}
      className={styles.product}
      >
      <Image photo={photo} size={"250x250"} type={"jpg"} />
      <span className={styles.name}>{name}</span>
      <Price priceData={finalPriceData} className={styles.price} />
      </a>
  </Link>
);

export default TopProduct;
