import { isEmpty } from 'lodash';

export default ({ priceData, className, microData = true, options = {} }) => {
  if (isEmpty(priceData)) {
    return null;
  }
  return (
    <span className={className}>
      {microData ? (
        <>
          <meta itemProp="priceCurrency" content={priceData.currency} />
          <meta itemProp="valueAddedTaxIncluded" content={1} />
          <meta itemProp="price" content={priceData.price} />
        </>
      ) : null}

      <span data-property={"price"} className={`${ options?.mainPriceClass ? options?.mainPriceClass : ""}`}>{priceData.priceFormatted}</span>
      {
        !options?.hideVatPrice ? 
          <span data-property={"priceWithoutVat"} className={`${ options?.withoutVatPriceClass ? options?.withoutVatPriceClass : ""}`}> 
            {priceData.priceWithoutVatFormatted} 
          </span> : ""
      }
    </span>
  );
};
