import { memo } from 'react';
import styles from './Image.module.scss';
import { getImageUrl } from 'grandus-lib/utils/index';
import Image from 'next/image';
import ImagePlaceholder from './ImagePlaceholder';
import { arePropsEqual } from './helpers';

const ImageNext = ({ photo, size, type, title, alt, imageProps }) => {
  const dimensions = size.match(/\d+/g).map(Number);
  const { layout = null } = imageProps;

  if (layout === 'fill') {
    return (
      <Image
        src={getImageUrl(photo, size, type)}
        title={title}
        alt={alt}
        {...imageProps}
      />
    );
  }

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

export const ImageBody = ({
  image,
  size,
  type,
  srcSet = {},
  title = '',
  alt = false,
  className,
  useNextImage = false,
  usePlaceholder = false,
  imageProps = {},
}) => {
  if (!image?.path) {
    return null;
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
        alt={imageAlt || imageTitle}
        imageProps={imageProps}
      />
    );
  }

  const imageUrl = getImageUrl(image, size, type);
  const imageUrl2x = getImageUrl(image, size + '@2x', type);
  const imageUrlWebp = getImageUrl(image, size, 'webp');
  const imageUrlWebp2x = getImageUrl(image, size + '@2x', 'webp');

  return (
    <picture className={`${styles.wrapper} ${className || ''}`}>
      <source
        type="image/webp"
        srcSet={`${imageUrlWebp} 1x, ${imageUrlWebp2x} 2x`}
      />
      <source srcSet={`${imageUrl} 1x, ${imageUrl2x} 2x`} />
      <img
        src={imageUrl}
        title={imageTitle}
        alt={imageAlt || imageTitle}
        loading="lazy"
        decoding="async"
        {...imageProps}
      />
    </picture>
  );
};

const ImageComponent = memo(
  ({
    photo,
    size,
    type,
    srcSet = {},
    title = '',
    alt = false,
    className,
    useNextImage = false,
    usePlaceholder = false,
    imageProps = {},
  }) => {
    // if photo does not exist, use webinstance placeholder

    if (usePlaceholder && !photo) {
      return (
        <ImagePlaceholder
          photo={photo}
          size={size}
          type={type}
          srcSet={srcSet}
          title={title}
          alt={alt}
          className={className}
          useNextImage={useNextImage}
          usePlaceholder={true}
          imageProps={imageProps}
        />
      );
    }

    return (
      <ImageBody
        image={photo}
        size={size}
        type={type}
        srcSet={srcSet}
        title={title}
        alt={alt}
        className={className}
        useNextImage={useNextImage}
        imageProps={imageProps}
      />
    );
  },
  arePropsEqual,
);

export default ImageComponent;
