import { get, map, first, isFunction } from "lodash";
const EnhancedEcommerce = {
  impressions: (products, list = undefined, options = { page: 1, perPage: 1}) => {
    let positionConstant = 0;
    const page = options?.page;
    const perPage = options?.perPage;
    if (page && perPage) {
      positionConstant = (parseInt(page) - 1) * parseInt(perPage); 
    }
    const data = {
      impressions: products.map((product, index) => ({
        name: product?.name,
        id: product?.id,
        price: product?.finalPriceData?.price,
        brand: product?.brand?.name,
        category: get(getProductCategory(product), "name", undefined),
        list: list,
        position: positionConstant + index + 1,
      })),
    };
    return prepareData(data, 'impressions');
  },
  detail: (product) => {
    const data = {
      detail: {
        products: [{
          name: product?.name,
          id: product?.id,
          price: product?.finalPriceData?.price,
          brand: product?.brand?.name,
          category: get(getProductCategory(product), "name", undefined),
        }]
      },
    };
    return prepareData(data, 'detail');
  },
  productClick: (product, list = undefined, options = { page: 1, perPage: 1}) => {
    let positionConstant = 0;
    const page = options?.page;
    const perPage = options?.perPage;
    if (page && perPage) {
      positionConstant = (parseInt(page) - 1) * parseInt(perPage); 
    }
    const data = {
      click: {
        actionField: { list: list }, // Optional list property.
        products: [
          {
            name: product?.name,
            id: product?.id,
            price: product?.finalPriceData?.price,
            brand: product?.brand?.name,
            category: get(getProductCategory(product), "name", undefined),
            list: list,
            position: product?.position + positionConstant
          },
        ],
      },
    };
    return prepareData(data, "productClick");
  },
  cartAdd: (product, quantity = 1) => {
    const data = {
      add: {
        products: [
          {
            name: product?.name,
            id: product?.id,
            price: product?.finalPriceData?.price,
            brand: product?.brand?.name,
            category: get(getProductCategory(product), "name", undefined),
            quantity: quantity,
          },
        ],
      },
    };

    return prepareData(data, "addToCart");
  },
  cartRemove: (product, quantity = 1) => {
    const data = {
      remove: {
        products: [
          {
            name: product?.name,
            id: product?.id,
            price: product?.finalPriceData?.price,
            brand: product?.brand?.name,
            category: get(getProductCategory(product), "name", undefined),
            quantity: quantity,
          },
        ],
      },
    };

    return prepareData(data, "removeFromCart");
  },
  checkout: (items, step = null) => {
    const data = {
      checkout: {
        products: map(items, (item, index) => ({
          name: item?.product?.name,
          id: item?.product?.id,
          price: item?.priceTotalData?.price,
          brand: item?.product?.brand?.name,
          category: get(getProductCategory(item?.product), "name", undefined),
          quantity: item?.count,
        })),
      },
    };

    if (step) {
      data.checkout.actionField = { step };
    }

    return prepareData(data, "checkout");
  },
  checkoutOption: (option = null, step = null) => {
    const data = {
      checkout_option: {
        actionField: {}
      },
    };

    if (option) {
      data.checkout_option.actionField.option = option;
    }

    if (step) {
      data.checkout_option.actionField.step = step;
    }

    return prepareData(data, "checkoutOption");
  },
  purchase: (order) => {
    const items = get(order, 'orderItems', []);
    const couponsString = map(get(order, 'coupons'), coupon => get(coupon, 'hash')).join('|');
    const data = {
      purchase: {
        actionField: {
          id: get(order, 'orderNumber'), // Transaction ID. Required for purchases and refunds.
          affiliation: '',
          revenue: parseFloat(_.get(order, 'totalSumData.price', 0)), // Total transaction value (incl. tax and shipping)
          tax: get(order, 'totalSumData.vatFraction', 0),
          shipping: (parseFloat(get(order, 'deliveryPrice', 0)) + parseFloat(get(order, 'paymentPrice', 0))),
          coupon: couponsString
        },
        products: map(items, (item, index) => ({
          name: item?.name,
          id: item?.productId,
          price: item?.totalPriceData?.price,
          brand: item?.product?.brand?.name,
          category: get(getProductCategory(item?.product), "name", undefined),
          quantity: item?.count,
          coupon: couponsString
        })),
      },
    };

    return prepareData(data, 'purchase');
  },
};

const getProductCategory = (product) => {
  if (!product) {
    return null;
  }
  const { categories } = product;
  let category = first(categories);
  if (!get(category, "name", null)) {
    category = first(category);
  }
  return category;
};

const prepareData = (data = {}, event = null) => {
  const ecommerceJson = {};
  if (event) {
    ecommerceJson.event = event;
  }

  if (data) {
    ecommerceJson.ecommerce = data;
  }

  return ecommerceJson;
};

export default EnhancedEcommerce;
