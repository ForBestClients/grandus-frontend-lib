import parsePhoneNumberFromString from "libphonenumber-js";
import PhoneInputComponent from "react-phone-number-input";
import { Form } from "antd";
import { get, isEmpty } from "lodash";

import FloatLabel from "grandus-lib/components-atomic/form/label/FloatLabel";

import "react-phone-number-input/style.css";
import styles from "grandus-lib/components-atomic/form/PhoneInput/PhoneInput.module.scss";

const PhoneInput = (props) => {
  const {
    name: fieldName,
    label,
    touched,
    values,
    errors,
    handleBlur,
    defaultCountry = "SK",
    validateStatus = "default",
    help = null,
    setFieldTouched,
    setFieldValue,
  } = props;

  const phoneNumber = parsePhoneNumberFromString(
    !isEmpty(values[fieldName]) ? values[fieldName] : ""
  );
  const value = phoneNumber ? phoneNumber.number : values[fieldName];

  const onPhoneNumberChange = (value) => {
    let phoneNumber = null;
    if (value) {
      phoneNumber = parsePhoneNumberFromString(value);
    }
    const newValue = phoneNumber ? phoneNumber.number : value;

    setFieldValue(fieldName, newValue);
    if (!touched[fieldName]) setFieldTouched(fieldName);
  };

  return (
    <div className={`${styles?.phoneInput} phone-input-component `}>
      <Form.Item
        validateStatus={
          get(touched, fieldName)
            ? get(errors, fieldName)
              ? "error"
              : validateStatus
            : null
        }
        hasFeedback={get(touched, fieldName)}
        help={
          get(touched, fieldName) && get(errors, fieldName)
            ? get(errors, fieldName)
            : help
        }
      >
        <FloatLabel label={label} name={fieldName} value={values[fieldName]}>
          <PhoneInputComponent
            id={fieldName}
            name={fieldName}
            country={defaultCountry}
            value={value}
            withCountryCallingCode
            onChange={onPhoneNumberChange}
            onBlur={handleBlur}
            error={errors[fieldName]}
          />
        </FloatLabel>
      </Form.Item>
    </div>
  );
};

export default PhoneInput;
