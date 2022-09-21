import LoadingIcon from "components/_other/icons/LoadingIcon";
import { forwardRef } from "react";

import styles from "./Button.module.scss";

const Button = forwardRef(
  (
    {
      type = "primary",
      size = "normal",
      htmlType = "button",
      roundCorners = true,
      fullWidth = false,
      children,
      className = "",
      loading = false,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={htmlType}
        className={`
        ${styles?.button} 
        ${styles[type]} 
        ${styles[size]} 
        ${roundCorners ? styles?.roundCorners : ""} 
        ${fullWidth ? styles?.fullWidth : ""} 
        ${loading ? styles?.loading : ""} 
        ${className}
      `}
        disabled={loading}
        {...props}
      >
        {loading ? <LoadingIcon /> : children}
      </button>
    );
  }
);

export default Button;
