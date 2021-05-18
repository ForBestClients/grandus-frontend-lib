// import { Col, Row, Radio } from "antd";
import useCart from "grandus-lib/hooks/useCart";
import { isEmpty, get, map, find, omitBy } from "lodash";

import BesteronSingleButton from "grandus-lib/components/payment/provider/providers/BesteronSingleButton";

import styles from "./Besteron.module.scss";

const CARD_PAYMENT_BUTTON = "FIRSTDATACARD";

const Besteron = ({ payment, updateCart = true, handleChange }) => {
  const { cart, cartUpdate } = useCart(null, { revalidateOnMount: false });

  if (isEmpty(get(payment, "options"))) {
    return null;
  }

  const onChange = (e) => {
    e.preventDefault();
    handleChange(e);
    if (updateCart) {
      cartUpdate({ specificPaymentType: e.target.value });
    }
  };

  const firstDataCardPaymentButton = find(
    get(payment, "options"),
    (option) => option?.value === CARD_PAYMENT_BUTTON
  );
  const otherPaymentButtons = omitBy(
    get(payment, "options"),
    (option) => option?.value === CARD_PAYMENT_BUTTON
  );

  return (
    <>
      <div className={`${styles.besteron} besteron__custom`}>
        {/* <Radio.Group
          onChange={onChange}
          value={cart?.specificPaymentType}
          name={"specificPaymentType"}
        > */}
        {!isEmpty(firstDataCardPaymentButton) ? (
          <>
            <div className={styles.specificPaymentOptionHeader}>
              Platba kartou
            </div>
            <div className={styles.specificPaymentOption}>
              <BesteronSingleButton
                handleChange={onChange}
                active={
                  cart?.specificPaymentType ===
                  firstDataCardPaymentButton?.value
                }
                data={firstDataCardPaymentButton}
              />
            </div>
          </>
        ) : null}

        {!isEmpty(otherPaymentButtons) ? (
          <>
            <div className={styles.specificPaymentOptionHeader}>
              Platba bankovými tlačidlami
            </div>
            <>
              {map(otherPaymentButtons, (specificPaymentOption, index) => (
                <div
                  className={styles.specificPaymentOption}
                  key={
                    "besteron-specific-payment-" +
                    get(specificPaymentOption, "value", index)
                  }
                >
                  <BesteronSingleButton
                    handleChange={onChange}
                    active={
                      cart?.specificPaymentType === specificPaymentOption?.value
                    }
                    data={specificPaymentOption}
                  />
                </div>
              ))}
            </>
          </>
        ) : null}
        {/* </Radio.Group> */}
      </div>
    </>
  );
};

export default Besteron;
