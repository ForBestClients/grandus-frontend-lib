import get from 'lodash/get';
import map from 'lodash/map';
import first from 'lodash/first';
import isEmpty from 'lodash/isEmpty';
import forEach from 'lodash/forEach';

const CONTENT_TYPE_PRODUCT = 'product';

const FBCAPI = {
  isEnabled: function() {
    return typeof window !== 'undefined' && !!window.fbq;
  },

  productDetail: function(product, additionalData) {
    if (isEmpty(product)) {
      return null;
    }

    let categories = [];
    const productCategories = get(product, 'categories', []);
    forEach(productCategories, (categoryTree) => {
      categories.push(
        map(categoryTree, (category) => get(category, 'name', '')).join(' / '),
      );
    });

    const productData = {
      event_id: `product-${product?.id}`,
      custom_data: {
        content_ids: [`${get(product, 'sku') || product?.id}`],
        content_name: get(product, 'name'),
        content_type: CONTENT_TYPE_PRODUCT,
        content_category: first(categories),
        currency: get(product, 'finalPriceData.currency', 'EUR'),
        value: get(product, 'finalPriceData.price', null),
        contents: [
          {
            id: `${get(product, 'sku') || product?.id}`,
            quantity: get(additionalData, 'quantity', 1),
            item_price: get(product, 'finalPriceData.price', null),
          },
        ],
      },
    };

    if (additionalData?.eventName) {
      productData.event_name = additionalData.eventName;
    }

    return productData;
  },

  productsCheckout: function(cart) {
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
        productCategories = get(product, 'categories', []);
        forEach(productCategories, (categoryTree) => {
          categories.push(
            map(categoryTree, (category) => get(category, 'name', '')).join(
              ' / ',
            ),
          );
        });
        productsIds.push(get(product, 'sku') || product?.id);
        contents.push({
          id: `${get(product, 'sku') || product?.id}`,
          quantity: get(item, 'count', 1),
          item_price: get(product, 'finalPriceData.price', null),
        });
      }
    });
    const cartObject = {
      event_id: `checkout-${productsIds.join('-')}`,
      custom_data: {
        content_ids: productsIds,
        content_type: CONTENT_TYPE_PRODUCT,
        currency: get(cart, 'currency', 'EUR'),
        value: get(cart, 'sumTotal', null),
        contents: contents,
      },
    };

    return cartObject;
  },

  purchase: function(order) {
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
        productCategories = get(product, 'categories', []);
        forEach(productCategories, (categoryTree) => {
          categories.push(
            map(categoryTree, (category) => get(category, 'name', '')).join(
              ' / ',
            ),
          );
        });
        productsIds.push(get(product, 'sku') || product?.id);
        contents.push({
          id: `${get(product, 'sku') || product?.id}`,
          quantity: get(item, 'count', 1),
        });
      }
    });

    const orderObject = {
      event_id: `order-${order?.id}`,
      event_name: 'Purchase',
      custom_data: {
        content_ids: productsIds,
        content_type: CONTENT_TYPE_PRODUCT,
        currency: get(order, 'currency', 'EUR'),
        value: get(order, 'totalSum', null),
        num_items: orderItems.length,
        order_number: get(order, 'orderNumber', null),
        contents: contents,
      },
    };

    return orderObject;
  },

  addPaymentInfo: function(cart) {
    const cartObject = this.productsCheckout(cart);

    if (!isEmpty(cartObject)) {
      cartObject.event_id = `payment-info-${cart?.id}`;
      return cartObject;
    }

    return null;
  },


  prepareData: function(data = {}, event = null) {
    let requestJson = {
      event_name: event,
    };

    if (data) {
      requestJson = { ...requestJson, ...data };
    }

    return requestJson;
  },

  send: function(event, data = {}) {
    const requestData = this.prepareData(data, event);
    fetch('/cz/api/lib/v1/events/fb-capi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });
  },
};

export default FBCAPI;
