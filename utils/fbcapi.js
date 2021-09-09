import get from "lodash/get";
import map from "lodash/map";
import first from "lodash/first";
import isEmpty from "lodash/isEmpty";
import forEach from "lodash/forEach";
import toNumber from "lodash/toNumber";

const CONTENT_TYPE_PRODUCT = "product";

const FBCAPI = {
  isEnabled: function () {
    return typeof window !== "undefined" && !!window.fbq;
  },
  products: function (products) {
    if (isEmpty(products)) {
      return [];
    }
    const currency = get(first(products), "finalPriceData.currency", "EUR");
    let sumTotal = 0;
    const productsIds = [];
    const contents = [];
    forEach(products, (product) => {
      const itemPrice = toNumber(get(product, "finalPriceData.price", 0));
      const productIdentifier = get(product, "id");
      productsIds.push(productIdentifier);
      contents.push({
        id: productIdentifier,
        quantity: 1,
        item_price: itemPrice,
        name: get(product, "name", null),
        brand: get(product, "brand.name", null),
      });
      sumTotal += itemPrice;
    });

    const productsObject = {
      content_ids: productsIds,
      currency: currency,
      value: sumTotal.toFixed(2),
      contents: contents,
    };

    return productsObject;
  },
  productDetail: function (product, additionalData) {
    if (isEmpty(product)) {
      return null;
    }

    let categories = [];
    const productCategories = get(product, "categories", []);
    forEach(productCategories, (categoryTree) => {
      categories.push(
        map(categoryTree, (category) => get(category, "name", "")).join(" / ")
      );
    });

    const productData = {
      content_ids: [get(product, "id")],
      content_name: get(product, "name"),
      content_type: CONTENT_TYPE_PRODUCT,
      content_category: first(categories),
      currency: get(product, "finalPriceData.currency", "EUR"),
      value: get(product, "finalPriceData.price", null),
      contents: [
        {
          id: get(product, "sku", product?.id),
          quantity: get(additionalData, "quantity", 1),
          item_price: _.get(product, "finalPriceData.price", null),
          name: get(product, "name", null),
          brand: get(product, "brand.name", null),
          categories,
        },
      ],
    };

    return productData;
  },
  productCart: function (cart, additionalData) {
    const { items = [] } = cart;
    const productsObject = [];
    if (isEmpty(items)) {
      return productsObject;
    }
    let productCategories = [];
    let categories = [];
    forEach(items, (item) => {
      const { product, count } = item;
      let quantity = get(additionalData, "count", null);
      if (!quantity) {
        quantity = count ? count : 1;
      }
      categories = [];
      productCategories = get(product, "categories", []);
      forEach(productCategories, (categoryTree) => {
        categories.push(
          map(categoryTree, (category) => get(category, "name", "")).join(" / ")
        );
      });
      const productData = {
        content_ids: [get(product, "id")],
        content_name: get(product, "name", null),
        content_type: CONTENT_TYPE_PRODUCT,
        content_category: first(categories),
        currency: get(product, "finalPriceData.currency", "EUR"),
        value: get(product, "finalPriceData.price", null),
        contents: [
          {
            id: get(product, "sku", product?.id),
            quantity: quantity,
            item_price: get(product, "finalPriceData.price", null),
            name: get(product, "name", null),
            brand: get(product, "brand.name", null),
            categories,
          },
        ],
      };
      productsObject.push(productData);
    });
    return productsObject;
  },
  productsCheckout: function (cart) {
    if (isEmpty(cart)) {
      return [];
    }
    const productsIds = [];
    const contents = [];
    const { items } = cart;
    let productCategories = [];
    let categories = [];
    forEach(items, (item) => {
      const { product } = item;
      if (product) {
        categories = [];
        productCategories = get(product, "categories", []);
        forEach(productCategories, (categoryTree) => {
          categories.push(
            map(categoryTree, (category) => get(category, "name", "")).join(
              " / "
            )
          );
        });
        productsIds.push(get(product, "id"));
        contents.push({
          id: get(product, "id", product?.id),
          quantity: get(item, "count", 1),
          item_price: get(product, "finalPriceData.price", null),
          name: get(product, "name", null),
          brand: get(product, "brand.name", null),
          categories,
        });
      }
    });
    const cartObject = {
      content_ids: productsIds,
      content_type: CONTENT_TYPE_PRODUCT,
      currency: get(cart, "currency", "EUR"),
      value: get(cart, "sumTotal", null),
      contents: contents,
    };
    return cartObject;
  },
  purchase: function (order) {
    if (isEmpty(order)) {
      return [];
    }
    const productsIds = [];
    const contents = [];
    const { orderItems = [] } = order;
    let productCategories = [];
    let categories = [];
    forEach(orderItems, (item) => {
      const { product } = item;

      if (product) {
        categories = [];
        productCategories = get(product, "categories", []);
        forEach(productCategories, (categoryTree) => {
          categories.push(
            map(categoryTree, (category) => get(category, "name", "")).join(
              " / "
            )
          );
        });
        productsIds.push(get(item, "productId", get(product, "id")));
        contents.push({
          id: get(product, "id", product.id),
          quantity: get(item, "count", 1),
          item_price: get(product, "finalPriceData.price", null),
          name: get(product, "name", null),
          brand: get(product, "brand.name", null),
          categories,
        });
      }
    });

    const orderObject = {
      content_ids: productsIds,
      content_type: CONTENT_TYPE_PRODUCT,
      currency: get(order, "currency", "EUR"),
      value: get(order, "totalSum", null),
      num_items: orderItems.length,
      order_number: get(order, "orderNumber", null),
      contents: contents,
    };

    return orderObject;
  },
  prepareData: function (data = {}, event = null) {
    const requestJson = {
      event_name: event,
    };

    if (data) {
      requestJson.custom_data = data;
    }

    return requestJson;
  },
  send: function (event, data = {}) {
    const requestData = this.prepareData(data, event);
    fetch('/api/lib/v1/events/fb-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
  },
};

export default FBCAPI;
