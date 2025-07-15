"use client";
import yup from "grandus-lib/utils/validator";
import { useFormikContext, Formik } from "formik";
import parsePhoneNumberFromString from "libphonenumber-js";
import { get, map, isEmpty, parseInt, toNumber, first } from "lodash";
import { deburredSearch, scrollToTop } from "grandus-lib/utils";
import useWebInstance from "grandus-lib/hooks/useWebInstance";
import { checkoutContactPage } from "grandus-lib/utils/fetches";
import {
  ArrowLeftOutlined,
  FrownOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import EnhancedEcommerce from "grandus-lib/utils/ecommerce";
import TagManager from "grandus-lib/utils/gtag";

import Link from "next/link";
import LoginForm from "components/forms/Login";
import RegisterForm from "components/forms/Register";
import CartSummary from "components/cart/summary/CartSummary";
import TextInput from "grandus-lib/components-atomic/form/TextInput";
import PhoneInput from "grandus-lib/components-atomic/form/PhoneInput";

import {
  Form,
  Select,
  Button,
  Row,
  Col,
  Card,
  Checkbox,
  Alert,
  Result,
} from "antd";
import Steps from "components/cart/steps/CartSteps";
import useCart from "grandus-lib/hooks/useCart";
import useUser from "grandus-lib/hooks/useUser";
import { useRouter } from "next/router";
import { CART_CONTACT_CONSTANT } from "grandus-lib/constants/SessionConstants";
import {
  LETTERS_ONLY_REGEX,
  BUSINESS_ID_REGEX,
  VAT_ID_REGEX,
  VAT_NUMBER_REGEX,
  ZIP_REGEX,
  STREET_REGEX,
} from "grandus-lib/constants/ValidatorConstants";
import { useState, useRef, useEffect } from "react";
import {formatCart} from "grandus-lib/utils/helperFunctions";
const { Option } = Select;

const authSectionContentList = {
  login: <LoginForm showRegister={false} />,
  register: <RegisterForm />,
};

const CartContact = (props) => {
  const { countries, towns = [], contact } = props;
  const { settings } = useWebInstance();
  const [authSectionActiveTab, toggleAuthSectionActiveTab] = useState("login");
  const [authSectionVisible, toggleAuthSection] = useState(false);
  const { cart, cartUpdate, saveContact, isLoading } = useCart();
  const { user, isLoading: isLoadingUser } = useUser();
  const router = useRouter();
  const formRef = useRef();

  const getDefaultCountryValue = (attribute = "countryId") => {
    let countryId = get(contact, attribute, null);
    if (!countryId) {
      countryId = get(user, ["attributes", attribute]);
    }
    if (!countryId) {
      countryId = get(settings, "default_delivery_country");
    }
    if (!countryId) {
      countryId = get(first(countries), "id");
    }

    return toNumber(countryId);
  };
  const formProps = {
    enableReinitialize: true,
    initialValues: {
      firstname: get(contact, "firstname", get(user, "attributes.name", "")),
      surname: get(contact, "surname", get(user, "attributes.surname", "")),
      street: get(contact, "street", get(user, "attributes.street", "")),
      city: get(contact, "city", get(user, "attributes.city", "")),
      zip: get(contact, "zip", get(user, "attributes.zip", "")),
      phoneCountryCode: get(contact, "phoneCountryCode", ""),
      phone: get(contact, "phone", get(user, "attributes.phone", "")),
      email: get(contact, "email", get(user, "attributes.email", "")),
      countryId: getDefaultCountryValue(),
      isCompany: get(contact, "isCompany", false),
      companyName: get(
        contact,
        "companyName",
        get(user, "attributes.CompanyName", "")
      ),
      ico: get(contact, "ico", get(user, "attributes.ico", "")),
      dic: get(contact, "dic", get(user, "attributes.dic", "")),
      icDPH: get(contact, "icDPH", get(user, "attributes.icDPH", "")),
      createAccount: get(contact, "createAccount", false),
      password: get(contact, "password", ""),
      passwordConfirm: get(contact, "passwordConfirm", ""),
      isDifferentDeliveryAddress: get(
        contact,
        "isDifferentDeliveryAddress",
        false
      ),
      deliveryName: get(contact, "deliveryName", ""),
      deliverySurname: get(contact, "deliverySurname", ""),
      deliveryStreet: get(contact, "deliveryStreet", ""),
      deliveryCity: get(contact, "deliveryCity", ""),
      deliveryZip: get(contact, "deliveryZip", ""),
      deliveryPhoneCountryCode: get(contact, "deliveryPhoneCountryCode", ""),
      deliveryPhone: get(contact, "deliveryPhone", ""),
      deliveryEmail: get(contact, "deliveryEmail", ""),
      deliveryCountryId: getDefaultCountryValue("deliveryCountryId"),
    },
    validationSchema: yup.object({
      firstname: yup
        .string()
        .trim()
        .nullable()
        .matches(LETTERS_ONLY_REGEX, {
          excludeEmptyString: true,
          message: "Meno musí obsahovať iba písmená",
        })
        .min(2, "Meno musí obsahovať minimálne 2 znaky")
        .required("Povinné pole"),
      surname: yup
        .string()
        .trim()
        .nullable()
        .matches(LETTERS_ONLY_REGEX, {
          excludeEmptyString: true,
          message: "Priezvisko musí obsahovať iba písmená",
        })
        .min(2, "Priezvisko musí obsahovať minimálne 2 znaky")
        .required("Povinné pole"),
      street: yup
        .string()
        .nullable()
        .matches(STREET_REGEX, {
          excludeEmptyString: true,
          message: "Ulica musí obsahovať aj popisné číslo (príklad: Nová 1/A)",
        })
        .trim()
        .required("Povinné pole"),
      city: yup
        .string()
        .nullable()
        .matches(LETTERS_ONLY_REGEX, {
          excludeEmptyString: true,
          message: "Mesto musí obsahovať iba písmená",
        })
        .trim()
        .required("Povinné pole"),
      zip: yup
        .string()
        .nullable()
        .trim()
        .required("Povinné pole")
        .matches(ZIP_REGEX, "Nesprávny tvar PSČ. Zadajte v tvare XXX XX."),
      phone: yup
        .string()
        .nullable()
        .trim()
        .required("Povinné pole")
        .validatePhoneNumber(
          "Zadané telefónne číslo nie je v správnom formáte. Zadajte číslo vo formáte +421 (0)901 XXX XXX"
        ),
      email: yup
        .string()
        .nullable()
        .email("Zadajte email vo formáte meno@domena.tld")
        .required("Povinné pole"),
      countryId: yup.number().nullable().required("Povinné pole"),
      createAccount: yup.bool(),
      password: yup
        .string()
        .nullable()
        .when("createAccount", {
          is: true,
          then: yup
            .string()
            .min(6, "Heslo musí byť dlhšie ako 6 znakov.")
            .required("Povinné pole"),
        }),
      passwordConfirm: yup
        .string()
        .nullable()
        .when("createAccount", {
          is: true,
          then: yup
            .string()
            .oneOf([yup.ref("password"), null], "Heslá sa nezhodujú")
            .required("Povinné pole"),
        }),
      isCompany: yup.bool(),
      companyName: yup
        .string()
        .nullable()
        .when("isCompany", {
          is: true,
          then: yup.string().required("Povinné pole"),
        }),
      ico: yup
        .string()
        .nullable()
        .when("isCompany", {
          is: true,
          then: yup
            .string()
            .required("Povinné pole")
            .matches(BUSINESS_ID_REGEX, {
              excludeEmptyString: true,
              message: "Nesprávny tvar",
            })
            .trim(),
        }),
      dic: yup
        .string()
        .nullable()
        .matches(VAT_ID_REGEX, {
          excludeEmptyString: true,
          message: "Nesprávny tvar",
        })
        .trim(),
      icDPH: yup
        .string()
        .nullable()
        .matches(VAT_NUMBER_REGEX, {
          excludeEmptyString: true,
          message: "Nesprávny tvar",
        })
        .trim(),
      isDifferentDeliveryAddress: yup.bool(),
      deliveryName: yup
        .string()
        .trim()
        .nullable()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup
            .string()
            .matches(LETTERS_ONLY_REGEX, {
              excludeEmptyString: true,
              message: "Meno musí obsahovať iba písmená",
            })
            .min(2, "Meno musí obsahovať minimálne 2 znaky")
            .required("Povinné pole"),
        }),
      deliverySurname: yup
        .string()
        .trim()
        .nullable()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup
            .string()
            .matches(LETTERS_ONLY_REGEX, {
              excludeEmptyString: true,
              message: "Priezvisko musí obsahovať iba písmená",
            })
            .min(2, "Priezvisko musí obsahovať minimálne 2 znaky")
            .required("Povinné pole"),
        }),
      deliveryStreet: yup
        .string()
        .nullable()
        .matches(STREET_REGEX, {
          excludeEmptyString: true,
          message:
            "Doručovacia ulica musí obsahovať aj popisné číslo (príklad: Nová 1/B)",
        })
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup.string().required("Povinné pole"),
        }),
      deliveryCity: yup
        .string()
        .nullable()
        .trim()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup
            .string()
            .nullable()
            .matches(LETTERS_ONLY_REGEX, {
              excludeEmptyString: true,
              message: "Mesto musí obsahovať iba písmená",
            })
            .required("Povinné pole"),
        }),
      deliveryZip: yup
        .string()
        .nullable()
        .trim()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup
            .string()
            .required("Povinné pole")
            .matches(ZIP_REGEX, "Nesprávny tvar PSČ. Zadajte v tvare XXX XX."),
        }),
      deliveryPhone: yup
        .string()
        .nullable()
        .trim()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup
            .string()
            .required("Povinné pole")
            .validatePhoneNumber(
              "Zadané telefónne číslo nie je v správnom formáte. Zadajte číslo vo formáte +421 (0)901 XXX XXX"
            ),
        }),
      deliveryEmail: yup
        .string()
        .nullable()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup
            .string()
            .email("Zadajte email vo formáte name@domain.com")
            .required("Povinné pole"),
        }),
      deliveryCountryId: yup
        .number()
        .nullable()
        .when("isDifferentDeliveryAddress", {
          is: true,
          then: yup.number().required("Povinné pole"),
        }),
    }),
    onSubmit: (values, { errors }) => {
      const phoneNumber = parsePhoneNumberFromString(
        !isEmpty(values?.phone) ? values?.phone : ""
      );

      if (phoneNumber) {
        values.phoneCountryCode = phoneNumber?.countryCallingCode || "";
      }

      const deliveryPhoneNumber = parsePhoneNumberFromString(
        !isEmpty(values?.deliveryPhone) ? values?.deliveryPhone : ""
      );

      if (deliveryPhoneNumber) {
        values.deliveryPhoneCountryCode =
          deliveryPhoneNumber?.countryCallingCode || "";
      }

      saveContact(values, (savedValues) => {
        const countryId = get(savedValues, "countryId");
        const deliveryCountryId = get(savedValues, "deliveryCountryId");
        const city = get(savedValues, "city");
        const deliveryCity = get(savedValues, "deliveryCity");
        const reqData = {
          countryId,
          city,
        };
        if (savedValues["isDifferentDeliveryAddress"]) {
          reqData.countryId = deliveryCountryId;
          reqData.city = deliveryCity;
        }
        cartUpdate(reqData, () =>
          router.push("/kosik/doprava-a-platba").then(() => scrollToTop())
        );
      });
    },
  };
  useEffect(() => {
    TagManager.push(EnhancedEcommerce.checkout(cart, 2));
    TagManager.push(EnhancedEcommerce.begin_checkout(formatCart(cart)));
  }, []);

  const [isInViewport, setIsInViewport] = useState(false);
  const buttonRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(!entry.isIntersecting);
      },
      {
        root: null,
        threshold: 0,
      }
    );
    if (buttonRef.current) {
      observer.observe(buttonRef.current);
    }
    return () => {
      if (buttonRef.current) {
        observer.unobserve(buttonRef.current);
      }
    };
  }, [buttonRef]);

  if (isEmpty(get(cart, "items", [])) && isLoading) {
    return (
      <div className={"container guttered"}>
        <Result
          icon={<LoadingOutlined />}
          title="Nákupný košík"
          subTitle="Nahrávam nákupný košík"
        />
      </div>
    );
  }

  if (isEmpty(get(cart, "items", [])) && !isLoading) {
    return (
      <div className={"container guttered"}>
        <Result
          icon={<FrownOutlined />}
          title="Prázdny nákupný košík"
          subTitle="Vo Vašom nákupnom košíku sa nenachádzajú žiadne produkty. V prípade, že ste sa sem vrátili z platobnej brány, tak vaša objednavka už bola úspešne zaznamenaná a bude Vám doručný potvrdzujúci email."
          extra={
            <Link href="/" as="/">
              <Button type="primary">Pokračovať na domovskú stránku</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className={"container guttered"}>
      <Row gutter={[{ xs: 0, sm: 15 }, 15]}>
        <Col xs={24}>
          <Steps current={2} />
        </Col>
        <Col xs={24} md={12}>
          {isEmpty(user) ? (
            <Card
              loading={isLoadingUser}
              title="Máte už u nás účet?"
              extra={
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    toggleAuthSection(!authSectionVisible);
                  }}
                >
                  Prihláste sa/Registrujte sa
                </a>
              }
              style={{ marginBottom: "15px" }}
              bodyStyle={{ padding: !authSectionVisible ? 0 : "1px 0" }}
            >
              {authSectionVisible ? (
                <Card
                  style={{ width: "100%" }}
                  bordered={false}
                  tabList={[
                    {
                      key: "login",
                      tab: "Prihlásenie",
                    },
                    {
                      key: "register",
                      tab: "Registrácia",
                    },
                  ]}
                  activeTabKey={authSectionActiveTab}
                  onTabChange={(key) => {
                    toggleAuthSectionActiveTab(key);
                  }}
                >
                  {authSectionContentList[authSectionActiveTab]}
                </Card>
              ) : null}
            </Card>
          ) : (
            <Card
              loading={isLoadingUser}
              title={`Objednávate ako ${
                user?.fullName ? user?.fullName : user?.email
              }`}
              style={{ marginBottom: "15px" }}
              extra={
                <Link href={"/ucet/profil"} legacyBehavior>
                  <a>
                  Profil
                  </a>
                </Link>
              }
            >
              <Alert
                message={
                  <span>
                    Ste prihlásený ako{" "}
                    <b>{user?.fullName ? user?.fullName : user?.email}</b>
                  </span>
                }
                description="Uskutočnená objednávka bude automaticky pridelená pod Vaše konto. Kontaktné informácie pre objednávku boli prebrané z konta, môžte ich v prípade potreby zmeniť nižšie."
                type="success"
              />
            </Card>
          )}

          <Card title="Kontaktné informácie">
            <Formik {...formProps} innerRef={formRef}>
              <ContactForm countries={countries} towns={towns} user={user} />
            </Formik>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <CartSummary
            actions={[
              <Link href="/kosik" as={`/kosik`}>
                <Button ref={buttonRef} type={"text"} icon={<ArrowLeftOutlined />}>
                  späť do košíka
                </Button>
              </Link>,
              <Button
                loading={formRef?.current?.isSubmitting}
                size={"large"}
                onClick={() => formRef?.current?.handleSubmit()}
                type={"primary"}
                className={isInViewport  ? "afixed-cart-btn" : ""}
              >
                {formRef?.current?.isSubmitting
                  ? "Spracovávam zadané údaje"
                  : "Pokračovať k výberu dopravy"}
              </Button>,
            ]}
          />
        </Col>
      </Row>
    </div>
  );
};

const ContactForm = ({ countries, towns = [], user }) => {
  const {
    values,
    touched,
    errors,
    setFieldValue,
    setFieldTouched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
  } = useFormikContext();

  const { settings } = useWebInstance();
  const [createAccount, setCreateAccount] = useState(
    get(values, "createAccount")
  );
  const [isCompany, setIsCompany] = useState(get(values, "isCompany"));
  const [isDifferentDeliveryAddress, setIsDifferentDeliveryAddress] = useState(
    get(values, "isDifferentDeliveryAddress")
  );

  const onIsCompanyChange = () => {
    const newIsCompany = !isCompany;
    setIsCompany(newIsCompany);
    setFieldValue("isCompany", newIsCompany);
    setFieldTouched("isCompany");
  };

  const onIsDifferentDeliveryAddressChange = () => {
    const newIsDifferentDeliveryAddress = !isDifferentDeliveryAddress;
    setIsDifferentDeliveryAddress(newIsDifferentDeliveryAddress);
    setFieldValue("isDifferentDeliveryAddress", newIsDifferentDeliveryAddress);
    setFieldTouched("isDifferentDeliveryAddress");
  };

  const onCreateAccountChange = () => {
    const newCreateAccount = !createAccount;
    setCreateAccount(newCreateAccount);
    setFieldValue("createAccount", newCreateAccount);
    setFieldTouched("createAccount");
  };

  return (
    <Form wrapperCol={{ span: 24 }} layout="vertical" onFinish={handleSubmit}>
      <Row
        gutter={[
          { xs: 0, sm: 8 },
          { xs: 0, sm: 8 },
        ]}
      >
        <Col xs={24} md={12}>
          <TextInput
            label="Meno"
            name="firstname"
            values={values}
            touched={touched}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            autoComplete="fname"
          />
        </Col>
        <Col xs={24} md={12}>
          <TextInput
            label="Priezvisko"
            name="surname"
            values={values}
            touched={touched}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            autoComplete="lname"
          />
        </Col>
      </Row>
      <Row
        gutter={[
          { xs: 0, sm: 8 },
          { xs: 0, sm: 8 },
        ]}
      >
        <Col xs={24} md={12}>
          <PhoneInput
            label="Telefón"
            name="phone"
            values={values}
            touched={touched}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            help="Zadajte číslo vo formáte +421 (0)901 XXX XXX"
            setFieldValue={setFieldValue}
            setFieldTouched={setFieldTouched}
            validateStatus="default"
            autoComplete="tel"
          />
        </Col>
        <Col xs={24} md={12}>
          <TextInput
            label="Email"
            name="email"
            values={values}
            touched={touched}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            autoComplete="email"
          />
        </Col>
      </Row>
      <Row
        gutter={[
          { xs: 0, sm: 8 },
          { xs: 0, sm: 8 },
        ]}
      >
        <Col xs={24}>
          <TextInput
            label="Ulica"
            name="street"
            values={values}
            touched={touched}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            autoComplete="shipping street-address"
          />
        </Col>
      </Row>
      <Row
        gutter={[
          { xs: 0, sm: 8 },
          { xs: 0, sm: 8 },
        ]}
      >
        <Col xs={24} md={12}>
          {parseInt(get(settings, "themeIsStrictTownsEnabled"), 10) ? (
            <Form.Item
              validateStatus={
                get(touched, "city")
                  ? get(errors, "city")
                    ? "error"
                    : "success"
                  : null
              }
              hasFeedback={get(touched, "city")}
              autoComplete="off"
              help={
                get(touched, "city") && get(errors, "city")
                  ? get(errors, "city")
                  : null
              }
            >
              <Select
                showSearch
                id={"city"}
                name={"city"}
                value={values["city"] || undefined}
                placeholder="Mesto"
                autoComplete="dontshow"
                onChange={(val) => {
                  setFieldValue("city", val);
                }}
                onBlur={() => {
                  setFieldTouched("city");
                }}
                filterOption={(inputValue, option) => {
                  return deburredSearch(get(option, "children"), inputValue);
                }}
              >
                {map(towns ? towns : [], (town, index) => (
                  <Option
                    value={get(town, "name")}
                    key={"country-" + get(town, "id", index)}
                  >
                    {get(town, "name")}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <TextInput
              label="Mesto"
              name="city"
              values={values}
              touched={touched}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              autoComplete="shipping address-level2"
            />
          )}
        </Col>
        <Col xs={24} md={12}>
          <TextInput
            label="PSČ"
            name="zip"
            values={values}
            touched={touched}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            autoComplete="shipping postal-code"
          />
        </Col>
      </Row>
      <Form.Item
        validateStatus={
          get(touched, "countryId")
            ? get(errors, "countryId")
              ? "error"
              : "success"
            : null
        }
        hasFeedback={get(touched, "countryId")}
        help={
          get(touched, "countryId") && get(errors, "countryId")
            ? get(errors, "countryId")
            : null
        }
      >
        <Select
          showSearch
          id={"countryId"}
          name={"countryId"}
          value={values["countryId"] ? values["countryId"] : undefined}
          placeholder={"Krajina"}
          autoComplete="dontshow"
          onChange={(val) => {
            setFieldValue("countryId", val);
          }}
          onBlur={() => {
            setFieldTouched("countryId");
          }}
          filterOption={(inputValue, option) => {
            return deburredSearch(get(option, "children"), inputValue);
          }}
        >
          {map(countries, (country, index) => (
            <Option
              value={get(country, "id")}
              key={"country-" + get(country, "id", index)}
            >
              {get(country, "name")}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Row gutter={[15, 15]}>
        <Col span={24}>
          <Checkbox
            onChange={onIsCompanyChange}
            name="isCompany"
            checked={isCompany}
          >
            Pridať firemné údaje
          </Checkbox>
        </Col>
        {isCompany ? (
          <Col span={24}>
            <Row gutter={15}>
              <Col xs={24} md={12}>
                <TextInput
                  label="Nazov firmy"
                  name="companyName"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
              <Col xs={24} md={12}>
                <TextInput
                  label="ICO"
                  name="ico"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
            </Row>
            <Row gutter={15}>
              <Col xs={24} md={12}>
                <TextInput
                  label="DIC"
                  name="dic"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
              <Col xs={24} md={12}>
                <TextInput
                  label="IC DPH"
                  name="icDPH"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
            </Row>
          </Col>
        ) : null}
      </Row>
      <Row gutter={[15, 15]}>
        <Col span={24}>
          <Checkbox
            onChange={onIsDifferentDeliveryAddressChange}
            name="isDifferentDeliveryAddress"
            checked={isDifferentDeliveryAddress}
          >
            Iná adresa doručenia
          </Checkbox>
        </Col>
        {isDifferentDeliveryAddress ? (
          <Col span={24}>
            <Row gutter={15}>
              <Col xs={24} md={12}>
                <TextInput
                  label="Meno"
                  name="deliveryName"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
              <Col xs={24} md={12}>
                <TextInput
                  label="Priezvisko"
                  name="deliverySurname"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
            </Row>
            <Row gutter={15}>
              <Col xs={24} md={12}>
                <PhoneInput
                  label="Telefón"
                  name="deliveryPhone"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  help="Zadajte číslo vo formáte +421 (0)901 XXX XXX"
                  setFieldValue={setFieldValue}
                  setFieldTouched={setFieldTouched}
                />
              </Col>
              <Col xs={24} md={12}>
                <TextInput
                  label="Email"
                  name="deliveryEmail"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
            </Row>
            <TextInput
              label="Ulica"
              name="deliveryStreet"
              values={values}
              touched={touched}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
            <Row gutter={15}>
              <Col xs={24} md={12}>
                {parseInt(get(settings, "themeIsStrictTownsEnabled"), 10) ? (
                  <Form.Item
                    validateStatus={
                      get(touched, "deliveryCity")
                        ? get(errors, "deliveryCity")
                          ? "error"
                          : "success"
                        : null
                    }
                    hasFeedback={get(touched, "deliveryCity")}
                    help={
                      get(touched, "deliveryCity") &&
                      get(errors, "deliveryCity")
                        ? get(errors, "deliveryCity")
                        : null
                    }
                  >
                    <Select
                      showSearch
                      id={"deliveryCity"}
                      name={"deliveryCity"}
                      value={values["deliveryCity"]}
                      placeholder={"Mesto"}
                      onChange={(val) => {
                        setFieldValue("deliveryCity", val);
                      }}
                      onBlur={() => {
                        setFieldTouched("deliveryCity");
                      }}
                      filterOption={(inputValue, option) => {
                        return deburredSearch(
                          get(option, "children"),
                          inputValue
                        );
                      }}
                    >
                      {map(towns ? towns : [], (town, index) => (
                        <Option
                          value={get(town, "name")}
                          key={"delivery-city-" + get(town, "id", index)}
                        >
                          {get(town, "name")}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                ) : (
                  <TextInput
                    label="Mesto"
                    name="deliveryCity"
                    values={values}
                    touched={touched}
                    errors={errors}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                )}
              </Col>
              <Col xs={24} md={12}>
                <TextInput
                  label="PSČ"
                  name="deliveryZip"
                  values={values}
                  touched={touched}
                  errors={errors}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                />
              </Col>
            </Row>
            <Form.Item
              validateStatus={
                get(touched, "deliveryCountryId")
                  ? get(errors, "deliveryCountryId")
                    ? "error"
                    : "success"
                  : null
              }
              hasFeedback={get(touched, "deliveryCountryId")}
              help={
                get(touched, "deliveryCountryId") &&
                get(errors, "deliveryCountryId")
                  ? get(errors, "deliveryCountryId")
                  : null
              }
            >
              <Select
                showSearch
                id={"deliveryCountryId"}
                name={"deliveryCountryId"}
                value={
                  values["deliveryCountryId"]
                    ? values["deliveryCountryId"]
                    : undefined
                }
                placeholder={"Krajina"}
                onChange={(val) => {
                  setFieldValue("deliveryCountryId", val);
                }}
                onBlur={() => {
                  setFieldTouched("deliveryCountryId");
                }}
                filterOption={(inputValue, option) => {
                  return deburredSearch(get(option, "children"), inputValue);
                }}
              >
                {map(countries, (country, index) => (
                  <Option
                    value={get(country, "id")}
                    key={"country-" + get(country, "id", index)}
                  >
                    {get(country, "name")}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        ) : null}
      </Row>
    </Form>
  );
};

export const getServerSideProps = async (context) => {
  const { req } = context;
  const contact = req.session.get(CART_CONTACT_CONSTANT);
  const checkoutContactPageProps = await checkoutContactPage.serverSideProps(
    context
  );
  return {
    props: {
      ...{ contact: contact ? JSON.parse(contact) : null },
      ...get(checkoutContactPageProps, "props"),
    },
  };
};

export default CartContact;
