import { get, map } from "lodash";

export const transformWishlist = (apiWishlist) => {
  return {
    count: get(apiWishlist, "count", 0),
    items: get(apiWishlist, "items", []),
    productIds: map(get(apiWishlist, "items", []), (item) =>
      get(item, "product.id")
    ),
  };
};
