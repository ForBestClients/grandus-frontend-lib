import { Form, Input } from 'antd';
import parsePhoneNumberFromString from 'libphonenumber-js';
import { get } from 'lodash';

const PhoneInput = (props) => {
    const {
      name: fieldName,
      label,
      touched,
      values,
      errors,
      handleBlur,
      handleChange,
      addonAfter,
      addonBefore,
      allowClear = false,
      disabled = false,
      validateStatus = '',
      help = null,
      setFieldTouched,
      setFieldValue
    } = props;

    const phoneNumber = parsePhoneNumberFromString(values[fieldName]);
    const value = phoneNumber ? phoneNumber.number : values[fieldName];

    const onPhoneNumberChange = (e) => {
      const { name, value } = e.target;
      const phoneNumber = parsePhoneNumberFromString(value);
      const newValue = phoneNumber ? phoneNumber.number : value;
      setFieldValue(name, newValue);
      if (!touched[name]) setFieldTouched(name);
    }

    return (
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
        <Input
          id={fieldName}
          name={fieldName}
          value={value}
          placeholder={label}
          onChange={onPhoneNumberChange}
          onBlur={handleBlur}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          allowClear={allowClear}
          disabled={disabled}
        />
      </Form.Item>
    );
  };
  

  export default PhoneInput;