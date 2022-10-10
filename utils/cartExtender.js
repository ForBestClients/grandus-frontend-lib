import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import jwt from "./jwt";

const cartExtender = (cart) => {
  if (isEmpty(cart)) {
    return cart;
  }

  cart.itemsToken = isEmpty(cart?.items)
    ? null
    : jwt.signJWT(
      map(cart.items, (item) => {
        return {
          productId: item?.product?.id,
          sizeId: item?.store?.id,
          count: item.count,
        }
      })
    );

  return cart;
}

export default cartExtender;