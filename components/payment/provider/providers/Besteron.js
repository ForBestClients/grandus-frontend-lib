import { Col, Row, Radio } from "antd";
import useCart from "grandus-lib/hooks/useCart";
import { isEmpty, get, map, find, omitBy } from "lodash";

import BesteronSingleButton from "grandus-lib/components/payment/provider/providers/BesteronSingleButton";

import styles from "./Besteron.module.scss";

const CARD_PAYMENT_BUTTON = "FIRSTDATACARD";

const Besteron = ({ payment, handleChange }) => {
  const { cart, cartUpdate } = useCart();

  if (isEmpty(get(payment, "options")) || isEmpty(cart)) {
    return null;
  }

  const onChange = (e) => {
    handleChange(e);
    cartUpdate({ specificPaymentType: e.target.value });
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
        <Row gutter={[8, 8]}>
          <Col span={24}>
            <Radio.Group
              onChange={onChange}
              value={cart?.specificPaymentType}
              style={{ width: "100%" }}
              name={"specificPaymentType"}
            >
              {!isEmpty(firstDataCardPaymentButton) ? (
                <>
                  <Row gutter={[0, 8]}>
                    <Col xs={24} className={styles.specificPaymentOptionHeader}>
                      Platba kartou
                    </Col>
                  </Row>
                  <Row gutter={[0, 8]}>
                    <Col xs={24} className={styles.specificPaymentOption}>
                      <BesteronSingleButton data={firstDataCardPaymentButton} />
                    </Col>
                  </Row>
                </>
              ) : null}

              {!isEmpty(otherPaymentButtons) ? (
                <>
                  <Row gutter={[0, 8]}>
                    <Col xs={24} className={styles.specificPaymentOptionHeader}>
                      Platba bankovými tlačidlami
                    </Col>
                  </Row>
                  <Row gutter={[0, 8]}>
                    {map(
                      otherPaymentButtons,
                      (specificPaymentOption, index) => (
                        <Col
                          xs={24}
                          className={styles.specificPaymentOption}
                          key={
                            "besteron-specific-payment-" +
                            get(specificPaymentOption, "value", index)
                          }
                        >
                          <BesteronSingleButton data={specificPaymentOption} />
                        </Col>
                      )
                    )}
                  </Row>
                </>
              ) : null}
            </Radio.Group>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Besteron;
