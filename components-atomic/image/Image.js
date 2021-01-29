import styles from "./Image.module.scss";
import { getImageUrl } from "grandus-lib/utils/index";
import Image from "next/image";
import useWebInstance from "grandus-lib/hooks/useWebInstance";

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
  const { webInstance } = useWebInstance();
  let image = photo;

  // if photo does not exist, use webinstance placeholder
  if (!image && webInstance?.placeholder) {
    image = {...webInstance?.placeholder};
    image.path += "/" + image?.id;

    console.log(image);
  }

  const imageTitle = title ? title : image?.title;
  const imageAlt = alt ? alt : image?.description;

  if (useNextImage) {
    return (
      <ImageNext
        photo={image}
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
        srcSet={`${getImageUrl(image, size, "webp")} 1x, ${getImageUrl(
          image,
          size + "@2x",
          "webp"
        )} 2x`}
      />
      <source
        srcSet={`${getImageUrl(image, size, type)} 1x, ${getImageUrl(
          image,
          size + "@2x",
          type
        )} 2x`}
      />
      <img
        src={`${getImageUrl(image, size, type)}`}
        title={imageTitle}
        alt={imageAlt}
        {...imageProps}
      />
    </picture>
  );
};

export default ImageComponent;
