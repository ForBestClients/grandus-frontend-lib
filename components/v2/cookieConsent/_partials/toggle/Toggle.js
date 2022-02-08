import styles from "./Toggle.module.scss";

const Toggle = ({
  label = "",
  name = "",
  checked = false,
  disabled = false,
  handleChange = null,
}) => {
  return (
    <label>
      <div className={styles?.switch}>
        <input
          type="checkbox"
          name={name}
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
        />
        <span className={styles?.slider}></span>
      </div>
      {label ? <span className={styles?.label}>{label}</span> : null}
    </label>
  );
};

export default Toggle;
