export const shallowEqual = (objA, objB) => {
  if (objA === objB) return true;

  if (
    typeof objA !== 'object' ||
    typeof objB !== 'object' ||
    objA === null ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) return false;

  for (let key of keysA) {
    if (objA[key] !== objB[key]) return false;
  }

  return true;
};

export const arePropsEqual = (prevProps, nextProps) => {
  return (
    prevProps?.photo === nextProps?.photo &&
    prevProps?.size === nextProps?.size &&
    prevProps?.type === nextProps?.type &&
    prevProps?.title === nextProps?.title &&
    prevProps?.alt === nextProps?.alt &&
    prevProps?.useNextImage === nextProps?.useNextImage &&
    prevProps?.usePlaceholder === nextProps?.usePlaceholder &&
    prevProps?.className === nextProps?.className &&
    shallowEqual(prevProps.imageProps, nextProps.imageProps)
  );
};
