// import { Radio, Typography } from "antd";
import { get } from "lodash";

import Image from "next/image";

// const { Paragraph } = Typography;

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
      {/* <Paragraph ellipsis={{ rows: 1 }} style={{ marginBottom: 0 }}> */}
      {get(data, "name")}
      {/* </Paragraph> */}
    </label>
  );
};

export default BesteronSingleButton;
