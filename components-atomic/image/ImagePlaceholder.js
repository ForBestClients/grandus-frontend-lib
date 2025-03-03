import { memo } from 'react';
import { ImageBody } from './Image';
import useWebInstance from 'grandus-lib/hooks/useWebInstance';
import { arePropsEqual } from './helpers';

const ImagePlaceholder = ({
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
  const { webInstance } = useWebInstance();
  let image = photo;

  // if photo does not exist, use webinstance placeholder
  if (usePlaceholder && !image && webInstance?.placeholder) {
    image = { ...webInstance?.placeholder };
    image.path += '/' + image?.id;
  }

  return (
    <ImageBody
      image={image}
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
};

export default memo(ImagePlaceholder, arePropsEqual);
