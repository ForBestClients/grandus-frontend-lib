import useCart from "grandus-lib/hooks/useCart";
import { isEmpty, get, map, find, omitBy } from "lodash";

import AhojSingleButton from "grandus-lib/components/v2/payment/provider/providers/ahoj/AhojSingleButton";

import styles from "./Ahoj.module.scss";

const Ahoj = ({ payment, updateCart = true, handleChange, options = {} }) => {
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

  const paymentButtons = get(payment, "options");

  return (
    <div className={`${styles.ahoj} ahoj__custom`}>
      {!isEmpty(paymentButtons) ? (
        <>
          <div
            className={
              styles.specificPaymentOptionHeader + " besteron_custom_label"
            }
          >
            {get(options, "bankButtonsPaymentText", "Vyberte jednu z možností")}
          </div>
          <div className={styles?.specificPaymentOptions}>
            {map(paymentButtons, (specificPaymentOption, index) => (
              <div
                className={styles.specificPaymentOption + " ahoj_custom_option"}
                key={
                  "ahoj-specific-payment-" +
                  get(specificPaymentOption, "value", index)
                }
              >
                <AhojSingleButton
                  handleChange={onChange}
                  active={
                    cart?.specificPaymentType === specificPaymentOption?.value
                  }
                  data={specificPaymentOption}
                />
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
};

export default Ahoj;
