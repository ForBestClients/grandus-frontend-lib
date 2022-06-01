import { get } from "lodash";

import Image from "next/image";

import styles from "./Ahoj.module.scss";

const AhojSingleButton = ({ data, active = false, handleChange }) => {
  const description = get(data, "description");
  return (
    <>
      <label
        className={`${active ? styles?.active + " ahoj_custom_active" : ""}`}
      >
        <div className={styles?.optionHeader}>
          <span>
            <input
              type="radio"
              name="specificPayment"
              value={get(data, "value")}
              onChange={handleChange}
              checked={active}
            />

            {get(data, "name")}
          </span>
          <Image
            src={`${process.env.NEXT_PUBLIC_IMAGE_HOST}/${get(data, "img")}`}
            alt={get(data, "name")}
            width={68}
            height={40}
          />
        </div>

        {description ? (
          <div
            className={styles.description}
            dangerouslySetInnerHTML={{
              __html: description,
            }}
          />
        ) : (
          ""
        )}
      </label>
    </>
  );
};

export default AhojSingleButton;
