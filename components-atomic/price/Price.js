import { isEmpty } from 'lodash';
import styles from "./Price.module.scss";
import { isB2B } from 'grandus-lib/utils/index';
import useWebInstance from 'grandus-lib/hooks/useWebInstance';
import useUser from 'grandus-lib/hooks/useUser';

export default ({ priceData, className, microData = true, options = {} }) => {
  if (isEmpty(priceData)) {
    return null;
  }
  const { eshopType } = useWebInstance()
  const { user } = useUser();
  const isB2BEshop = isB2B(eshopType, user);
  return (
    <span className={`${styles.wrapper} ${className ? className : ""}`}>
      {microData ? (
        <>
          <meta itemProp="priceCurrency" content={priceData.currency} />
          <meta itemProp="valueAddedTaxIncluded" content={1} />
          <meta itemProp="price" content={priceData.price} />
        </>
      ) : null}

      <span data-property={"price"} data-type={isB2BEshop ? 'secondary' : 'primary'} className={`${ options?.mainPriceClass ? options?.mainPriceClass : ""}`}>{priceData.priceFormatted}</span>
      {
        !options?.hideVatPrice ? 
          <span data-property={"priceWithoutVat"} data-type={isB2BEshop ? 'primary' : 'secondary'} className={`${ options?.withoutVatPriceClass ? options?.withoutVatPriceClass : ""}`}> 
            {priceData.priceWithoutVatFormatted} 
          </span> : ""
      }
    </span>
  );
};
