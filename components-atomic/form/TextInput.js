import { Form, Input } from 'antd';
import { get } from 'lodash';

const TextInput = (props) => {
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
        <Input
          id={fieldName}
          name={fieldName}
          value={values[fieldName]}
          placeholder={label}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Form.Item>
    );
  };
  

  export default TextInput;