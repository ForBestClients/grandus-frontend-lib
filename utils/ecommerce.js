import get from 'lodash/get';
import map from 'lodash/map';
import first from 'lodash/first';
import pickBy from 'lodash/pickBy';
import includes from 'lodash/includes';

const ALLOWED_CUSTOM_FIELDS = [
  'custom_label_2',
  'custom_label_3',
  'custom_label_4',
];

const EnhancedEcommerce = {
  // UA analytics: category
  impressions: (
    products,
    list = undefined,
    options = { page: 1, perPage: 1 },
  ) => {
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
        category: get(getProductCategory(product), 'name', undefined),
        list: list,
        position: positionConstant + index + 1,
      })),
    };
    return prepareData(data, 'impressions');
  },
  // G4 analytics: category
  view_item_list: function(products, list = '', options = { page: 1, perPage: 1 }) {
    let positionConstant = 0;
    const page = options?.page;
    const perPage = options?.perPage;
    if (page && perPage) {
      positionConstant = (parseInt(page) - 1) * parseInt(perPage);
    }
    const data = {
      item_list_id: get(list, 'id', list),
      item_list_name: get(list, 'name', list),
      items: products.map((product, index) => ({
        item_id: product?.id,
        item_name: product?.name,
        currency: product?.finalPriceData?.currency,
        price: product?.finalPriceData?.price,
        index: positionConstant + index + 1,
        item_brand: product?.brand?.name,
        item_category: get(product, 'categories[0].name', ''),
        item_category2: get(product, 'categories[1].name', ''),
        item_category3: get(product, 'categories[2].name', ''),
        item_category4: get(product, 'categories[3].name', ''),
        item_category5: get(product, 'categories[4].name', ''),
        ...this.getProductCustomKeys(product),
      })),
    };

    return prepareData(data, 'view_item_list');
  },

  getProductCustomKeys: function(product) {
    return pickBy(product, (value, key) => includes(ALLOWED_CUSTOM_FIELDS, key));
  },

  // UA analytics: detail
  detail: (product) => {
    const data = {
      detail: {
        products: [
          {
            name: product?.name,
            id: product?.id,
            price: product?.finalPriceData?.price,
            brand: product?.brand?.name,
            category: get(getProductCategory(product), 'name', ''),
          },
        ],
      },
    };
    return prepareData(data, 'detail');
  },

  //G4 analytics:  detail
  view_item: function(product) {
    const data = {
      currency: product?.finalPriceData?.currency,
      value: product?.finalPriceData?.price,
      items: [
        {
          item_id: product?.id,
          item_name: product?.name,
          currency: product?.finalPriceData?.currency,
          price: product?.finalPriceData?.price,
          index: 0,
          item_brand: product?.brand?.name,
          item_category: get(product, 'categories[0].name', ''),
          item_category2: get(product, 'categories[1].name', ''),
          item_category3: get(product, 'categories[2].name', ''),
          item_category4: get(product, 'categories[3].name', ''),
          item_category5: get(product, 'categories[4].name', ''),
          quantity: 1,
          ...this.getProductCustomKeys(product),
        },
      ],
    };
    return prepareData(data, 'view_item');
  },

  productClick: (
    product,
    list = undefined,
    options = { page: 1, perPage: 1 },
  ) => {
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
            category: get(getProductCategory(product), 'name', ''),
            list: list,
            position: product?.position + positionConstant,
          },
        ],
      },
    };
    return prepareData(data, 'productClick');
  },

  // UA analytics: add to cart
  cartAdd: (product, quantity = 1) => {
    const data = {
      add: {
        products: [
          {
            name: product?.name,
            id: product?.id,
            price: product?.finalPriceData?.price,
            brand: product?.brand?.name,
            category: get(getProductCategory(product), 'name', ''),
            quantity: quantity,
          },
        ],
      },
    };

    return prepareData(data, 'addToCart');
  },

  // G4 analytics: add to cart
  add_to_cart: function(product, variant, quantity = 1) {
    const data = {
      currency: product?.finalPriceData?.currency,
      value: product?.finalPriceData?.price,
      items: [
        {
          item_id: product?.id,
          item_name: product?.name,
          item_variant: variant,
          currency: product?.finalPriceData?.currency,
          price: product?.finalPriceData?.price,
          index: 0,
          item_brand: product?.brand?.name,
          item_category: get(product, 'categories[0].name', ''),
          item_category2: get(product, 'categories[1].name', ''),
          item_category3: get(product, 'categories[2].name', ''),
          item_category4: get(product, 'categories[3].name', ''),
          item_category5: get(product, 'categories[4].name', ''),
          quantity: quantity,
          ...this.getProductCustomKeys(product),
        },
      ],
    };

    return prepareData(data, 'add_to_cart');
  },

  // UA analytics: remove from cart
  cartRemove: function(product, quantity = 1) {
    const data = {
      remove: {
        products: [
          {
            name: product?.name,
            id: product?.id,
            price: product?.finalPriceData?.price,
            brand: product?.brand?.name,
            category: get(getProductCategory(product), 'name', ''),
            quantity: quantity,
            ...this.getProductCustomKeys(product),
          },
        ],
      },
    };

    return prepareData(data, 'removeFromCart');
  },

  // G4 analytics: remove from cart
  remove_from_cart: (item, quantity = 1) => {
    const data = {
      currency: item?.priceData?.currency,
      value: item?.priceData?.price,
      items: [
        {
          item_id: get(item, 'product.id'),
          item_name: get(item, 'product.name'),
          item_variant: item?.store?.name,
          currency: get(item, 'priceData.currency'),
          price: get(item, 'priceData.price'),
          index: 0,
          item_brand: get(item, 'product.brand.name'),
          item_category: get(item, 'product.categories[0].name', ''),
          item_category2: get(item, 'product.categories[1].name', ''),
          item_category3: get(item, 'product.categories[2].name', ''),
          item_category4: get(item, 'product.categories[3].name', ''),
          item_category5: get(item, 'product.categories[4].name', ''),
          quantity: quantity,
        },
      ],
    };

    return prepareData(data, 'remove_from_cart');
  },

  checkout: (items, step = null) => {
    const data = {
      checkout: {
        products: map(items, (item, index) => ({
          name: item?.product?.name,
          id: item?.product?.id,
          price: item?.priceTotalData?.price,
          brand: item?.product?.brand?.name,
          category: get(getProductCategory(item?.product), 'name', ''),
          quantity: item?.count,
        })),
      },
    };

    if (step) {
      data.checkout.actionField = { step };
    }

    return prepareData(data, 'checkout');
  },

  // G4 analytics: view cart / step 1
  view_cart: function(cart) {
    const data = {
      currency: cart?.sumData?.currency,
      value: cart?.sumData?.price,
      coupon: cart?.coupon?.hash,
      items: cart?.items.map((item, index) => ({
        item_id: item?.product?.id,
        item_name: item?.product?.name,
        item_variant: item?.store?.name,
        currency: item?.priceData?.currency,
        price: item?.priceData?.price,
        index: index,
        item_brand: item?.product?.brand?.name,
        item_category: get(item, 'product.categories[0].name', ''),
        item_category2: get(item, 'product.categories[1].name', ''),
        item_category3: get(item, 'product.categories[2].name', ''),
        item_category4: get(item, 'product.categories[3].name', ''),
        item_category5: get(item, 'product.categories[4].name', ''),
        quantity: item?.count,
        ...this.getProductCustomKeys(item?.product),
      })),
    };

    return prepareData(data, 'view_cart');
  },

  // G4 analytics: begin checkout / step 2
  begin_checkout: function(cart) {
    const data = {
      currency: cart?.sumData?.currency,
      value: cart?.sumData?.price,
      coupon: cart?.coupon?.hash,
      items: cart?.items.map((item, index) => ({
        item_id: item?.product?.id,
        item_name: item?.product?.name,
        item_variant: item?.store?.name,
        currency: item?.priceData?.currency,
        price: item?.priceData?.price,
        index: index,
        item_brand: item?.product?.brand?.name,
        item_category: get(item, 'product.categories[0].name', ''),
        item_category2: get(item, 'product.categories[1].name', ''),
        item_category3: get(item, 'product.categories[2].name', ''),
        item_category4: get(item, 'product.categories[3].name', ''),
        item_category5: get(item, 'product.categories[4].name', ''),
        quantity: item?.count,
        ...this.getProductCustomKeys(item?.product),
      })),
    };

    return prepareData(data, 'begin_checkout');
  },

  // G4 analytics: add shipping info / step 3
  add_shipping_info: function(cart) {
    const data = {
      currency: cart?.sumData?.currency,
      value: cart?.sumData?.price,
      coupon: cart?.coupon?.hash,
      shipping_tier: cart?.delivery?.name,
      items: cart?.items.map((item, index) => ({
        item_id: item?.product?.id,
        item_name: item?.product?.name,
        item_variant: item?.store?.name,
        currency: item?.priceData?.currency,
        price: item?.priceData?.price,
        index: index,
        item_brand: item?.product?.brand?.name,
        item_category: get(item, 'product.categories[0].name', ''),
        item_category2: get(item, 'product.categories[1].name', ''),
        item_category3: get(item, 'product.categories[2].name', ''),
        item_category4: get(item, 'product.categories[3].name', ''),
        item_category5: get(item, 'product.categories[4].name', ''),
        quantity: item?.count,
        ...this.getProductCustomKeys(item?.product),
      })),
    };

    return prepareData(data, 'add_shipping_info');
  },

  // G4 analytics: add payment info / step 3
  add_payment_info: function(cart) {
    const data = {
      currency: cart?.sumData?.currency,
      value: cart?.sumData?.price,
      coupon: cart?.coupon?.hash,
      payment_type: cart?.payment?.name,
      items: cart?.items.map((item, index) => ({
        item_id: item?.product?.id,
        item_name: item?.product?.name,
        item_variant: item?.store?.name,
        currency: item?.priceData?.currency,
        price: item?.priceData?.price,
        index: index,
        item_brand: item?.product?.brand?.name,
        item_category: get(item, 'product.categories[0].name', ''),
        item_category2: get(item, 'product.categories[1].name', ''),
        item_category3: get(item, 'product.categories[2].name', ''),
        item_category4: get(item, 'product.categories[3].name', ''),
        item_category5: get(item, 'product.categories[4].name', ''),
        quantity: item?.count,
        ...this.getProductCustomKeys(item?.product),
      })),
    };

    return prepareData(data, 'add_payment_info');
  },

  checkoutOption: (option = null, step = null) => {
    const data = {
      checkout_option: {
        actionField: {},
      },
    };

    if (option) {
      data.checkout_option.actionField.option = option;
    }

    if (step) {
      data.checkout_option.actionField.step = step;
    }

    return prepareData(data, 'checkoutOption');
  },

  purchase: (order) => {
    const items = get(order, 'orderItems', []);
    const couponsString = map(get(order, 'coupons'), (coupon) =>
      get(coupon, 'hash'),
    ).join('|');
    const data = {
      purchase: {
        actionField: {
          id: get(order, 'orderNumber'), // Transaction ID. Required for purchases and refunds.
          affiliation: '',
          revenue: parseFloat(_.get(order, 'totalSumData.price', 0)), // Total transaction value (incl. tax and shipping)
          tax: get(order, 'totalSumData.vatFraction', 0),
          shipping:
            parseFloat(get(order, 'deliveryPrice', 0)) +
            parseFloat(get(order, 'paymentPrice', 0)),
          coupon: couponsString,
        },
        products: map(items, (item, index) => ({
          name: item?.name,
          id: item?.productId,
          price: item?.totalPriceData?.price,
          brand: item?.product?.brand?.name,
          category: get(getProductCategory(item?.product), 'name', ''),
          quantity: item?.count,
          coupon: couponsString,
        })),
      },
    };

    return prepareData(data, 'purchase');
  },

  // G4 analytics purchase
  purchaseG4: function(order, enhancedConversionTracking = false) {
    const couponsString = map(get(order, 'coupons'), (coupon) =>
      get(coupon, 'hash'),
    ).join('|');

    const data = {
      transaction_id: get(order, 'orderNumber'),
      affiliation: '',
      value: get(order, 'totalSumData.price', 0),
      tax: get(order, 'totalSumData.vatFraction', 0),
      shipping:
        get(order, 'deliveryPriceData.price', 0) +
        get(order, 'paymentPriceData.price', 0),
      coupon: couponsString,
      currency: order?.totalSumData?.currency,
      items: order?.orderItems.map((item, index) => ({
        item_id: item?.productId,
        item_name: item?.product?.name,
        item_variant: item?.size,
        currency: item?.unitPriceData?.currency,
        price: item?.unitPriceData?.price,
        index: index,
        item_brand: item?.product?.brand?.name,
        item_category: get(item, 'product.categories[0].name', ''),
        item_category2: get(item, 'product.categories[1].name', ''),
        item_category3: get(item, 'product.categories[2].name', ''),
        item_category4: get(item, 'product.categories[3].name', ''),
        item_category5: get(item, 'product.categories[4].name', ''),
        quantity: item?.count,
        ...this.getProductCustomKeys(item?.product),
      })),
    };

    if (enhancedConversionTracking) {
      data.email = order.email;
      data.phone_number = order.phone;
      data.first_name = order.name;
      data.last_name = order.surname;
      data.address = {
        street: order.street,
        city: order.city,
        postal_code: order.zip,
        country: order?.countryObject?.twoLetterCode ?? null,
      };
    }

    return prepareData(data, 'purchase');
  },

  // G4 add to wishlist
  add_to_wishlist(product, variant) {
    const data = {
      currency: product?.finalPriceData?.currency,
      value: product?.finalPriceData?.price,
      items: [{
        item_id: product?.id,
        item_name: product?.name,
        item_variant: variant?.name,
        currency: product?.finalPriceData?.currency,
        price: product?.finalPriceData?.price,
        index: 0,
        item_brand: product?.brand?.name,
        item_category: get(product, 'categories[0].name', ''),
        item_category2: get(product, 'categories[1].name', ''),
        item_category3: get(product, 'categories[2].name', ''),
        item_category4: get(product, 'categories[3].name', ''),
        item_category5: get(product, 'categories[4].name', ''),
        quantity: 1,
      }],
    };

    return prepareData(data, 'add_to_wishlist');
  },

  // G4 view banner / promotion
  view_promotion: (banners, name) => {
    const data = {
      creative_name: name,
      items: map(banners, (banner) => {
        return {
          item_id: banner?.id,
          item_name: banner?.title,
        };
      }),
    };

    return prepareData(data, 'view_promotion');
  },

  // G4 click banner / promotion
  select_promotion: (banner, name) => {
    const data = {
      creative_name: name ?? '',
      items: [{
        item_id: banner?.id,
        item_name: banner?.title,
      }],
    };

    return prepareData(data, 'select_promotion');
  },

  // G4 click product
  select_item: (product, variant, list) => {
    const data = {
      item_list_id: list?.id,
      item_list_name: list?.name,
      items: [{
        item_id: product?.id,
        item_name: product?.name,
        item_variant: variant?.name,
        currency: product?.finalPriceData?.currency,
        price: product?.finalPriceData?.price,
        index: 0,
        item_brand: product?.brand?.name,
        item_category: get(product, 'categories[0].name', ''),
        item_category2: get(product, 'categories[1].name', ''),
        item_category3: get(product, 'categories[2].name', ''),
        item_category4: get(product, 'categories[3].name', ''),
        item_category5: get(product, 'categories[4].name', ''),
        quantity: 1,
      }],
    };

    return prepareData(data, 'select_item');
  },

  // GA3
  user: (user, group) => {
    const data = {
      UserID: user?.id || 0,
      UserType: group,
    };

    return prepareData(data, 'UserGroup');
  },

  // G4 join_group
  join_group: (group) => {
    const data = {
      group_id: group,
    };

    return prepareData(data, 'join_group');
  },


  form_submit: (form) => {
    const data = {
      form_id: form?.id,
    };

    return prepareData(data, 'form_submit');
  },

  //GA4 product inquiry
  product_inquiry: (product) => {
    const data = {
      id: product?.id,
      name: product?.name,
    };

    return prepareData(data, 'product_inquiry');
  },

  //GA4 sign_up
  sign_up: (email, method = 'email') => {
    const data = {
      email: email,
      method: method,
    };

    return prepareData(data, 'sign_up');
  },

  //GA4 login
  login: (email, method = 'email') => {
    const data = {
      email: email,
      method: method,
    };

    return prepareData(data, 'login');
  },

  //GA4 login
  search: (search) => {
    const data = {
      search_term: search,
    };

    return prepareData(data, 'search');
  },
};

const getProductCategory = (product) => {
  if (!product) {
    return null;
  }
  const { categories } = product;
  let category = first(categories);
  if (!get(category, 'name', null)) {
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
