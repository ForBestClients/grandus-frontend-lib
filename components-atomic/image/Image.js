import styles from "./Image.module.scss";

const host = process.env.NEXT_PUBLIC_IMAGE_HOST
  ? process.env.NEXT_PUBLIC_IMAGE_HOST
  : "";

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
        srcSet={`${host}${photo.path}/${size}.webp 1x, ${host}${photo.path}/${size}@2x.webp 2x`}
      />
      <source
        srcSet={`${host}${photo.path}/${size}.${type} 1x, ${host}${photo.path}/${size}@2x.${type} 2x`}
      />
      <img
        src={`${host}${photo.path}/${size}.${type}`}
        title={title ? title : photo.title}
        alt={alt ? alt : photo.description}
      />
    </picture>
  );
};

export default Image;
