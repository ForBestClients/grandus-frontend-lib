import get from "lodash/get";
import map from "lodash/map";
import first from "lodash/first";
import isEmpty from "lodash/isEmpty";
import forEach from "lodash/forEach";
import toNumber from "lodash/toNumber";
import isArray from "lodash/isArray";

const CONTENT_TYPE_PRODUCT = "product";

const FBPixel = {
  init: function (fbPixelCode = "") {
    if (!fbPixelCode) {
      return null;
    }

    return (
      <script
        defer
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window,document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${fbPixelCode}');
            fbq('track', 'PageView');
            `,
        }}
      />
    );
  },
  registerPageViewTracking: function (router) {
    if (this.isEnabled()) {
      router.events.on("routeChangeComplete", this.pageView.bind(this));
      return () => {
        router.events.off("routeChangeComplete", this.pageView.bind(this));
      };
    }
  },
  isEnabled: function () {
    return typeof window !== "undefined" && !!window.fbq;
  },
  pageView: function () {
    if (this.isEnabled()) {
      fbq("track", "PageView");
    }
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
      productsIds.push(`${productIdentifier}`);
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
      eventID: `products-${productsIds.join('-')}`,
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
    if (isArray(get(productCategories, '[0]'))) {
      forEach(productCategories, (categoryTree) => {
        categories.push(
          map(categoryTree, (category) => get(category, "name", "")).join(" / ")
        );
      });
    } else {
      categories.push(
        map(productCategories, (category) => get(category, "name", "")).join(" / ")
      );
    }

    const productData = {
      content_ids: [`${get(product, "sku") || product?.id}`],
      content_name: get(product, "name"),
      content_type: CONTENT_TYPE_PRODUCT,
      content_category: first(categories),
      currency: get(product, "finalPriceData.currency", "EUR"),
      value: get(product, "finalPriceData.price", null),
      contents: [
        {
          id: `${get(product, "sku") || product?.id}`,
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
        content_ids: [`${get(product, "id")}`],
        content_name: get(product, "name", null),
        content_type: CONTENT_TYPE_PRODUCT,
        content_category: first(categories),
        currency: get(product, "finalPriceData.currency", "EUR"),
        value: get(product, "finalPriceData.price", null),
        contents: [
          {
            id: `${get(product, "sku", product?.id)}`,
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
        productsIds.push(`${get(product, "id")}`);
        contents.push({
          id: `${get(product, "sku") || product?.id}`,
          quantity: get(item, "count", 1),
          item_price: get(product, "finalPriceData.price", null),
          name: get(product, "name", null),
          brand: get(product, "brand.name", null),
          categories,
        });
      }
    });
    const cartObject = {
      eventID: `checkout-${productsIds.join('-')}`,
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
    const { orderItems } = order;
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
        productsIds.push(`${get(item, "productId") || product?.id}`);
        contents.push({
          id: `${get(product, "id", product.id)}`,
          quantity: get(item, "count", 1),
          item_price: get(product, "finalPriceData.price", null),
          name: get(product, "name", null),
          brand: get(product, "brand.name", null),
          categories,
        });
      }
    });

    const orderObject = {
      eventID: `order-${order?.id}`,
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
  track: function (event, data = {}) {
    if (this.isEnabled()) {
      fbq("track", event, data);
    }
  },

  prepareProductData: function (product, additionalData) {
    return this.productDetail(product, additionalData);
  },

  addToCart: function (product, additionalData) {
    const productData = this.prepareProductData(product, additionalData);

    if (!productData) {
      return;
    }

    this.track("AddToCart", productData);
  },

  prepareCartData: function (cart) {
    if (!cart?.items) {
      return null;
    }

    const contents = [];
    const contentIds = [];

    forEach(cart?.items, (item) => {
      contentIds.push(get(item, "product.id"));
      contents.push({
        id: `${get(item, "product.id")}`,
        quantity: get(item, "count", 1),
        item_price: get(item, "finalPriceData.price", null),
        name: get(item, "product.name", null),
        brand: get(item, "brand.name", null),
      });
    });

    return {
      currency: get(cart, "sumData.currency"),
      value: get(cart, "sumData.price"),
      content_ids: contentIds,
      contents: contents,
    };
  },

  initiateCheckout: function (cart) {
    const cartObject = this.prepareCartData(cart);

    if (!cartObject) {
      return;
    }

    cartObject.num_items = cart?.items?.length ?? 0;

    this.track("InitiateCheckout", cartObject);
  },

  addPaymentInfo: function (cart) {
    const cartObject = this.prepareCartData(cart);

    if (!cartObject) {
      return;
    }

    this.track("AddPaymentInfo", cartObject);
  },

  addPurchase: function (order) {
    const data = this.purchase(order);

    if (isEmpty(data)) {
      return;
    }

    this.track("Purchase", data);
  },

  viewProduct: function (product) {
    const productData = this.prepareProductData(product)

    if (!productData) {
      return;
    }

    this.track("ViewContent", productData);
  },
};

export default FBPixel;
