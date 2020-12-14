import {
  get,
  isEmpty,
  map,
  orderBy,
  find,
  startsWith,
  split,
  toNumber,
  last,
} from "lodash";

import Image from "grandus-lib/components-atomic/image/Image";
import Link from "next/link";

import styles from "./Variant.default.module.scss";

const HASH_DELIMITER = "-";

const Variant = ({ data, hash = false, options = {} }) => {

  if (isEmpty(data)) {
    return "";
  }

  if (hash === false) {
    return "";
  }

  const matchedRule = find(orderBy(data, ["priority"], ["desc"]), (item) =>
    startsWith(item.hash, hash)
  );

  if (!matchedRule) {
    return "";
  }

  const parameterId = toNumber(last(split(matchedRule.hash, HASH_DELIMITER)));

  if (!matchedRule || isEmpty(matchedRule?.products)) {
    return "";
  }

  return (
    <div className={styles.wrapper}>
      {matchedRule?.name ? (
        <h4 className={styles.headline}>{matchedRule?.name}</h4>
      ) : (
        ""
      )}

      {map(get(matchedRule, "products", []), (product, index) => {
        const foundParameter = find(product?.parameters, [
          "parameterId",
          parameterId,
        ]);

        return (
          <Link
            key={`products-variant-${hash}-${product.id}-${index}`}
            href="/produkt/[id]"
            as={`/produkt/${product?.urlTitle}`}
            scroll={true}
          >
            <a className={styles.item}>
              {get(options, "image.disabled", false) ? (
                ""
              ) : (
                <Image
                  size={get(options, "image.size", "45x45")}
                  photo={product?.photo}
                  type={get(options, "image.type", "jpg")}
                />
              )}

              <span>{foundParameter?.value}</span>
            </a>
          </Link>
        );
      })}
    </div>
  );
};

export default Variant;
