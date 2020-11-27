import {
  Divider,
  Row,
  Col,
  Card,
  Radio,
  Select,
  Form,
  Button,
  Typography,
  Checkbox,
  Alert,
} from "antd";
import * as yup from "yup";
import Steps from "components/cart/steps/CartSteps";
import CartSummary from "components/cart/summary/CartSummary";
import useCart from "grandus-lib/hooks/useCart";
import { Formik, useFormikContext } from "formik";
import {
  isEmpty,
  deburr,
  sortBy,
  groupBy,
  pickBy,
  map,
  get,
  forEach,
  head,
} from "lodash";
import { useState, Fragment } from "react";
import Link from "next/link";
import TextArea from "antd/lib/input/TextArea";
import { useRouter } from "next/router";
import { ArrowLeftOutlined } from "@ant-design/icons";
import EnhancedEcommerce from "grandus-lib/utils/ecommerce";
import TagManager from "grandus-lib/utils/gtag";

import styles from "./step3.page.default.module.scss";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import { deburredSearch } from "grandus-lib/utils";
// import { getClientIdFromCookie } from "utils";

const { Option } = Select;
const { Paragraph } = Typography;

const DeliveryForm = ({
  deliveryOptions = null,
  deliveryType,
  deliveryTypeGroup,
  setDeliveryTypeGroup,
  setDeliveryType,
  cartUpdate,
}) => {
  if (isEmpty(deliveryOptions)) {
    return "Neexistujú žiadne možnosti dopravy";
  }
  const {
    values,
    errors,
    touched,
    setFieldTouched,
    setFieldValue,
    handleBlur,
    handleChange,
    isSubmitting
  } = useFormikContext();

  const resetPayment = () => {
    setFieldValue("payment", null);
    setFieldTouched("payment", true);
    setFieldValue("specificPaymentType", null);
    setFieldTouched("specificPaymentType", true);
  }

  const onGroupChange = (e) => {
    setDeliveryType(null);
    setDeliveryTypeGroup(e.target.value);
    setFieldValue("delivery", null);
    setFieldTouched("delivery", false);
    setFieldTouched("delivery", true);
    handleChange(e);
    resetPayment();
  };

  const onChange = (e) => {
    setDeliveryTypeGroup(null);
    const val = e?.target?.value;
    setDeliveryType(val);
    setFieldValue("delivery", val);
    setFieldTouched("delivery", true);
    cartUpdate({ deliveryType: val });
    handleChange(e);
    resetPayment();
  };

  const deliveryOptionsOrdered = sortBy(deliveryOptions, (groupItem) => {
    return deburr(groupItem.groupName);
  });
  const deliveryOptionsGrouped = groupBy(deliveryOptionsOrdered, (item) => {
    return item.group ? item.group : "nogroup";
  });

  const nogroup = deliveryOptionsGrouped["nogroup"];
  const groups = pickBy(
    deliveryOptionsGrouped,
    (value, key) => key !== "nogroup"
  );
  return (
    <>
      <Radio.Group
        onChange={onChange}
        onBlur={handleBlur}
        value={deliveryType}
        style={{ width: "100%" }}
        disabled={isSubmitting}
      >
        {_.map(nogroup, (option) => (
          <Row gutter={[8, 8]} key={"delivery-radio-" + get(option, "id")}>
            <Col span={24}>
              <Radio value={get(option, "id")}>
                <b>{get(option, "name")}</b>{" "}
                {option?.priceData?.priceFormatted
                  ? ` - ${option?.priceData?.priceFormatted}`
                  : ""}
              </Radio>
              {!isEmpty(option.description) ? (
                <div
                  className={styles.radioDescription}
                  dangerouslySetInnerHTML={{ __html: option?.description }}
                />
              ) : null}
            </Col>
          </Row>
        ))}
      </Radio.Group>
      <Radio.Group
        onChange={onGroupChange}
        onBlur={handleBlur}
        value={deliveryTypeGroup}
        style={{ width: "100%" }}
        disabled={isSubmitting}
      >
        {map(groups, (group, groupName) => (
          <Fragment key={"grouped-delivery-" + groupName}>
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Radio value={groupName}>
                  <b>{groupName}</b>
                </Radio>
              </Col>
            </Row>

            {deliveryTypeGroup === groupName ? (
              <Row gutter={[8, 8]}>
                <Col span={24}>
                  <Form.Item
                    validateStatus={
                      get(touched, "delivery")
                        ? get(errors, "delivery")
                          ? "error"
                          : "success"
                        : null
                    }
                    hasFeedback={get(touched, "delivery")}
                    help={
                      get(touched, "delivery") && get(errors, "delivery")
                        ? get(errors, "delivery")
                        : null
                    }
                  >
                    <Select
                      showSearch
                      id={"delivery"}
                      name={"delivery"}
                      value={values["delivery"]}
                      placeholder={"Doručenie"}
                      disabled={isSubmitting}
                      onChange={(val) => {
                        setFieldValue("delivery", val);
                        cartUpdate({ deliveryType: val });
                      }}
                      onBlur={() => {
                        setFieldTouched("delivery");
                      }}
                      filterOption={(inputValue, option) => {
                        return deburredSearch(
                          get(option, "children"),
                          inputValue
                        );
                      }}
                    >
                      {map(group, (groupValues) => (
                        <Option
                          value={get(groupValues, "id")}
                          key={"delivery-option-" + get(groupValues, "id")}
                        >
                          {`${get(groupValues, "name")} - ${get(
                            groupValues,
                            "price"
                          )} €`}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>
            ) : null}
          </Fragment>
        ))}
      </Radio.Group>
    </>
  );
};

const PaymentForm = ({
  paymentOptions = null,
  setPaymentType,
  paymentType,
  specificPaymentType,
  setSpecificPaymentType,
  cartUpdate,
}) => {
  if (isEmpty(paymentOptions)) {
    return "Najprv vyberte spôsob dopravy.";
  }
  const {
    values,
    errors,
    touched,
    setFieldTouched,
    setFieldValue,
    isSubmitting,
    handleBlur,
    handleChange
  } = useFormikContext();
  const onChange = (e) => {
    setPaymentType(e.target.value);
    setSpecificPaymentType(null);

    setFieldValue("payment", e.target.value);
    setFieldTouched("payment", true);
    setFieldValue("specificPaymentType", null);
    setFieldTouched("specificPaymentType", true);

    cartUpdate({ paymentType: e.target.value });
    handleChange(e);
  };
  const onSpecificPaymentTypeChange = (e) => {
    setFieldValue("payment", e.target.value);
    setFieldTouched("specificPaymentType", true);
    setSpecificPaymentType(e.target.value);
    cartUpdate({ specificPaymentType: e.target.value });
    handleChange(e);
  };
  return (
    <Radio.Group
      onChange={onChange}
      onBlur={handleBlur}
      value={paymentType}
      style={{ width: "100%" }}
      name={"payment"}
      disabled={isSubmitting}
    >
      {map(paymentOptions, (option, index) => (
        <Fragment key={"payment-" + get(option, "id", index)}>
          <Row gutter={[8, 8]}>
            <Col span={24}>
              <Radio value={get(option, "id")}>
                <b>{get(option, "name")}</b>{" "}
                {option?.priceData?.priceFormatted
                  ? ` - ${option?.priceData?.priceFormatted}`
                  : ""}
              </Radio>
            </Col>
          </Row>

          {paymentType === get(option, "id") &&
          !isEmpty(get(option, "options")) ? (
            <Row gutter={[8, 8]}>
              <Col span={24}>
                <Radio.Group
                  onChange={onSpecificPaymentTypeChange}
                  onBlur={handleBlur}
                  value={specificPaymentType}
                  style={{ width: "100%" }}
                  name={"specificPaymentType"}
                  disabled={isSubmitting}
                >
                  <Row gutter={[8, 8]}>
                    {map(
                      get(option, "options"),
                      (specificPaymentOption, index) => (
                        <Col
                          xs={12}
                          className={styles.specificPaymentOption}
                          key={
                            "specific-payment-" +
                            get(specificPaymentOption, "value", index)
                          }
                        >
                          <Radio.Button
                            value={get(specificPaymentOption, "value")}
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_IMAGE_HOST}/${get(
                                specificPaymentOption,
                                "img"
                              )}`}
                              alt={get(specificPaymentOption, "name")}
                            />
                            <Paragraph
                              ellipsis={{ rows: 1 }}
                              style={{ marginBottom: 0 }}
                            >
                              {get(specificPaymentOption, "name")}
                            </Paragraph>
                          </Radio.Button>
                        </Col>
                      )
                    )}
                  </Row>
                </Radio.Group>
              </Col>
            </Row>
          ) : null}
        </Fragment>
      ))}
    </Radio.Group>
  );
};

const CartDeliveryAndPayment = (props) => {
  const router = useRouter();
  const { settings } = useWebInstance();
  const {
    cart,
    cartUpdate,
    isLoading,
    createOrder,
    removeContact,
    cartDestroy,
  } = useCart(false, {
    revalidateOnMount: false,
    revalidateOnFocus: false,
  });
  const [orderErrors, setOrderErrors] = useState(null);
  const [deliveryType, setDeliveryType] = useState(
    get(cart, "delivery.id", "")
  );
  const [deliveryTypeGroup, setDeliveryTypeGroup] = useState(
    get(cart, "delivery.group", "")
  );
  const [paymentType, setPaymentType] = useState(get(cart, "payment.id", ""));
  const [specificPaymentType, setSpecificPaymentType] = useState(
    get(cart, "specificPaymentType", "")
  );
  const [note, setNote] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState(false);
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const formProps = {
    initialValues: {
      delivery: get(cart, "delivery.id", ""),
      payment: get(cart, "payment.id", ""),
      specificPaymentType: get(cart, "specificPaymentType", ""),
      termsAndConditions: termsAndConditions,
      privacyPolicy: privacyPolicy,
      note: note,
    },
    validationSchema: yup.object({
      delivery: yup.number().nullable().required("Povinne pole"),
      payment: yup.number().nullable().required("Povinne pole"),
      termsAndConditions: yup
        .bool()
        .oneOf([true], "Musíte súhlasiť s obchodnými podmienkami"),
      privacyPolicy: yup
        .bool()
        .oneOf([true], "Musíte súhlasiť so spracovaním osobných údajov"),
    }),
    onSubmit: (
      values,
      { setFieldError, errors, isValid, setSubmitting, ...other }
    ) => {
      const params = {
        // cookie_client_id: getClientIdFromCookie(),
      };
      setOrderErrors(null);
      createOrder({ ...values, ...{ params: params } }, (response) => {
        response.then(async (order) => {
          if (!isEmpty(order) && get(order, "accessToken")) {
            await removeContact();
            await cartDestroy();
            const paymentUrl = get(order, "paymentUrl");
            if (paymentUrl) {
              window.location.replace(paymentUrl);
            } else {
              window.location.replace(
                `/objednavka/dakujeme?orderToken=${get(order, "accessToken")}`
              );
            }
          } else if (order?.messages) {
            const orderErrors = [];
            forEach(get(order, "messages", []), (error) => {
              if (error?.field) {
                setFieldError(error?.field, error?.message);
              } else {
                orderErrors.push(error?.message);
              }
            });
            setOrderErrors(orderErrors);
            setSubmitting(false);
          }
        });
      });
    },
  };
  React.useEffect(() => {
    setDeliveryTypeGroup(get(cart, "delivery.group", ""));
    setDeliveryType(get(cart, "delivery.id", ""));
    setPaymentType(get(cart, "payment.id", ""));
    setSpecificPaymentType(get(cart, "specificPaymentType", ""));
  }, [cart]);

  React.useEffect(() => {
    TagManager.push(EnhancedEcommerce.checkout(cart, 3));
  }, []);

  return (
    <div className={"container guttered"}>
      <Steps current={3} />
      <Divider />
      <Formik {...formProps}>
        {({
          handleSubmit,
          values,
          errors,
          isValid,
          isSubmitting,
          touched,
          dirty,
          handleChange,
          handleBlur,
        }) => (
          <Form
            wrapperCol={{ span: 24 }}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card
                      title="Doprava"
                      loading={isLoading}
                      className={styles?.secondaryCard}
                    >
                      <DeliveryForm
                        deliveryOptions={get(cart, "deliveryOptions", [])}
                        setDeliveryType={setDeliveryType}
                        deliveryType={deliveryType}
                        deliveryTypeGroup={deliveryTypeGroup}
                        setDeliveryTypeGroup={setDeliveryTypeGroup}
                        cartUpdate={cartUpdate}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card
                      title="Spôsob platby"
                      loading={isLoading}
                      className={styles?.secondaryCard}
                    >
                      <PaymentForm
                        paymentOptions={get(cart, "delivery.payments", [])}
                        paymentType={paymentType}
                        specificPaymentType={specificPaymentType}
                        setPaymentType={setPaymentType}
                        setSpecificPaymentType={setSpecificPaymentType}
                        cartUpdate={cartUpdate}
                      />
                    </Card>
                  </Col>
                </Row>
                <Row gutter={[16, 16]}>
                  <Col span={24}>
                    <TextArea
                      id="note"
                      name="note"
                      value={get(values, "note")}
                      placeholder={"vložte poznámku"}
                      disabled={isSubmitting}
                      onBlur={(e) => {
                        setNote(e.target.value);
                        handleBlur(e);
                      }}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
              </Col>

              <Col xs={24} lg={8}>
                <CartSummary
                  simple={true}
                  actions={[
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <Button
                        loading={isValid && isSubmitting}
                        disabled={!dirty || !isValid}
                        size={"large"}
                        type={"primary"}
                        htmlType={"submit"}
                      >
                        {isValid && isSubmitting
                          ? "Odosielam objednávku"
                          : "Dokončiť objednávku"}
                      </Button>
                      <Link href="/kosik/kontakt" as={`/kosik/kontakt`}>
                        <Button
                          type={"text"}
                          icon={<ArrowLeftOutlined />}
                          style={{ marginTop: "15px" }}
                        >
                          späť na kontaktné údaje
                        </Button>
                      </Link>
                    </div>,
                  ]}
                >
                  {!isEmpty(orderErrors) ? (
                    <>
                      <Divider />
                      {map(orderErrors, (error, index) => (
                        <Alert
                          key={`order-error-${index}`}
                          type="error"
                          message={error}
                        />
                      ))}
                    </>
                  ) : null}

                  <Divider />

                  <Form.Item
                    valuePropName="checked"
                    className={styles?.agreementCheckboxWrapper}
                    name="privacyPolicy"
                    validateStatus={
                      touched?.privacyPolicy && errors?.privacyPolicy
                        ? "error"
                        : ""
                    }
                    help={
                      touched?.privacyPolicy && errors?.privacyPolicy
                        ? errors?.privacyPolicy
                        : ""
                    }
                  >
                    <Checkbox
                      className={styles?.agreementCheckbox}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        handleChange(e);
                        setPrivacyPolicy(e.target.checked);
                      }}
                    >
                      Súhlasím so spracovaním osobných údajov
                    </Checkbox>
                  </Form.Item>
                  <Form.Item
                    valuePropName="checked"
                    className={styles?.agreementCheckboxWrapper}
                    name="termsAndConditions"
                    validateStatus={
                      touched?.termsAndConditions && errors?.termsAndConditions
                        ? "error"
                        : ""
                    }
                    help={
                      touched?.termsAndConditions && errors?.termsAndConditions
                        ? errors?.termsAndConditions
                        : ""
                    }
                  >
                    <Checkbox
                      className={styles?.agreementCheckbox}
                      disabled={isSubmitting}
                      onChange={(e) => {
                        handleChange(e);
                        setTermsAndConditions(e.target.checked);
                      }}
                    >
                      Súhlasím s{" "}
                      <Link
                        href={get(settings, "terms_and_conditions_link", "")}
                        passHref
                      >
                        <a target="_blank">obchodnými podmienkami</a>
                      </Link>
                    </Checkbox>
                  </Form.Item>
                </CartSummary>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default CartDeliveryAndPayment;
