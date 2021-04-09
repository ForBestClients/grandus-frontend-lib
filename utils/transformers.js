import { get, map } from "lodash";

export const transformWishlist = (object) => {
  return {
    count: get(object, "count", 0),
    products: get(object, "items", []),
    productIds: get(
      object,
      "productIds",
      map(get(object, "items", []), (item) => get(item, "product.id"))
    ),
  };
};
