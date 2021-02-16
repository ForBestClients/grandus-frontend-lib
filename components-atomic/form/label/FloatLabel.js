import React, { useState } from "react";

import styles from "./FloatLabel.module.scss";

const FloatLabel = props => {
  const [focus, setFocus] = useState(false);
  const { children, label, value } = props;

  const labelClass =
    focus || (value && value.length !== 0) ? `${styles?.labelFloat} label-float-custom` : "";

  return (
    <div
      className={styles?.floatLabel}
      onBlur={() => setFocus(false)}
      onFocus={() => setFocus(true)}
    >
      {children}
      <label className={`${styles?.label} ${labelClass}`}>{label}</label>
    </div>
  );
};

export default FloatLabel;
