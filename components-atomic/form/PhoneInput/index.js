import PhoneInputComponent, { parsePhoneNumber } from "react-phone-number-input";
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

  const [value, setValue] = React.useState(null);

  React.useEffect(() => {
    const phoneNumber = parsePhoneNumber(
      !isEmpty(values[fieldName]) ? values[fieldName] : ""
    );
    setValue(phoneNumber ? phoneNumber.number : values[fieldName]);
  }, [values[fieldName]])

  const onPhoneNumberChange = (value) => {
    let phoneNumber = null;
    if (value) {
      phoneNumber = parsePhoneNumber(value);
    }
    const newValue = phoneNumber ? phoneNumber.number : value;
    setValue(newValue);
  };

  const onPhoneNumberBlur = (e) => {
    setFieldValue(fieldName, value);
    if (!touched[fieldName]) setFieldTouched(fieldName);
    handleBlur(e);
  }

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
        <FloatLabel label={label} name={fieldName} value={value}>
          <PhoneInputComponent
            id={fieldName}
            name={fieldName}
            defaultCountry={defaultCountry}
            value={value}
            // international
            withCountryCallingCode
            countryCallingCodeEditable={false}
            onChange={onPhoneNumberChange}
            onBlur={onPhoneNumberBlur}
            error={errors[fieldName]}
          />
        </FloatLabel>
      </Form.Item>
    </div>
  );
};

export default PhoneInput;
