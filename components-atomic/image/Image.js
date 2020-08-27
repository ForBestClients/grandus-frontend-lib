import styles from "./Image.module.scss";
import {getImageUrl} from "grandus-lib/utils/index";

const Image = ({
  photo,
  size,
  type,
  srcSet = {},
  title = false,
  alt = false,
  className,
}) => {
  if (!photo) {
    return "";
  }

  return (
    <picture className={`${styles.wrapper} ${className ? className : ""}`}>
      <source
        type="image/webp"
        srcSet={`${getImageUrl(photo, size, "webp")} 1x, ${getImageUrl(photo, size + "@2x", "webp")} 2x`}
      />
      <source
        srcSet={`${getImageUrl(photo, size, type)} 1x, ${getImageUrl(photo, size + "@2x", type)} 2x`}
      />
      <img
        src={`${getImageUrl(photo, size, type)}`}
        title={title ? title : photo.title}
        alt={alt ? alt : photo.description}
      />
    </picture>
  );
};

export default Image;
