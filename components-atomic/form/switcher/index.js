import { get, find, first, isEmpty, map } from "lodash";

import styles from "./switcher.module.scss";

const Switcher = ({
  defaultValue,
  setFieldValue,
  setFieldTouched,
  inputName,
  options = {},
  onChange = null,
  disabled = false,
  error,
  inputSize = "normal",
}) => {
  const [selectedValue, setSelectedValue] = React.useState("");
  const onClick = (selectedValue) => (e) => {
    e.preventDefault();
    if (disabled) {
      return null;
    }
    setSelectedValue(selectedValue);
    setFieldTouched(inputName, true);
    const activeOption = find(options, ["value", selectedValue]);
    if (activeOption) {
      setFieldValue(inputName, get(activeOption, "value", null));
    } else {
      setFieldValue(inputName, get(first(options), "value", null));
    }
    if (onChange) {
      onChange(selectedValue);
    }
  };

  React.useEffect(() => {
    if (isEmpty(defaultValue)) {
      setFieldValue(inputName, get(first(options), "value", null));
    } else {
      setSelectedValue(defaultValue);
      setFieldValue(inputName, defaultValue);
    }
  }, []);

  React.useEffect(() => {
    setSelectedValue(defaultValue);
    setFieldValue(inputName, defaultValue);
  }, [defaultValue]);

  if (isEmpty(options)) {
    return null;
  }

  return (
    <div className={styles["switcher-wrapper"]}>
      <div
        className={styles.switcher}
        inputSize={inputSize}
        error={error}
        disabled={disabled}
      >
        {map(options, (option) => {
          const { label, value } = option;
          return (
            <a
              key={"switcher-" + inputName + "-" + value}
              href="#"
              onClick={onClick(value)}
              disabled={disabled}
              className={`${styles["switcher__button"]} ${(selectedValue === value ? styles["switcher__button--active"] : '')}`}
            >
              {label}
            </a>
          );
        })}
      </div>
      {error ? <span className={styles["switcher__error"]}>{error}</span> : ""}
    </div>
  );
};

export default Switcher;
