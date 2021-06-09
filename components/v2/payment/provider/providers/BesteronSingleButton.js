import { get } from "lodash";

import Image from "next/image";

import styles from "./Besteron.module.scss";

const BesteronSingleButton = ({ data, active = false, handleChange }) => {
  return (
    <label className={`${active ? styles?.active : ""}`}>
      <input
        type="radio"
        name="specificPayment"
        value={get(data, "value")}
        onChange={handleChange}
      />
      <Image
        src={`${process.env.NEXT_PUBLIC_IMAGE_HOST}/${get(data, "img")}`}
        alt={get(data, "name")}
        width={80}
        height={37.5}
      />
      {get(data, "name")}
    </label>
  );
};

export default BesteronSingleButton;
