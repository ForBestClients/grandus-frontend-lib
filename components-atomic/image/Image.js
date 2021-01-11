import styles from "./Image.module.scss";
import { getImageUrl } from "grandus-lib/utils/index";
import Image from "next/image";

const ImageNext = ({ photo, size, type, title, alt, imageProps }) => {
  const dimensions = size.match(/\d+/g).map(Number);

  return (
    <Image
      width={dimensions[0]}
      height={dimensions[1]}
      src={getImageUrl(photo, size, type)}
      title={title}
      alt={alt}
      {...imageProps}
    />
  );
};

const ImageComponent = ({
  photo,
  size,
  type,
  srcSet = {},
  title = "",
  alt = false,
  className,
  useNextImage = false,
  imageProps = {},
}) => {
  if (!photo) {
    return ""; //@TODO add default blank image
  }

  const imageTitle = title ? title : photo?.title;
  const imageAlt = alt ? alt : photo?.description;

  if (useNextImage) {
    return (
      <ImageNext
        photo={photo}
        size={size}
        type={type}
        title={imageTitle}
        alt={imageAlt}
        imageProps={imageProps}
      />
    );
  }

  return (
    <picture className={`${styles.wrapper} ${className ? className : ""}`}>
      <source
        type="image/webp"
        srcSet={`${getImageUrl(photo, size, "webp")} 1x, ${getImageUrl(
          photo,
          size + "@2x",
          "webp"
        )} 2x`}
      />
      <source
        srcSet={`${getImageUrl(photo, size, type)} 1x, ${getImageUrl(
          photo,
          size + "@2x",
          type
        )} 2x`}
      />
      <img
        src={`${getImageUrl(photo, size, type)}`}
        title={imageTitle}
        alt={imageAlt}
        {...imageProps}
      />
    </picture>
  );
};

export default ImageComponent;
