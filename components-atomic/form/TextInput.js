import { Form, Input } from "antd";
import { get } from "lodash";
import FloatLabel from "./label/FloatLabel";

const TextInput = (props) => {
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
    validateStatus = "",
    help = null,
  } = props;
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
      <FloatLabel label={label} name={fieldName} value={values[fieldName]}>
        <Input
          id={fieldName}
          name={fieldName}
          value={values[fieldName]}
          onChange={handleChange}
          onBlur={handleBlur}
          addonAfter={addonAfter}
          addonBefore={addonBefore}
          allowClear={allowClear}
          disabled={disabled}
        />
      </FloatLabel>
    </Form.Item>
  );
};

export default TextInput;
