import { get, first, isFunction } from "lodash";
const EnhancedEcommerce = {
  impressions: (products, list = undefined) => {
    const data = {
      impressions: products.map((product, index) => ({
        name: product?.name,
        id: product?.id,
        price: product?.finalPriceData?.price,
        brand: product?.brand?.name,
        category: get(getProductCategory(product), "name", undefined),
        list: list,
        position: index + 1,
      })),
    };
    return prepareData(data, null);
  },
  detail: (product) => {
    const data = {
      detail: [
        {
          name: product?.name,
          id: product?.id,
          price: product?.finalPriceData?.price,
          brand: product?.brand?.name,
          category: get(getProductCategory(product), "name", undefined),
        },
      ],
    };
    return prepareData(data, null);
  },
  productClick: (product, list = undefined, callback) => {
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
            position: product?.position
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
        products: items.map((item, index) => ({
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
};

const getProductCategory = (product) => {
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
