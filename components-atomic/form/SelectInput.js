import { Form, Select } from "antd";
import { deburredSearch } from "grandus-lib/utils";
import { get, isFunction, map } from "lodash";
import FloatLabel from "./label/FloatLabel";

const SelectInput = (props) => {
  const {
    name: fieldName,
    label,
    touched,
    values,
    errors,
    onBlur,
    onChange,
    options = [],
    allowClear = false,
    disabled = false,
    validateStatus = "",
    help = null,
    showSearch,
    virtual = true,
    onSelect,
    dropdownRender,
    autoComplete = "off",
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
        <Select
          showSearch={showSearch}
          id={fieldName}
          name={fieldName}
          value={values[fieldName]}
          disabled={disabled}
          allowClear={allowClear}
          virtual={virtual}
          dropdownRender={dropdownRender}
          autoComplete={autoComplete}
          onChange={(val) => {
            if (isFunction(onChange)) {
              onChange(val);
            }
          }}
          onSelect={(val) => {
            if (isFunction(onSelect)) {
              onSelect(val);
            }
          }}
          onBlur={() => {
            if (isFunction(onBlur)) {
              onBlur();
            }
          }}
          filterOption={(inputValue, option) => {
            return deburredSearch(get(option, "children"), inputValue);
          }}
        >
          {map(options, (option, index) => (
            <Select.Option
              value={get(option, "value")}
              key={`${fieldName}-option-${index}`}
            >
              {get(option, "label")}
            </Select.Option>
          ))}
        </Select>
      </FloatLabel>
    </Form.Item>
  );
};

export default SelectInput;
