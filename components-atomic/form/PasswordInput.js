import { Form, Input } from 'antd';
import { get } from 'lodash';
import FloatLabel from "./label/FloatLabel";

const PasswordInput = (props) => {
    const {
      name: fieldName,
      label,
      touched,
      values,
      errors,
      handleBlur,
      handleChange,
    } = props;
    return (
      <Form.Item
        validateStatus={
          get(touched, fieldName)
            ? get(errors, fieldName)
              ? "error"
              : "success"
            : null
        }
        hasFeedback={get(touched, fieldName)}
        help={
          get(touched, fieldName) && get(errors, fieldName)
            ? get(errors, fieldName)
            : null
        }
      >
        <FloatLabel label={label} name={fieldName} value={values[fieldName]}>
          <Input.Password
            id={fieldName}
            name={fieldName}
            value={values[fieldName]}
            onChange={handleChange}
            onBlur={handleBlur}
          />
        </FloatLabel>
      </Form.Item>
    );
  };
  

  export default PasswordInput;